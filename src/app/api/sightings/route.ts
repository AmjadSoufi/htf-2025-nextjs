import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
  const body = await req.json();
  const { fishId, latitude, longitude, timestamp, imageData, rarity } = body;

    if (!fishId) {
      return new Response(JSON.stringify({ error: "Missing fishId" }), {
        status: 400,
      });
    }

  // imageData is optional now — if present we save the image and include imageUrl
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    let imageUrl: string | null = null;
    if (imageData) {
      // imageData is expected to be a data URL like: data:image/png;base64,....
      const match = String(imageData).match(
        /^data:(image\/(png|jpeg|jpg|webp));base64,(.*)$/
      );
      if (!match) {
        return new Response(
          JSON.stringify({
            error: "imageData must be a base64 data URL (png, jpeg, webp)",
          }),
          { status: 400 }
        );
      }

      const mime = match[1];
      const ext = mime.split("/")[1] === "jpeg" ? "jpg" : mime.split("/")[1];
      const base64 = match[3];

      const filename = `${Date.now()}-${randomUUID()}.${ext}`;
      const filePath = path.join(uploadsDir, filename);
      await fs.writeFile(filePath, Buffer.from(base64, "base64"));
      imageUrl = `/uploads/${filename}`;
    }

    const metadata = {
      id: randomUUID(),
      fishId,
      imageUrl,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      timestamp: timestamp ?? new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // write latest metadata for this fish (overwrites previous)
    const metaFile = path.join(uploadsDir, `${fishId}.json`);
    await fs.writeFile(metaFile, JSON.stringify(metadata, null, 2));

    // Compute XP based on fish rarity and award to the logged-in user (best-effort)
    const computeXpForRarity = (r?: string) => {
      const rUp = String(r ?? "").toUpperCase();
      switch (rUp) {
        case "EPIC":
          return 75;
        case "RARE":
          return 25;
        case "UNCOMMON":
          return 15;
        case "COMMON":
          return 5;
        default:
          return 10;
      }
    };

    const xpToAdd = computeXpForRarity(rarity);
    awardXpForUserIfPresent(req, xpToAdd).catch((e) => {
      // already logged inside helper, but guard any unexpected errors
      console.error("awardXpForUserIfPresent invocation error:", e);
    });

    return new Response(JSON.stringify({ success: true, metadata }), {
      status: 201,
    });
  } catch (err: any) {
    console.error("/api/sightings POST error:", err);
    return new Response(
      JSON.stringify({ error: err?.message ?? String(err) }),
      { status: 500 }
    );
  }
}

// Award XP to the logged in user when they mark a fish as seen.
// We keep a separate `user_progress` table and update/insert into it.
async function awardXpForUserIfPresent(req: Request, xpToAdd = 10) {
  try {
    // better-auth expects headers-like object
    const session = await auth.api.getSession({ headers: req.headers as any });
    const userId = session?.user?.id;
    if (!userId) return;

    // fetch existing progress
    const existing = await db
      .select()
      .from(schema.userProgress)
      .where(eq(schema.userProgress.userId, userId));

    const computeRank = (xp: number) => {
      if (xp >= 2000) return "Master";
      if (xp >= 500) return "Expert";
      if (xp >= 100) return "Intermediate";
      return "Beginner";
    };

    const now = new Date();
    if (existing && existing.length > 0) {
      const current = existing[0];
      const newXp = (Number(current.xp) || 0) + xpToAdd;
      const newRank = computeRank(newXp);
      await db
        .update(schema.userProgress)
        .set({ xp: newXp, rank: newRank, updatedAt: now })
        .where(eq(schema.userProgress.userId, userId));
    } else {
      const newRank = computeRank(xpToAdd);
      await db.insert(schema.userProgress).values({
        userId,
        xp: xpToAdd,
        rank: newRank,
        updatedAt: now,
      } as any);
    }
  } catch (e) {
    // award XP is best-effort — don't block the main response
    console.error("awardXpForUserIfPresent error:", e);
  }
}

export async function DELETE(req: Request) {
  try {
    // support fishId as query param or in JSON body
    const url = new URL(req.url);
    let fishId = url.searchParams.get("fishId");
    if (!fishId) {
      try {
        const b = await req.json();
        fishId = b?.fishId;
      } catch (e) {
        // ignore
      }
    }
    if (!fishId) {
      return new Response(JSON.stringify({ error: "Missing fishId" }), {
        status: 400,
      });
    }

    const metaFile = path.join(
      process.cwd(),
      "public",
      "uploads",
      `${fishId}.json`
    );
    try {
      await fs.unlink(metaFile);
      // Revoke XP for the logged-in user (best-effort) when they undo a sighting
      // compute xp to subtract based on optional rarity query param or body
      const rarityParam = url.searchParams.get("rarity");
      let xpToSubtract = 10;
      if (rarityParam) {
        const rUp = String(rarityParam).toUpperCase();
        if (rUp === "EPIC") xpToSubtract = 75;
        else if (rUp === "RARE") xpToSubtract = 25;
        else if (rUp === "UNCOMMON") xpToSubtract = 15;
        else if (rUp === "COMMON") xpToSubtract = 5;
      }
      revokeXpForUserIfPresent(req, xpToSubtract).catch((e) => {
        console.error("revokeXpForUserIfPresent invocation error:", e);
      });

      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (e) {
      return new Response(
        JSON.stringify({ success: false, message: "No sighting found" }),
        { status: 404 }
      );
    }
  } catch (err: any) {
    console.error("/api/sightings DELETE error:", err);
    return new Response(
      JSON.stringify({ error: err?.message ?? String(err) }),
      { status: 500 }
    );
  }
}

// Revoke XP (subtract) from the logged in user when they undo a sighting.
// Best-effort: won't block or throw to the main handler.
async function revokeXpForUserIfPresent(req: Request, xpToSubtract = 10) {
  try {
    const session = await auth.api.getSession({ headers: req.headers as any });
    const userId = session?.user?.id;
    if (!userId) return;

    const existing = await db
      .select()
      .from(schema.userProgress)
      .where(eq(schema.userProgress.userId, userId));

    const computeRank = (xp: number) => {
      if (xp >= 2000) return "Master";
      if (xp >= 500) return "Expert";
      if (xp >= 100) return "Intermediate";
      return "Beginner";
    };

    const now = new Date();
    if (existing && existing.length > 0) {
      const current = existing[0];
      const newXp = Math.max(0, (Number(current.xp) || 0) - xpToSubtract);
      const newRank = computeRank(newXp);
      await db
        .update(schema.userProgress)
        .set({ xp: newXp, rank: newRank, updatedAt: now })
        .where(eq(schema.userProgress.userId, userId));
    }
  } catch (e) {
    console.error("revokeXpForUserIfPresent error:", e);
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const fishId = url.searchParams.get("fishId");
    if (!fishId) {
      return new Response(JSON.stringify({ error: "Missing fishId" }), {
        status: 400,
      });
    }

    const metaFile = path.join(
      process.cwd(),
      "public",
      "uploads",
      `${fishId}.json`
    );
    try {
      const contents = await fs.readFile(metaFile, "utf-8");
      const data = JSON.parse(contents);
      return new Response(JSON.stringify({ success: true, data }), {
        status: 200,
      });
    } catch (e) {
      return new Response(
        JSON.stringify({ success: false, message: "No sighting found" }),
        { status: 404 }
      );
    }
  } catch (err: any) {
    console.error("/api/sightings GET error:", err);
    return new Response(
      JSON.stringify({ error: err?.message ?? String(err) }),
      { status: 500 }
    );
  }
}
