"use client";

import { UserInfo } from "./AuthProvider";
import FishTrackerClient from "./FishTrackerClient";
import { Fish } from "@/types/fish";
import Link from "next/link";

interface FishTrackerLayoutProps {
  fishes: Fish[];
  sortedFishes: Fish[];
}

export default function FishTrackerLayout({
  fishes,
  sortedFishes,
}: FishTrackerLayoutProps) {
  return (
    <div className="w-full h-screen flex flex-col relative overflow-hidden">
      {/* Scanline effect */}
      <div className="fixed top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[color-mix(in_srgb,var(--color-sonar-green)_10%,transparent)] to-transparent animate-scanline pointer-events-none z-[9999]"></div>

      {/* Header */}
      <div className="bg-[color-mix(in_srgb,var(--color-dark-navy)_85%,transparent)] border-2 border-panel-border shadow-[--shadow-cockpit] backdrop-blur-[10px] px-6 py-3 border-b-2 border-panel-border flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold [text-shadow:--shadow-glow-text] text-sonar-green">
            FISH TRACKER
          </div>
          <div className="text-xs text-text-secondary font-mono">
            GLOBAL MARINE MONITORING SYSTEM
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <Link
            href="/dashboard"
            className="border-2 border-sonar-green/50 hover:border-sonar-green bg-sonar-green/10 hover:bg-sonar-green/20 shadow-[0_0_10px_rgba(0,255,157,0.3)] hover:shadow-[0_0_20px_rgba(0,255,157,0.5)] px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 group"
          >
            <span className="text-sonar-green font-bold">📊 DASHBOARD</span>
            <span className="text-sonar-green opacity-0 group-hover:opacity-100 transition-opacity">
              →
            </span>
          </Link>
          <div className="border border-panel-border shadow-[--shadow-cockpit-border] px-3 py-1 rounded">
            <span className="text-sonar-green">STATUS:</span>
            <span className="text-sonar-green ml-2 font-bold">OPERATIONAL</span>
          </div>
          <div className="border border-panel-border shadow-[--shadow-cockpit-border] px-3 py-1 rounded">
            <span className="text-text-secondary">TARGETS:</span>
            <span className="text-sonar-green ml-2 font-bold">
              {fishes.length}
            </span>
          </div>
          <div className="border border-panel-border shadow-[--shadow-cockpit-border] px-3 py-1 rounded">
            <UserInfo />
          </div>
        </div>
      </div>

      {/* Map and Fish List with shared hover state */}
      <FishTrackerClient fishes={fishes} sortedFishes={sortedFishes} />
    </div>
  );
}
