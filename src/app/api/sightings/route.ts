import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fishId, latitude, longitude, timestamp, imageData } = body;

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
