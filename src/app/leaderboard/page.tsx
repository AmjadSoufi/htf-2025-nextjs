"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";

interface LeaderboardEntry {
  position: number;
  userId: string;
  name: string;
  image: string | null;
  totalPoints: number;
  xp?: number;
  rank?: string;
  uniqueFishSpotted: number;
  totalSightings: number;
  rareFishSpotted?: number;
  epicFishSpotted?: number;
  verifiedSightings?: number;
}

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [period, setPeriod] = useState<"weekly" | "monthly" | "all-time">(
    "all-time"
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?period=${period}`);
      const data = await res.json();
      if (data.success) {
        setLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (position: number) => {
    switch (position) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${position}`;
    }
  };

  const getRankColor = (rank?: string) => {
    switch (rank) {
      case "Master":
        return "text-danger-red font-bold";
      case "Expert":
        return "text-sonar-green font-semibold";
      case "Intermediate":
        return "text-warning-amber";
      default:
        return "text-text-secondary";
    }
  };

  return (
    <div className="min-h-screen bg-deep-ocean p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
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
          <h1 className="text-4xl md:text-5xl font-bold text-sonar-green mb-2 [text-shadow:--shadow-glow-text]">
            🏆 Leaderboard
          </h1>
          <p className="text-text-secondary">
            Compete with other fish spotters around the world!
          </p>
        </div>

        {/* Period Filter */}
        <div className="flex justify-center gap-2 mb-8">
          {(["weekly", "monthly", "all-time"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-6 py-2 rounded-lg font-medium transition-all border ${
                period === p
                  ? "bg-sonar-green/20 text-sonar-green border-sonar-green shadow-[--shadow-glow-common]"
                  : "bg-dark-navy text-text-secondary border-panel-border hover:bg-nautical-blue"
              }`}
            >
              {p === "all-time"
                ? "All Time"
                : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {/* Leaderboard */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sonar-green mx-auto"></div>
          </div>
        ) : (
          <div className="bg-dark-navy/50 backdrop-blur-lg rounded-2xl shadow-[--shadow-cockpit] overflow-hidden border border-panel-border">
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <div className="bg-nautical-blue/30 p-8 border-b border-panel-border">
                <div className="flex justify-center items-end gap-4 max-w-3xl mx-auto">
                  {/* 2nd Place */}
                  <div className="flex-1 text-center">
                    <div className="bg-dark-navy/80 border border-panel-border rounded-t-lg p-4 h-32 flex flex-col justify-end">
                      <div className="text-4xl mb-2">🥈</div>
                      <div className="font-bold text-text-primary">
                        {leaderboard[1].name}
                      </div>
                      <div className="text-2xl font-bold text-text-secondary">
                        {leaderboard[1].totalPoints}
                      </div>
                      <div className="text-sm text-text-secondary">
                        {leaderboard[1].uniqueFishSpotted} fish
                      </div>
                    </div>
                  </div>

                  {/* 1st Place */}
                  <div className="flex-1 text-center">
                    <div className="bg-sonar-green/10 border-2 border-sonar-green rounded-t-lg p-4 h-40 flex flex-col justify-end shadow-[--shadow-glow-common]">
                      <div className="text-5xl mb-2">🥇</div>
                      <div className="font-bold text-sonar-green text-lg">
                        {leaderboard[0].name}
                      </div>
                      <div className="text-3xl font-bold text-sonar-green">
                        {leaderboard[0].totalPoints}
                      </div>
                      <div className="text-sm text-text-secondary">
                        {leaderboard[0].uniqueFishSpotted} fish
                      </div>
                    </div>
                  </div>

                  {/* 3rd Place */}
                  <div className="flex-1 text-center">
                    <div className="bg-dark-navy/80 border border-panel-border rounded-t-lg p-4 h-24 flex flex-col justify-end">
                      <div className="text-3xl mb-2">🥉</div>
                      <div className="font-bold text-text-primary">
                        {leaderboard[2].name}
                      </div>
                      <div className="text-xl font-bold text-warning-amber">
                        {leaderboard[2].totalPoints}
                      </div>
                      <div className="text-sm text-text-secondary">
                        {leaderboard[2].uniqueFishSpotted} fish
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rest of Leaderboard */}
            <div className="divide-y divide-panel-border">
              {leaderboard.map((entry, idx) => {
                const isCurrentUser = session?.user?.id === entry.userId;
                return (
                  <div
                    key={entry.userId}
                    className={`p-4 hover:bg-nautical-blue/30 transition-colors ${
                      isCurrentUser
                        ? "bg-sonar-green/10 border-l-4 border-sonar-green"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Position */}
                      <div className="w-16 text-center">
                        <div className="text-2xl font-bold text-text-primary">
                          {getMedalEmoji(entry.position)}
                        </div>
                      </div>

                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-ocean-teal to-sonar-green flex items-center justify-center text-dark-navy font-bold text-lg border border-panel-border">
                        {entry.image ? (
                          <img
                            src={entry.image}
                            alt={entry.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          entry.name.charAt(0).toUpperCase()
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1">
                        <div className="font-bold text-text-primary flex items-center gap-2">
                          {entry.name}
                          {isCurrentUser && (
                            <span className="text-xs bg-sonar-green text-dark-navy px-2 py-0.5 rounded font-bold">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-text-secondary">
                          {entry.rank && (
                            <span className={getRankColor(entry.rank)}>
                              {entry.rank}
                            </span>
                          )}{" "}
                          • {entry.uniqueFishSpotted} unique fish •{" "}
                          {entry.totalSightings} sightings
                        </div>
                      </div>

                      {/* Points */}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-sonar-green">
                          {entry.totalPoints}
                        </div>
                        <div className="text-xs text-text-secondary">
                          points
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="hidden md:flex gap-4 text-center">
                        {entry.rareFishSpotted !== undefined && (
                          <div>
                            <div className="text-lg font-bold text-warning-amber">
                              {entry.rareFishSpotted}
                            </div>
                            <div className="text-xs text-text-secondary">
                              ⭐ Rare
                            </div>
                          </div>
                        )}
                        {entry.epicFishSpotted !== undefined && (
                          <div>
                            <div className="text-lg font-bold text-danger-red">
                              {entry.epicFishSpotted}
                            </div>
                            <div className="text-xs text-text-secondary">
                              💎 Epic
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {leaderboard.length === 0 && (
              <div className="text-center py-12 text-text-secondary">
                No data available for this period.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
