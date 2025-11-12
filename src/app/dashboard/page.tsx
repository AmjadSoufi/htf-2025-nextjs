"use client";

import { useEffect, useState } from "react";
import TimelineChart from "@/components/charts/TimelineChart";
import ProgressChart from "@/components/charts/ProgressChart";
import MonthlyStatsChart from "@/components/charts/MonthlyStatsChart";
import SightingsMap from "@/components/charts/SightingsMap";
import { fetchFishes } from "@/api/fish";
import { Fish } from "@/types/fish";

export default function DashboardPage() {
  const [fishes, setFishes] = useState<Fish[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await fetchFishes();
        if (mounted) setFishes(data);
      } catch (e) {
        console.error("Failed to load fishes for dashboard", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-xl font-bold">Sightings Dashboard</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <SightingsMap fishes={fishes ?? []} />
          {(() => {
            const payload = fishes
              ? fishes.map((f) => ({
                  id: f.id,
                  name: f.name,
                  sightings: [
                    f.latestSighting
                      ? {
                          timestamp: f.latestSighting.timestamp,
                          latitude: f.latestSighting.latitude,
                          longitude: f.latestSighting.longitude,
                        }
                      : {
                          timestamp: new Date().toISOString(),
                          latitude: 0,
                          longitude: 0,
                        },
                  ],
                }))
              : undefined;

            return (
              <>
                <div className="flex items-center justify-between">
                  <div />
                  <button
                    onClick={() => setShowDebug((s) => !s)}
                    className="text-xs px-2 py-1 rounded bg-[color-mix(in_srgb,var(--color-dark-navy)_85%,transparent)] border border-panel-border"
                  >
                    {showDebug ? "Hide debug" : "Show debug"}
                  </button>
                </div>

                <TimelineChart data={payload} />

                {showDebug && (
                  <pre className="mt-2 p-2 text-xs bg-[#071226] text-[#d1d5db] rounded max-h-64 overflow-auto">
                    {JSON.stringify(payload, null, 2)}
                  </pre>
                )}
              </>
            );
          })()}
        </div>

        <div className="space-y-4">
          <ProgressChart fishes={fishes ?? []} />
          <MonthlyStatsChart
            sightings={
              fishes
                ? (fishes.map((f) => f.latestSighting).filter(Boolean) as any)
                : undefined
            }
          />
        </div>
      </div>

      <div className="pt-4 text-xs text-text-secondary">
        {loading
          ? "Loading data from API..."
          : "Live data displayed where available."}
      </div>
    </div>
  );
}
