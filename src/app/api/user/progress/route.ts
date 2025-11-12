import { auth } from "@/lib/auth";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers as any });
    const userId = session?.user?.id;
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const rows = await db
      .select()
      .from(schema.userProgress)
      .where(eq(schema.userProgress.userId, userId));

    if (!rows || rows.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            xp: 0,
            rank: "Beginner",
            totalPoints: 0,
            uniqueFishSpotted: 0,
            totalSightings: 0,
            rareFishSpotted: 0,
            epicFishSpotted: 0,
            verifiedSightings: 0,
          },
        }),
        { status: 200 }
      );
    }

    const row = rows[0];
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          xp: Number(row.xp) || 0,
          rank: row.rank,
          totalPoints: Number(row.totalPoints) || 0,
          uniqueFishSpotted: Number(row.uniqueFishSpotted) || 0,
          totalSightings: Number(row.totalSightings) || 0,
          rareFishSpotted: Number(row.rareFishSpotted) || 0,
          epicFishSpotted: Number(row.epicFishSpotted) || 0,
          verifiedSightings: Number(row.verifiedSightings) || 0,
        },
      }),
      { status: 200 }
    );
  } catch (err: any) {
    console.error("/api/user/progress GET error:", err);
    return new Response(
      JSON.stringify({ error: String(err?.message ?? err) }),
      {
        status: 500,
      }
    );
  }
}
