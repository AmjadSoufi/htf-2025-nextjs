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

  const getRarityColor = (rarity: string) => {
    switch (rarity.toUpperCase()) {
      case "COMMON":
        return "text-gray-400";
      case "RARE":
        return "text-blue-400";
      case "EPIC":
        return "text-purple-400";
      case "LEGENDARY":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  const getConservationColor = (status?: string) => {
    if (!status) return "text-gray-400";
    switch (status.toUpperCase()) {
      case "LC": // Least Concern
        return "text-green-400";
      case "NT": // Near Threatened
        return "text-yellow-400";
      case "VU": // Vulnerable
        return "text-orange-400";
      case "EN": // Endangered
        return "text-red-400";
      case "CR": // Critically Endangered
        return "text-red-600";
      default:
        return "text-gray-400";
    }
  };

  const getConservationLabel = (status?: string) => {
    if (!status) return "Unknown";
    const labels: Record<string, string> = {
      LC: "Least Concern",
      NT: "Near Threatened",
      VU: "Vulnerable",
      EN: "Endangered",
      CR: "Critically Endangered",
    };
    return labels[status.toUpperCase()] || status;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative max-w-5xl w-full bg-[color-mix(in_srgb,var(--color-dark-navy)_95%,transparent)] border-2 border-panel-border rounded-xl shadow-[0_0_50px_rgba(0,255,157,0.2)] p-4 mx-4 my-6 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 pb-3 border-b border-panel-border">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold text-sonar-green">
                {fish.name}
              </h2>
              <span
                className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getRarityColor(
                  fish.rarity
                )} border-current`}
              >
                {fish.rarity}
              </span>
            </div>
            {fish.species && (
              <div className="text-xs text-text-secondary italic mb-0.5">
                {fish.species}
              </div>
            )}
            <div className="text-xs text-text-secondary">
              Fish ID: {fish.id}
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/50 rounded-lg transition-colors text-sm"
          >
            ✕ Close
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Left Column - Fish Image & Basic Info */}
          <div className="lg:col-span-1 space-y-3">
            {/* Fish Image */}
            <div className="bg-panel-bg border-2 border-panel-border rounded-lg p-3 aspect-square flex items-center justify-center overflow-hidden">
              {fish.image ? (
                <img
                  src={fish.image}
                  alt={fish.name}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-text-secondary text-5xl">🐟</div>
              )}
            </div>

            {/* Physical Characteristics */}
            <div className="bg-panel-bg border border-panel-border rounded-lg p-3">
              <h3 className="text-sonar-green font-bold mb-2 text-xs uppercase tracking-wider">
                Physical Characteristics
              </h3>
              <div className="space-y-1.5 text-xs">
                {fish.sizeCm && (
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Length:</span>
                    <span className="text-white font-semibold">
                      {fish.sizeCm} cm
                    </span>
                  </div>
                )}
                {fish.weightKg && (
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Weight:</span>
                    <span className="text-white font-semibold">
                      {fish.weightKg} kg
                    </span>
                  </div>
                )}
                {fish.speed !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Speed:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                          style={{ width: `${fish.speed}%` }}
                        />
                      </div>
                      <span className="text-white font-semibold w-6">
                        {fish.speed}
                      </span>
                    </div>
                  </div>
                )}
                {fish.agility !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Agility:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                          style={{ width: `${fish.agility}%` }}
                        />
                      </div>
                      <span className="text-white font-semibold w-6">
                        {fish.agility}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Conservation Status */}
            {fish.conservationStatus && (
              <div className="bg-panel-bg border border-panel-border rounded-lg p-3">
                <h3 className="text-sonar-green font-bold mb-2 text-xs uppercase tracking-wider">
                  Conservation Status
                </h3>
                <div
                  className={`text-center py-1.5 px-2 rounded-lg border-2 ${getConservationColor(
                    fish.conservationStatus
                  )} border-current font-bold text-sm`}
                >
                  {getConservationLabel(fish.conservationStatus)}
                </div>
              </div>
            )}
          </div>

          {/* Middle & Right Columns - Maps, Charts, and Details */}
          <div className="lg:col-span-2 space-y-3">
            {/* Description */}
            {fish.description && (
              <div className="bg-panel-bg border border-panel-border rounded-lg p-3">
                <h3 className="text-sonar-green font-bold mb-1.5 text-xs uppercase tracking-wider">
                  Description
                </h3>
                <p className="text-text-secondary text-xs leading-relaxed">
                  {fish.description}
                </p>
              </div>
            )}

            {/* Habitat & Environment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {fish.habitat && (
                <div className="bg-panel-bg border border-panel-border rounded-lg p-3">
                  <h3 className="text-sonar-green font-bold mb-1.5 text-xs uppercase tracking-wider">
                    Habitat
                  </h3>
                  <p className="text-white text-xs">{fish.habitat}</p>
                </div>
              )}

              {/* Temperature Range */}
              <div className="bg-panel-bg border border-panel-border rounded-lg p-3">
                <h3 className="text-sonar-green font-bold mb-1.5 text-xs uppercase tracking-wider">
                  Temperature Preference
                </h3>
                <div className="space-y-1.5 text-xs">
                  {fish.preferredTemperatureMin !== undefined &&
                  fish.preferredTemperatureMax !== undefined ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Range:</span>
                        <span className="text-white font-semibold">
                          {fish.preferredTemperatureMin}°C -{" "}
                          {fish.preferredTemperatureMax}°C
                        </span>
                      </div>
                      {fish.latestSighting.temperature !== null &&
                        fish.latestSighting.temperature !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-text-secondary">
                              Current:
                            </span>
                            <span
                              className={`font-semibold ${
                                fish.latestSighting
                                  .isTemperatureInPreferredRange
                                  ? "text-green-400"
                                  : "text-orange-400"
                              }`}
                            >
                              {fish.latestSighting.temperature.toFixed(1)}°C
                              {fish.latestSighting.isTemperatureInPreferredRange
                                ? " ✓"
                                : " ⚠"}
                            </span>
                          </div>
                        )}
                    </>
                  ) : (
                    <div className="text-text-secondary">No data available</div>
                  )}
                </div>
              </div>
            </div>

            {/* Abilities */}
            {fish.abilities && fish.abilities.length > 0 && (
              <div className="bg-panel-bg border border-panel-border rounded-lg p-3">
                <h3 className="text-sonar-green font-bold mb-2 text-xs uppercase tracking-wider">
                  Special Abilities
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {fish.abilities.map((ability, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-sonar-green/10 border border-sonar-green/30 text-sonar-green rounded-full text-xs font-semibold"
                    >
                      {ability}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Latest Sighting Info */}
            <div className="bg-panel-bg border border-panel-border rounded-lg p-3">
              <h3 className="text-sonar-green font-bold mb-2 text-xs uppercase tracking-wider">
                Latest Sighting
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-text-secondary text-xs mb-0.5">
                    Location
                  </div>
                  <div className="text-white font-mono text-xs">
                    {fish.latestSighting.latitude.toFixed(6)}°,{" "}
                    {fish.latestSighting.longitude.toFixed(6)}°
                  </div>
                </div>
                <div>
                  <div className="text-text-secondary text-xs mb-0.5">Time</div>
                  <div className="text-white text-xs">
                    {new Date(fish.latestSighting.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Historical Data Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-panel-bg border border-panel-border rounded-lg p-2 overflow-hidden">
                <h3 className="text-sonar-green font-bold mb-1.5 text-xs uppercase tracking-wider">
                  Sighting Locations
                </h3>
                <div className="h-56 rounded overflow-hidden">
                  <HistoricalSightingsMap
                    fish={fish}
                    sightings={historical?.sightings ?? null}
                  />
                </div>
              </div>
              <div className="bg-panel-bg border border-panel-border rounded-lg p-2 flex flex-col overflow-hidden">
                <h3 className="text-sonar-green font-bold mb-1.5 text-xs uppercase tracking-wider">
                  Movement History
                </h3>
                <div className="flex-1 min-h-0">
                  <HistoricalDataChart
                    sightings={historical?.sightings ?? null}
                  />
                </div>
              </div>
            </div>

            {/* Historical Insights */}
            {historical?.insights && (
              <div className="bg-panel-bg border border-panel-border rounded-lg p-3">
                <h3 className="text-sonar-green font-bold mb-2 text-xs uppercase tracking-wider">
                  Historical Insights
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <div className="text-text-secondary text-xs mb-0.5">
                      Total Sightings
                    </div>
                    <div className="text-white font-bold text-base">
                      {historical.insights.totalSightings}
                    </div>
                  </div>
                  <div>
                    <div className="text-text-secondary text-xs mb-0.5">
                      Distance Traveled
                    </div>
                    <div className="text-white font-bold text-base">
                      {(historical.insights.totalDistanceMeters / 1000).toFixed(
                        2
                      )}{" "}
                      km
                    </div>
                  </div>
                  <div>
                    <div className="text-text-secondary text-xs mb-0.5">
                      First Seen
                    </div>
                    <div className="text-white font-semibold text-xs">
                      {new Date(
                        historical.insights.firstSeen
                      ).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-text-secondary text-xs mb-0.5">
                      Last Seen
                    </div>
                    <div className="text-white font-semibold text-xs">
                      {new Date(
                        historical.insights.lastSeen
                      ).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-text-secondary text-xs mb-0.5">
                      Geographic Range
                    </div>
                    <div className="text-white font-mono text-xs">
                      {`[${historical.insights.bbox.minLat.toFixed(
                        4
                      )}°, ${historical.insights.bbox.minLon.toFixed(
                        4
                      )}°] to [${historical.insights.bbox.maxLat.toFixed(
                        4
                      )}°, ${historical.insights.bbox.maxLon.toFixed(4)}°]`}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
