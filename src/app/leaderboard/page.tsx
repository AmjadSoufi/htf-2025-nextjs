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
        return "text-purple-600 font-bold";
      case "Expert":
        return "text-blue-600 font-semibold";
      case "Intermediate":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-cyan-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            🏆 Leaderboard
          </h1>
          <p className="text-gray-600">
            Compete with other fish spotters around the world!
          </p>
        </div>

        {/* Period Filter */}
        <div className="flex justify-center gap-2 mb-8">
          {(["weekly", "monthly", "all-time"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                period === p
                  ? "bg-blue-600 text-white shadow-lg scale-105"
                  : "bg-white text-gray-700 hover:bg-gray-100"
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <div className="bg-linear-to-r from-yellow-50 to-orange-50 p-8">
                <div className="flex justify-center items-end gap-4 max-w-3xl mx-auto">
                  {/* 2nd Place */}
                  <div className="flex-1 text-center">
                    <div className="bg-gray-200 rounded-t-lg p-4 h-32 flex flex-col justify-end">
                      <div className="text-4xl mb-2">🥈</div>
                      <div className="font-bold text-gray-800">
                        {leaderboard[1].name}
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {leaderboard[1].totalPoints}
                      </div>
                      <div className="text-sm text-gray-600">
                        {leaderboard[1].uniqueFishSpotted} fish
                      </div>
                    </div>
                  </div>

                  {/* 1st Place */}
                  <div className="flex-1 text-center">
                    <div className="bg-linear-to-b from-yellow-200 to-yellow-300 rounded-t-lg p-4 h-40 flex flex-col justify-end shadow-lg">
                      <div className="text-5xl mb-2">🥇</div>
                      <div className="font-bold text-gray-800 text-lg">
                        {leaderboard[0].name}
                      </div>
                      <div className="text-3xl font-bold text-yellow-700">
                        {leaderboard[0].totalPoints}
                      </div>
                      <div className="text-sm text-gray-700">
                        {leaderboard[0].uniqueFishSpotted} fish
                      </div>
                    </div>
                  </div>

                  {/* 3rd Place */}
                  <div className="flex-1 text-center">
                    <div className="bg-orange-200 rounded-t-lg p-4 h-24 flex flex-col justify-end">
                      <div className="text-3xl mb-2">🥉</div>
                      <div className="font-bold text-gray-800">
                        {leaderboard[2].name}
                      </div>
                      <div className="text-xl font-bold text-orange-600">
                        {leaderboard[2].totalPoints}
                      </div>
                      <div className="text-sm text-gray-600">
                        {leaderboard[2].uniqueFishSpotted} fish
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rest of Leaderboard */}
            <div className="divide-y divide-gray-200">
              {leaderboard.map((entry, idx) => {
                const isCurrentUser = session?.user?.id === entry.userId;
                return (
                  <div
                    key={entry.userId}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      isCurrentUser
                        ? "bg-blue-50 border-l-4 border-blue-600"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Position */}
                      <div className="w-16 text-center">
                        <div className="text-2xl font-bold">
                          {getMedalEmoji(entry.position)}
                        </div>
                      </div>

                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold text-lg">
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
                        <div className="font-bold text-gray-800 flex items-center gap-2">
                          {entry.name}
                          {isCurrentUser && (
                            <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
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
                        <div className="text-2xl font-bold text-blue-600">
                          {entry.totalPoints}
                        </div>
                        <div className="text-xs text-gray-500">points</div>
                      </div>

                      {/* Stats */}
                      <div className="hidden md:flex gap-4 text-center">
                        {entry.rareFishSpotted !== undefined && (
                          <div>
                            <div className="text-lg font-bold text-orange-600">
                              {entry.rareFishSpotted}
                            </div>
                            <div className="text-xs text-gray-500">⭐ Rare</div>
                          </div>
                        )}
                        {entry.epicFishSpotted !== undefined && (
                          <div>
                            <div className="text-lg font-bold text-purple-600">
                              {entry.epicFishSpotted}
                            </div>
                            <div className="text-xs text-gray-500">💎 Epic</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {leaderboard.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No data available for this period.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
