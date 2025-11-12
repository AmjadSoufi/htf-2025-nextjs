import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { calculatePoints, checkNewAchievements } from "@/lib/achievements";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      fishId,
      fishName,
      latitude,
      longitude,
      timestamp,
      imageData,
      rarity,
      verification,
      photoQuality,
      region,
    } = body;

    if (!fishId) {
      return new Response(JSON.stringify({ error: "Missing fishId" }), {
        status: 400,
      });
    }

    // Get user session
    const session = await auth.api.getSession({ headers: req.headers as any });
    const userId = session?.user?.id;

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
      verification: verification || null, // Store AI verification data
    };

    // write latest metadata for this fish (overwrites previous)
    const metaFile = path.join(uploadsDir, `${fishId}.json`);
    await fs.writeFile(metaFile, JSON.stringify(metadata, null, 2));

    // Award points and track sighting for logged-in users
    if (userId) {
      const isVerified = verification?.isValid || false;
      const verificationScore = verification?.confidence || 0;

      // Calculate points based on rarity, verification, and photo quality
      const points = calculatePoints(
        rarity || "COMMON",
        isVerified,
        photoQuality
      );

      // Save sighting to database
      const sightingId = randomUUID();
      await db.insert(schema.userSightings).values({
        id: sightingId,
        userId,
        fishId,
        fishName: fishName || "Unknown Fish",
        rarity: rarity || "COMMON",
        latitude: latitude || null,
        longitude: longitude || null,
        imageUrl,
        verified: isVerified,
        verificationScore,
        photoQuality: photoQuality || null,
        points,
        region: region || null,
        timestamp: new Date(timestamp || Date.now()),
        createdAt: new Date(),
      } as any);

      // Update user progress
      await updateUserProgress(
        userId,
        fishId,
        rarity || "COMMON",
        points,
        isVerified
      );
    }

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

// Update user progress with new sighting
async function updateUserProgress(
  userId: string,
  fishId: string,
  rarity: string,
  points: number,
  isVerified: boolean
) {
  try {
    // Get existing progress
    const existing = await db
      .select()
      .from(schema.userProgress)
      .where(eq(schema.userProgress.userId, userId));

    // Check if this is a new unique fish
    const existingSightings = await db
      .select()
      .from(schema.userSightings)
      .where(
        and(
          eq(schema.userSightings.userId, userId),
          eq(schema.userSightings.fishId, fishId)
        )
      );

    const isNewFish = existingSightings.length === 1; // Just added first one

    const computeXp = (r: string) => {
      const rUp = r.toUpperCase();
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

    const computeRank = (xp: number) => {
      if (xp >= 2000) return "Master";
      if (xp >= 500) return "Expert";
      if (xp >= 100) return "Intermediate";
      return "Beginner";
    };

    const xpToAdd = computeXp(rarity);
    const now = new Date();

    if (existing && existing.length > 0) {
      const current = existing[0];
      const newXp = (Number(current.xp) || 0) + xpToAdd;
      const newTotalPoints = (Number(current.totalPoints) || 0) + points;
      const newTotalSightings = (Number(current.totalSightings) || 0) + 1;
      const newUniqueFish = isNewFish
        ? (Number(current.uniqueFishSpotted) || 0) + 1
        : current.uniqueFishSpotted;
      const newRareFish =
        isNewFish && rarity.toUpperCase() === "RARE"
          ? (Number(current.rareFishSpotted) || 0) + 1
          : current.rareFishSpotted;
      const newEpicFish =
        isNewFish && rarity.toUpperCase() === "EPIC"
          ? (Number(current.epicFishSpotted) || 0) + 1
          : current.epicFishSpotted;
      const newVerifiedSightings = isVerified
        ? (Number(current.verifiedSightings) || 0) + 1
        : current.verifiedSightings;

      await db
        .update(schema.userProgress)
        .set({
          xp: newXp,
          rank: computeRank(newXp),
          totalPoints: newTotalPoints,
          totalSightings: newTotalSightings,
          uniqueFishSpotted: newUniqueFish,
          rareFishSpotted: newRareFish,
          epicFishSpotted: newEpicFish,
          verifiedSightings: newVerifiedSightings,
          updatedAt: now,
        })
        .where(eq(schema.userProgress.userId, userId));

      // Check for new achievements
      const stats = {
        totalSightings: newTotalSightings,
        uniqueFishSpotted: newUniqueFish,
        rareFishSpotted: newRareFish,
        epicFishSpotted: newEpicFish,
        verifiedSightings: newVerifiedSightings,
        totalPoints: newTotalPoints,
      };

      const currentAchievements = await db
        .select()
        .from(schema.userAchievements)
        .where(eq(schema.userAchievements.userId, userId));

      const currentAchievementIds = currentAchievements.map(
        (a) => a.achievementId
      );
      const newAchievements = checkNewAchievements(
        stats,
        currentAchievementIds
      );

      // Award new achievements
      for (const achievement of newAchievements) {
        await db.insert(schema.userAchievements).values({
          id: randomUUID(),
          userId,
          achievementId: achievement.id,
          achievementName: achievement.name,
          achievementDescription: achievement.description,
          achievementIcon: achievement.icon,
          achievementTier: achievement.tier,
          points: achievement.points,
          unlockedAt: now,
        } as any);
      }
    } else {
      // Create new progress entry
      const newRank = computeRank(xpToAdd);
      await db.insert(schema.userProgress).values({
        userId,
        xp: xpToAdd,
        rank: newRank,
        totalPoints: points,
        totalSightings: 1,
        uniqueFishSpotted: 1,
        rareFishSpotted: rarity.toUpperCase() === "RARE" ? 1 : 0,
        epicFishSpotted: rarity.toUpperCase() === "EPIC" ? 1 : 0,
        verifiedSightings: isVerified ? 1 : 0,
        updatedAt: now,
      } as any);

      // Check for first achievements
      const stats = {
        totalSightings: 1,
        uniqueFishSpotted: 1,
        rareFishSpotted: rarity.toUpperCase() === "RARE" ? 1 : 0,
        epicFishSpotted: rarity.toUpperCase() === "EPIC" ? 1 : 0,
        verifiedSightings: isVerified ? 1 : 0,
        totalPoints: points,
      };

      const newAchievements = checkNewAchievements(stats, []);

      // Award new achievements
      for (const achievement of newAchievements) {
        await db.insert(schema.userAchievements).values({
          id: randomUUID(),
          userId,
          achievementId: achievement.id,
          achievementName: achievement.name,
          achievementDescription: achievement.description,
          achievementIcon: achievement.icon,
          achievementTier: achievement.tier,
          points: achievement.points,
          unlockedAt: now,
        } as any);
      }
    }
  } catch (e) {
    console.error("updateUserProgress error:", e);
  }
}

export async function DELETE(req: Request) {
  try {
    // Get user session
    const session = await auth.api.getSession({ headers: req.headers as any });
    const userId = session?.user?.id;

    if (!userId) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
      });
    }

    // support fishId as query param or in JSON body
    const url = new URL(req.url);
    let fishId = url.searchParams.get("fishId");
    let sightingId = url.searchParams.get("sightingId");

    if (!fishId && !sightingId) {
      try {
        const b = await req.json();
        fishId = b?.fishId;
        sightingId = b?.sightingId;
      } catch (e) {
        // ignore
      }
    }

    if (!fishId && !sightingId) {
      return new Response(
        JSON.stringify({ error: "Missing fishId or sightingId" }),
        { status: 400 }
      );
    }

    // Find the sighting in database
    let sighting;
    if (sightingId) {
      const results = await db
        .select()
        .from(schema.userSightings)
        .where(
          and(
            eq(schema.userSightings.id, sightingId),
            eq(schema.userSightings.userId, userId)
          )
        );
      sighting = results[0];
    } else if (fishId) {
      // Get the most recent sighting for this fish
      const results = await db
        .select()
        .from(schema.userSightings)
        .where(
          and(
            eq(schema.userSightings.fishId, fishId),
            eq(schema.userSightings.userId, userId)
          )
        )
        .orderBy(schema.userSightings.timestamp)
        .limit(1);
      sighting = results[0];
    }

    if (!sighting) {
      return new Response(
        JSON.stringify({ success: false, message: "No sighting found" }),
        { status: 404 }
      );
    }

    // Reduce user progress
    await reduceUserProgress(
      userId,
      sighting.fishId,
      sighting.rarity,
      sighting.points,
      sighting.verified
    );

    // Delete sighting from database
    await db
      .delete(schema.userSightings)
      .where(eq(schema.userSightings.id, sighting.id));

    // Delete metadata file if it exists
    const metaFile = path.join(
      process.cwd(),
      "public",
      "uploads",
      `${sighting.fishId}.json`
    );
    try {
      await fs.unlink(metaFile);
    } catch (e) {
      // File might not exist, that's ok
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    console.error("/api/sightings DELETE error:", err);
    return new Response(
      JSON.stringify({ error: err?.message ?? String(err) }),
      { status: 500 }
    );
  }
}

// Reduce user progress when undoing a sighting
async function reduceUserProgress(
  userId: string,
  fishId: string,
  rarity: string,
  points: number,
  isVerified: boolean
) {
  try {
    // Get existing progress
    const existing = await db
      .select()
      .from(schema.userProgress)
      .where(eq(schema.userProgress.userId, userId));

    if (!existing || existing.length === 0) {
      return; // No progress to reduce
    }

    // Check if this was the last sighting of this fish
    const remainingSightings = await db
      .select()
      .from(schema.userSightings)
      .where(
        and(
          eq(schema.userSightings.userId, userId),
          eq(schema.userSightings.fishId, fishId)
        )
      );

    const wasLastOfThisFish = remainingSightings.length === 0;

    const computeXp = (r: string) => {
      const rUp = r.toUpperCase();
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

    const computeRank = (xp: number) => {
      if (xp >= 2000) return "Master";
      if (xp >= 500) return "Expert";
      if (xp >= 100) return "Intermediate";
      return "Beginner";
    };

    const xpToRemove = computeXp(rarity);
    const now = new Date();
    const current = existing[0];

    const newXp = Math.max(0, (Number(current.xp) || 0) - xpToRemove);
    const newTotalPoints = Math.max(
      0,
      (Number(current.totalPoints) || 0) - points
    );
    const newTotalSightings = Math.max(
      0,
      (Number(current.totalSightings) || 0) - 1
    );
    const newUniqueFish = wasLastOfThisFish
      ? Math.max(0, (Number(current.uniqueFishSpotted) || 0) - 1)
      : current.uniqueFishSpotted;
    const newRareFish =
      wasLastOfThisFish && rarity.toUpperCase() === "RARE"
        ? Math.max(0, (Number(current.rareFishSpotted) || 0) - 1)
        : current.rareFishSpotted;
    const newEpicFish =
      wasLastOfThisFish && rarity.toUpperCase() === "EPIC"
        ? Math.max(0, (Number(current.epicFishSpotted) || 0) - 1)
        : current.epicFishSpotted;
    const newVerifiedSightings = isVerified
      ? Math.max(0, (Number(current.verifiedSightings) || 0) - 1)
      : current.verifiedSightings;

    await db
      .update(schema.userProgress)
      .set({
        xp: newXp,
        rank: computeRank(newXp),
        totalPoints: newTotalPoints,
        totalSightings: newTotalSightings,
        uniqueFishSpotted: newUniqueFish,
        rareFishSpotted: newRareFish,
        epicFishSpotted: newEpicFish,
        verifiedSightings: newVerifiedSightings,
        updatedAt: now,
      })
      .where(eq(schema.userProgress.userId, userId));

    // Note: We're not removing achievements since they represent milestones
    // Once earned, they stay earned even if stats decrease
  } catch (err) {
    console.error("Error reducing user progress:", err);
    throw err;
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
