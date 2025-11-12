"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  points: number;
  unlocked: boolean;
  unlockedAt: Date | null;
  progress: number;
}

interface Stats {
  totalSightings: number;
  uniqueFishSpotted: number;
  rareFishSpotted: number;
  epicFishSpotted: number;
  verifiedSightings: number;
  totalPoints: number;
}

export default function AchievementsPage() {
  const { data: session } = useSession();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<string>("ALL");

  useEffect(() => {
    if (session) {
      fetchAchievements();
    }
  }, [session]);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/achievements");
      const data = await res.json();
      if (data.success) {
        setAchievements(data.achievements);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching achievements:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "PLATINUM":
        return "from-purple-400 to-pink-400";
      case "GOLD":
        return "from-yellow-400 to-orange-400";
      case "SILVER":
        return "from-gray-300 to-gray-400";
      case "BRONZE":
        return "from-orange-300 to-orange-500";
      default:
        return "from-gray-200 to-gray-300";
    }
  };

  const getTierBorder = (tier: string) => {
    switch (tier) {
      case "PLATINUM":
        return "border-purple-500";
      case "GOLD":
        return "border-yellow-500";
      case "SILVER":
        return "border-gray-400";
      case "BRONZE":
        return "border-orange-500";
      default:
        return "border-gray-300";
    }
  };

  const filteredAchievements =
    selectedTier === "ALL"
      ? achievements
      : achievements.filter((a) => a.tier === selectedTier);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalPoints = achievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + a.points, 0);

  if (!session) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Sign In Required
          </h2>
          <p className="text-gray-600 mb-4">
            Please sign in to view your achievements
          </p>
          <a
            href="/login"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-cyan-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <a
          href="/"
          className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 rounded-lg shadow-md transition-all font-medium"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Tracker
        </a>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            🏅 Achievements
          </h1>
          <p className="text-gray-600">
            Track your progress and unlock rewards!
          </p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-lg text-center">
              <div className="text-3xl font-bold text-blue-600">
                {unlockedCount}/{achievements.length}
              </div>
              <div className="text-sm text-gray-600">Achievements</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg text-center">
              <div className="text-3xl font-bold text-green-600">
                {totalPoints}
              </div>
              <div className="text-sm text-gray-600">Achievement Points</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg text-center">
              <div className="text-3xl font-bold text-purple-600">
                {stats.uniqueFishSpotted}
              </div>
              <div className="text-sm text-gray-600">Unique Fish</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg text-center">
              <div className="text-3xl font-bold text-orange-600">
                {stats.totalSightings}
              </div>
              <div className="text-sm text-gray-600">Total Sightings</div>
            </div>
          </div>
        )}

        {/* Tier Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {["ALL", "PLATINUM", "GOLD", "SILVER", "BRONZE"].map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedTier === tier
                  ? "bg-blue-600 text-white shadow-lg scale-105"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tier}
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all hover:scale-105 ${
                  achievement.unlocked
                    ? `border-2 ${getTierBorder(achievement.tier)}`
                    : "opacity-60"
                }`}
              >
                {/* Tier Badge */}
                <div
                  className={`bg-linear-to-r ${getTierColor(
                    achievement.tier
                  )} p-2 text-center`}
                >
                  <span className="text-xs font-bold text-white">
                    {achievement.tier}
                  </span>
                </div>

                {/* Achievement Content */}
                <div className="p-6">
                  <div className="text-center mb-4">
                    <div
                      className={`text-6xl mb-2 ${
                        achievement.unlocked ? "" : "grayscale"
                      }`}
                    >
                      {achievement.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {achievement.name}
                    </h3>
                  </div>

                  <p className="text-sm text-gray-600 text-center mb-4">
                    {achievement.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">
                        +{achievement.points}
                      </div>
                      <div className="text-xs text-gray-500">points</div>
                    </div>

                    {achievement.unlocked ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="font-medium">Unlocked!</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                        <span className="font-medium">Locked</span>
                      </div>
                    )}
                  </div>

                  {achievement.unlocked && achievement.unlockedAt && (
                    <div className="mt-3 pt-3 border-t border-gray-200 text-center">
                      <div className="text-xs text-gray-500">
                        Unlocked on{" "}
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredAchievements.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            No achievements found for this tier.
          </div>
        )}
      </div>
    </div>
  );
}
