"use client";

import { Marker } from "react-map-gl/maplibre";
import { Fish } from "@/types/fish";
import { getRarityPulseClass } from "@/utils/rarity";
import { useState } from "react";

interface FishMarkerProps {
  fish: Fish;
  isHovered: boolean;
  isAnyHovered: boolean;
  pinged?: boolean;
}

export default function FishMarker({
  fish,
  isHovered,
  isAnyHovered,
  pinged = false,
}: FishMarkerProps) {
  const pulseClass = getRarityPulseClass(fish.rarity);
  const [imageError, setImageError] = useState(false);

  // Determine if this marker should be dimmed
  const isDimmed = isAnyHovered && !isHovered;

  // Show tooltip if this specific fish is hovered from the list
  const showTooltip = isHovered;

  // Get rarity-specific classes
  const rarity = fish.rarity.toUpperCase();
  const rarityColorClass =
    rarity === "RARE"
      ? "bg-warning-amber text-warning-amber"
      : rarity === "EPIC"
      ? "bg-danger-red text-danger-red"
      : "bg-sonar-green text-sonar-green";

  return (
    <Marker
      longitude={fish.latestSighting.longitude}
      latitude={fish.latestSighting.latitude}
    >
      <div
        className={`relative group cursor-pointer hover:z-[9999] transition-opacity duration-200 ${
          isDimmed ? "opacity-20" : "opacity-100"
        } ${isHovered ? "z-[9999]" : "z-auto"}`}
        title={fish.name}
      >
        {/* Pulsing ring effect - only animate if not dimmed */}
        <div
          className={`absolute -inset-[6px] w-5 h-5 rounded-full opacity-75 ${
            rarityColorClass.split(" ")[0]
          } ${isDimmed ? "" : pulseClass}`}
        />
        {/* Radar ping effect */}
        {pinged && (
          <div className="absolute -inset-2 w-6 h-6 rounded-full pointer-events-none radar-ping" />
        )}
        {/* Fish marker */}
        <div
          className={`w-2 h-2 rounded-full border-2 border-deep-ocean transition-all duration-300 group-hover:w-3 group-hover:h-3 shadow-[--shadow-marker] ${
            rarityColorClass.split(" ")[0]
          } ${rarityColorClass.split(" ")[1]} ${
            isHovered ? "scale-150" : "scale-100"
          }`}
        />
        {/* Tooltip with image - show on hover OR when hovered from list */}
        <div
          className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-dark-navy border-2 border-panel-border rounded-lg shadow-xl transition-all duration-200 pointer-events-none z-[10000] ${
            showTooltip
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100"
          }`}
        >
          <div className="flex flex-col items-center p-3 gap-2 min-w-[140px]">
            {/* Fish Image */}
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-nautical-blue border-2 border-panel-border flex items-center justify-center shadow-inner">
              {!imageError && fish.image ? (
                <img
                  src={fish.image}
                  alt={fish.name}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                  loading="eager"
                />
              ) : (
                <div className="text-5xl">🐠</div>
              )}
            </div>
            {/* Fish Info */}
            <div className="text-center space-y-1">
              <div
                className={`font-bold text-sm ${
                  rarityColorClass.split(" ")[1]
                }`}
              >
                {fish.name}
              </div>
              <div className="text-text-secondary text-[10px] uppercase tracking-wider">
                {fish.rarity}
              </div>
            </div>
          </div>
          {/* Pointer arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="border-8 border-transparent border-t-panel-border" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-[2px]">
              <div className="border-[7px] border-transparent border-t-dark-navy" />
            </div>
          </div>
        </div>
      </div>
    </Marker>
  );
}
