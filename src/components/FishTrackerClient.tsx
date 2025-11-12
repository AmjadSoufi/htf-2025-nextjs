"use client";

import { useState, useMemo } from "react";
import { Fish, Rarity } from "@/types/fish";
import FishDetailModal from "./FishDetailModal";
import Map from "./Map";
import FishList from "./FishList";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

interface FishTrackerClientProps {
  fishes: Fish[];
  sortedFishes: Fish[];
}

export default function FishTrackerClient({
  fishes,
  sortedFishes,
}: FishTrackerClientProps) {
  const [hoveredFishId, setHoveredFishId] = useState<string | null>(null);
  const [selectedFish, setSelectedFish] = useState<Fish | null>(null);
  const [historicalData, setHistoricalData] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRarity, setSelectedRarity] = useState<Rarity | "ALL">("ALL");
  const [sortBy, setSortBy] = useState<"rarity" | "name" | "temperature">(
    "rarity"
  );

  // Filter and sort fish based on search and filters
  const filteredAndSortedFishes = useMemo(() => {
    let filtered = [...sortedFishes];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (fish) =>
          fish.name.toLowerCase().includes(query) ||
          fish.species?.toLowerCase().includes(query) ||
          fish.habitat?.toLowerCase().includes(query)
      );
    }

    // Apply rarity filter
    if (selectedRarity !== "ALL") {
      filtered = filtered.filter((fish) => fish.rarity === selectedRarity);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "temperature") {
        const tempA = a.latestSighting.temperature ?? -Infinity;
        const tempB = b.latestSighting.temperature ?? -Infinity;
        return tempB - tempA;
      }
      // Default is rarity (already sorted by sortedFishes)
      return 0;
    });

    return filtered;
  }, [sortedFishes, searchQuery, selectedRarity, sortBy]);

  const handleFishClick = async (fish: Fish) => {
    setSelectedFish(fish);
    setModalOpen(true);
    try {
      const res = await fetch("/api/historical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fishId: fish.id,
          species: fish.name,
          latestSighting: fish.latestSighting,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setHistoricalData(json);
      } else {
        console.error("Failed to load historical data", await res.text());
        setHistoricalData(null);
      }
    } catch (err) {
      console.error(err);
      setHistoricalData(null);
    }
  };

  return (
    <>
      <PanelGroup
        direction="vertical"
        className="flex-1"
        autoSaveId="fish-tracker-client"
      >
        {/* Map Panel */}
        <Panel defaultSize={65} minSize={30}>
          <div className="w-full h-full relative shadow-[--shadow-map-panel]">
            <Map
              fishes={filteredAndSortedFishes}
              hoveredFishId={hoveredFishId}
            />
          </div>
        </Panel>

        {/* Resize Handle */}
        <PanelResizeHandle className="h-1 bg-panel-border hover:bg-sonar-green transition-colors duration-200 cursor-row-resize relative group">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-sonar-green opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-1 bg-panel-border rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-0.5 bg-sonar-green rounded-full" />
            </div>
          </div>
        </PanelResizeHandle>

        {/* Fish List Panel */}
        <Panel defaultSize={35} minSize={20}>
          <FishList
            fishes={filteredAndSortedFishes}
            onFishHover={setHoveredFishId}
            onFishClick={handleFishClick}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedRarity={selectedRarity}
            onRarityChange={setSelectedRarity}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </Panel>
      </PanelGroup>

      {/* Fish Detail Modal */}
      {modalOpen && selectedFish ? (
        <FishDetailModal
          fish={selectedFish}
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedFish(null);
            setHistoricalData(null);
          }}
          historical={historicalData}
        />
      ) : null}
    </>
  );
}
