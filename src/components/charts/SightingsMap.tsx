"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { Fish } from "@/types/fish";

// Reuse the existing Map component (client) which depends on react-map-gl/maplibre
const MapComponent = dynamic(() => import("@/components/Map"), { ssr: false });

interface SightingPoint {
  id?: string;
  fishId?: string;
  fishName?: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

interface Props {
  // either pass fishes (shows latest sightings) or an explicit sightings list
  fishes?: Fish[];
  sightings?: SightingPoint[];
}

export default function SightingsMap({ fishes, sightings }: Props) {
  // If explicit sightings provided, convert to a lightweight fish-like array
  const displayFishes = useMemo(() => {
    if (fishes && fishes.length) return fishes;
    if (!sightings) return [];
    return sightings.map((s, idx) => ({
      id: s.fishId ?? `s-${idx}`,
      name: s.fishName ?? "Sighting",
      image: "",
      rarity: "COMMON",
      latestSighting: {
        latitude: s.latitude,
        longitude: s.longitude,
        timestamp: s.timestamp,
      },
    }));
  }, [fishes, sightings]);

  return (
    <div className="w-full h-96 bg-panel-bg border border-panel-border rounded-lg overflow-hidden">
      <MapComponent fishes={displayFishes} hoveredFishId={null} />
    </div>
  );
}
