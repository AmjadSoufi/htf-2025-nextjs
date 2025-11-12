import { db } from "@/db";
import * as schema from "@/db/schema";
import { desc, eq, gte, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const period = url.searchParams.get("period") || "all-time";
    const region = url.searchParams.get("region");
    const limit = parseInt(url.searchParams.get("limit") || "100");

    // Calculate time threshold based on period
    let timeThreshold: Date | null = null;
    const now = new Date();

    switch (period) {
      case "weekly":
        timeThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "monthly":
        timeThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "all-time":
      default:
        timeThreshold = null;
        break;
    }

    // Build leaderboard query
    const leaderboardQuery = db
      .select({
        userId: schema.user.id,
        name: schema.user.name,
        image: schema.user.image,
        totalPoints: schema.userProgress.totalPoints,
        xp: schema.userProgress.xp,
        rank: schema.userProgress.rank,
        uniqueFishSpotted: schema.userProgress.uniqueFishSpotted,
        totalSightings: schema.userProgress.totalSightings,
        rareFishSpotted: schema.userProgress.rareFishSpotted,
        epicFishSpotted: schema.userProgress.epicFishSpotted,
        verifiedSightings: schema.userProgress.verifiedSightings,
      })
      .from(schema.userProgress)
      .innerJoin(schema.user, eq(schema.userProgress.userId, schema.user.id))
      .orderBy(desc(schema.userProgress.totalPoints))
      .limit(limit);

    const leaderboard = await leaderboardQuery;

    // If period-specific or region-specific, we need to recalculate from sightings
    if (timeThreshold || region) {
      // Query sightings with filters
      const sightingsQuery = db
        .select({
          userId: schema.userSightings.userId,
          userName: schema.user.name,
          userImage: schema.user.image,
          totalPoints: sql<number>`SUM(${schema.userSightings.points})`,
          totalSightings: sql<number>`COUNT(*)`,
          uniqueFish: sql<number>`COUNT(DISTINCT ${schema.userSightings.fishId})`,
        })
        .from(schema.userSightings)
        .innerJoin(schema.user, eq(schema.userSightings.userId, schema.user.id))
        .$dynamic();

      // Apply filters
      if (timeThreshold) {
        sightingsQuery.where(
          gte(schema.userSightings.timestamp, timeThreshold)
        );
      }
      if (region) {
        sightingsQuery.where(eq(schema.userSightings.region, region));
      }

      const periodLeaderboard = await sightingsQuery
        .groupBy(
          schema.userSightings.userId,
          schema.user.name,
          schema.user.image
        )
        .orderBy(desc(sql`SUM(${schema.userSightings.points})`))
        .limit(limit);

      // Format the response
      const formattedLeaderboard = periodLeaderboard.map((entry, index) => ({
        position: index + 1,
        userId: entry.userId,
        name: entry.userName,
        image: entry.userImage,
        totalPoints: Number(entry.totalPoints) || 0,
        uniqueFishSpotted: Number(entry.uniqueFish) || 0,
        totalSightings: Number(entry.totalSightings) || 0,
      }));

      return new Response(
        JSON.stringify({
          success: true,
          period,
          region: region || "all",
          leaderboard: formattedLeaderboard,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // All-time leaderboard (no filters)
    const formattedLeaderboard = leaderboard.map((entry, index) => ({
      position: index + 1,
      userId: entry.userId,
      name: entry.name,
      image: entry.image,
      totalPoints: entry.totalPoints,
      xp: entry.xp,
      rank: entry.rank,
      uniqueFishSpotted: entry.uniqueFishSpotted,
      totalSightings: entry.totalSightings,
      rareFishSpotted: entry.rareFishSpotted,
      epicFishSpotted: entry.epicFishSpotted,
      verifiedSightings: entry.verifiedSightings,
    }));

    return new Response(
      JSON.stringify({
        success: true,
        period,
        region: "all",
        leaderboard: formattedLeaderboard,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("/api/leaderboard GET error:", err);
    return new Response(
      JSON.stringify({ error: err?.message ?? String(err) }),
      { status: 500 }
    );
  }
}
