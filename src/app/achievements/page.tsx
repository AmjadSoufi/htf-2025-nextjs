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
        return "from-danger-red to-warning-amber";
      case "GOLD":
        return "from-warning-amber to-sonar-green";
      case "SILVER":
        return "from-text-secondary to-ocean-teal";
      case "BRONZE":
        return "from-warning-amber to-nautical-blue";
      default:
        return "from-panel-border to-dark-navy";
    }
  };

  const getTierBorder = (tier: string) => {
    switch (tier) {
      case "PLATINUM":
        return "border-danger-red";
      case "GOLD":
        return "border-warning-amber";
      case "SILVER":
        return "border-ocean-teal";
      case "BRONZE":
        return "border-warning-amber";
      default:
        return "border-panel-border";
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
      <div className="min-h-screen bg-deep-ocean flex items-center justify-center p-4">
        <div className="bg-dark-navy/80 backdrop-blur-lg p-8 rounded-2xl shadow-[--shadow-cockpit] text-center border border-panel-border">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Sign In Required
          </h2>
          <p className="text-text-secondary mb-4">
            Please sign in to view your achievements
          </p>
          <a
            href="/login"
            className="inline-block px-6 py-2 bg-sonar-green/20 hover:bg-sonar-green/30 text-sonar-green border border-sonar-green rounded-lg transition-all shadow-[--shadow-glow-common]"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-ocean p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <a
          href="/"
          className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-dark-navy hover:bg-nautical-blue text-sonar-green rounded-lg shadow-[--shadow-cockpit-border] transition-all font-medium border border-panel-border"
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
          <h1 className="text-4xl md:text-5xl font-bold text-sonar-green mb-2 text-shadow-[--shadow-glow-text]">
            🏅 Achievements
          </h1>
          <p className="text-text-secondary">
            Track your progress and unlock rewards!
          </p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-dark-navy/50 backdrop-blur-lg rounded-xl p-4 shadow-[--shadow-cockpit-border] text-center border border-panel-border">
              <div className="text-3xl font-bold text-sonar-green">
                {unlockedCount}/{achievements.length}
              </div>
              <div className="text-sm text-text-secondary">Achievements</div>
            </div>
            <div className="bg-dark-navy/50 backdrop-blur-lg rounded-xl p-4 shadow-[--shadow-cockpit-border] text-center border border-panel-border">
              <div className="text-3xl font-bold text-warning-amber">
                {totalPoints}
              </div>
              <div className="text-sm text-text-secondary">
                Achievement Points
              </div>
            </div>
            <div className="bg-dark-navy/50 backdrop-blur-lg rounded-xl p-4 shadow-[--shadow-cockpit-border] text-center border border-panel-border">
              <div className="text-3xl font-bold text-ocean-teal">
                {stats.uniqueFishSpotted}
              </div>
              <div className="text-sm text-text-secondary">Unique Fish</div>
            </div>
            <div className="bg-dark-navy/50 backdrop-blur-lg rounded-xl p-4 shadow-[--shadow-cockpit-border] text-center border border-panel-border">
              <div className="text-3xl font-bold text-text-primary">
                {stats.totalSightings}
              </div>
              <div className="text-sm text-text-secondary">Total Sightings</div>
            </div>
          </div>
        )}

        {/* Tier Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {["ALL", "PLATINUM", "GOLD", "SILVER", "BRONZE"].map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`px-4 py-2 rounded-lg font-medium transition-all border ${
                selectedTier === tier
                  ? "bg-sonar-green/20 text-sonar-green border-sonar-green shadow-[--shadow-glow-common]"
                  : "bg-dark-navy text-text-secondary border-panel-border hover:bg-nautical-blue"
              }`}
            >
              {tier}
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sonar-green mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`bg-dark-navy/50 backdrop-blur-lg rounded-xl shadow-[--shadow-cockpit-border] overflow-hidden transition-all hover:scale-105 border ${
                  achievement.unlocked
                    ? `border-2 ${getTierBorder(
                        achievement.tier
                      )} shadow-[--shadow-glow-common]`
                    : "opacity-60 border-panel-border"
                }`}
              >
                {/* Tier Badge */}
                <div
                  className={`bg-linear-to-r ${getTierColor(
                    achievement.tier
                  )} p-2 text-center border-b border-panel-border`}
                >
                  <span className="text-xs font-bold text-dark-navy">
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
                    <h3 className="text-xl font-bold text-text-primary">
                      {achievement.name}
                    </h3>
                  </div>

                  <p className="text-sm text-text-secondary text-center mb-4">
                    {achievement.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <div className="text-lg font-bold text-sonar-green">
                        +{achievement.points}
                      </div>
                      <div className="text-xs text-text-secondary">points</div>
                    </div>

                    {achievement.unlocked ? (
                      <div className="flex items-center gap-2 text-sonar-green">
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
                      <div className="flex items-center gap-2 text-text-secondary">
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
                    <div className="mt-3 pt-3 border-t border-panel-border text-center">
                      <div className="text-xs text-text-secondary">
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
          <div className="text-center py-12 text-text-secondary">
            No achievements found for this tier.
          </div>
        )}
      </div>
    </div>
  );
}
