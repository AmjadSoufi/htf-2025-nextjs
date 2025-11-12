import { db } from "@/db";
import * as schema from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { ACHIEVEMENTS } from "@/lib/achievements";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers as any });
    const userId = session?.user?.id;

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    // Get user's unlocked achievements
    const userAchievements = await db
      .select()
      .from(schema.userAchievements)
      .where(eq(schema.userAchievements.userId, userId))
      .orderBy(schema.userAchievements.unlockedAt);

    // Get user progress for checking locked achievements
    const userProgress = await db
      .select()
      .from(schema.userProgress)
      .where(eq(schema.userProgress.userId, userId));

    const stats = userProgress[0] || {
      totalSightings: 0,
      uniqueFishSpotted: 0,
      rareFishSpotted: 0,
      epicFishSpotted: 0,
      verifiedSightings: 0,
      totalPoints: 0,
    };

    const unlockedIds = new Set(userAchievements.map((a) => a.achievementId));

    // Build response with all achievements
    const allAchievements = ACHIEVEMENTS.map((achievement) => {
      const unlocked = unlockedIds.has(achievement.id);
      const userAch = userAchievements.find(
        (a) => a.achievementId === achievement.id
      );
      const progress = achievement.requirement(stats);

      return {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        tier: achievement.tier,
        points: achievement.points,
        unlocked,
        unlockedAt: userAch?.unlockedAt || null,
        progress: unlocked ? 100 : progress ? 100 : 0,
      };
    });

    // Group by tier
    const achievementsByTier = {
      PLATINUM: allAchievements.filter((a) => a.tier === "PLATINUM"),
      GOLD: allAchievements.filter((a) => a.tier === "GOLD"),
      SILVER: allAchievements.filter((a) => a.tier === "SILVER"),
      BRONZE: allAchievements.filter((a) => a.tier === "BRONZE"),
    };

    const totalUnlocked = allAchievements.filter((a) => a.unlocked).length;
    const totalPoints = userAchievements.reduce((sum, a) => sum + a.points, 0);

    return new Response(
      JSON.stringify({
        success: true,
        stats,
        achievements: allAchievements,
        achievementsByTier,
        summary: {
          total: ACHIEVEMENTS.length,
          unlocked: totalUnlocked,
          locked: ACHIEVEMENTS.length - totalUnlocked,
          totalPoints,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("/api/achievements GET error:", err);
    return new Response(
      JSON.stringify({ error: err?.message ?? String(err) }),
      { status: 500 }
    );
  }
}
