"use client";

import React from "react";
import { Fish } from "@/types/fish";

interface Props {
  sightings: Array<{
    timestamp: string;
    latitude: number;
    longitude: number;
  }> | null;
}

// Very small sparkline-like chart that plots sighting index over time
export default function HistoricalDataChart({ sightings }: Props) {
  if (!sightings || sightings.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-secondary">
        No historical sighting data
      </div>
    );
  }

  // prepare points
  const times = sightings.map((s) => new Date(s.timestamp).getTime());
  const minT = Math.min(...times);
  const maxT = Math.max(...times);

  const width = 400;
  const height = 140;

  const points = sightings.map((s, i) => {
    const t = new Date(s.timestamp).getTime();
    const x = ((t - minT) / (maxT - minT || 1)) * (width - 20) + 10;
    const y = height - (i / (sightings.length - 1 || 1)) * (height - 20) - 10;
    return `${x},${y}`;
  });

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36">
        <polyline
          fill="none"
          stroke="#34D399"
          strokeWidth={2}
          points={points.join(" ")}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {sightings.map((s, i) => {
          const [xStr, yStr] = points[i].split(",");
          return (
            <circle
              key={i}
              cx={Number(xStr)}
              cy={Number(yStr)}
              r={3}
              fill="#10B981"
            />
          );
        })}
      </svg>
      <div className="text-xs text-text-secondary mt-1">
        Sightings over time
      </div>
    </div>
  );
}
