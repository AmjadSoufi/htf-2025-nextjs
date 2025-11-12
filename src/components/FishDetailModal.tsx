"use client";

import { Fish } from "@/types/fish";
import React from "react";
import HistoricalDataChart from "./HistoricalDataChart";
import HistoricalSightingsMap from "./HistoricalSightingsMap";

interface Props {
  fish: Fish;
  open: boolean;
  onClose: () => void;
  historical: any | null;
}

export default function FishDetailModal({
  fish,
  open,
  onClose,
  historical,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative max-w-5xl w-full bg-[color-mix(in_srgb,var(--color-dark-navy)_92%,transparent)] border-2 border-panel-border rounded-lg shadow-[--shadow-cockpit] p-4 mx-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-lg font-bold text-sonar-green">
              {fish.name}
            </div>
            <div className="text-xs text-text-secondary">ID: {fish.id}</div>
          </div>
          <div>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-panel-border rounded"
            >
              Close
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-72 bg-panel-bg border border-panel-border rounded p-2">
            <HistoricalSightingsMap
              fish={fish}
              sightings={historical?.sightings ?? null}
            />
          </div>
          <div className="h-72 bg-panel-bg border border-panel-border rounded p-2 flex flex-col">
            <HistoricalDataChart sightings={historical?.sightings ?? null} />

            <div className="mt-3 text-xs text-text-secondary">
              <div>Insights:</div>
              {historical?.insights ? (
                <ul className="list-disc pl-5">
                  <li>Total sightings: {historical.insights.totalSightings}</li>
                  <li>
                    Distance (m): {historical.insights.totalDistanceMeters}
                  </li>
                  <li>First seen: {historical.insights.firstSeen}</li>
                  <li>Last seen: {historical.insights.lastSeen}</li>
                  <li>
                    Bounding box:{" "}
                    {`${historical.insights.bbox.minLat.toFixed(
                      3
                    )}, ${historical.insights.bbox.minLon.toFixed(
                      3
                    )} - ${historical.insights.bbox.maxLat.toFixed(
                      3
                    )}, ${historical.insights.bbox.maxLon.toFixed(3)}`}
                  </li>
                </ul>
              ) : (
                <div>No historical insights available.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
