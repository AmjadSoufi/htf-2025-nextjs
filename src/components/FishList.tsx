import { Fish, Rarity } from "@/types/fish";
import FishCard from "./FishCard";

interface FishListProps {
  fishes: Fish[];
  onFishHover: (fishId: string | null) => void;
  onFishClick?: (fish: Fish) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedRarity: Rarity | "ALL";
  onRarityChange: (rarity: Rarity | "ALL") => void;
  sortBy: "rarity" | "name" | "temperature";
  onSortChange: (sortBy: "rarity" | "name" | "temperature") => void;
}

export default function FishList({
  fishes,
  onFishHover,
  onFishClick,
  searchQuery,
  onSearchChange,
  selectedRarity,
  onRarityChange,
  sortBy,
  onSortChange,
}: FishListProps) {
  return (
    <div className="w-full h-full bg-[color-mix(in_srgb,var(--color-dark-navy)_85%,transparent)] border-2 border-panel-border shadow-[--shadow-cockpit] backdrop-blur-[10px] overflow-hidden flex flex-col">
      {/* Section Header */}
      <div className="px-6 py-3 border-b border-panel-border flex items-center justify-between">
        <div className="text-sm font-bold text-sonar-green [text-shadow:--shadow-glow-text] font-mono">
          DETECTED TARGETS
        </div>
        <div className="flex gap-2 text-xs font-mono">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-sonar-green shadow-[--shadow-glow-common]"></div>
            <span className="text-text-secondary">COMMON</span>
          </div>
          <div className="flex items-center gap-1 ml-3">
            <div className="w-2 h-2 rounded-full bg-warning-amber shadow-[--shadow-glow-rare]"></div>
            <span className="text-text-secondary">RARE</span>
          </div>
          <div className="flex items-center gap-1 ml-3">
            <div className="w-2 h-2 rounded-full bg-danger-red shadow-[--shadow-glow-epic]"></div>
            <span className="text-text-secondary">EPIC</span>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="px-6 py-3 border-b border-panel-border space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="SEARCH BY NAME, SPECIES, OR HABITAT..."
            className="w-full bg-dark-navy/50 border-2 border-panel-border focus:border-sonar-green text-sonar-green placeholder-text-secondary px-4 py-2 pr-10 rounded font-mono text-sm outline-none transition-colors shadow-[--shadow-cockpit-border] focus:shadow-[0_0_10px_rgba(0,255,157,0.3)]"
          />
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sonar-green/50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Filters Row */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Rarity Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary font-mono">
              RARITY:
            </span>
            <div className="flex gap-1">
              {(["ALL", "COMMON", "RARE", "EPIC"] as const).map((rarity) => (
                <button
                  key={rarity}
                  onClick={() => onRarityChange(rarity)}
                  className={`px-3 py-1 text-xs font-mono rounded border-2 transition-all ${
                    selectedRarity === rarity
                      ? "border-sonar-green bg-sonar-green/20 text-sonar-green shadow-[0_0_10px_rgba(0,255,157,0.3)]"
                      : "border-panel-border bg-dark-navy/30 text-text-secondary hover:border-sonar-green/50"
                  }`}
                >
                  {rarity}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Filter */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-text-secondary font-mono">
              SORT BY:
            </span>
            <select
              value={sortBy}
              onChange={(e) =>
                onSortChange(
                  e.target.value as "rarity" | "name" | "temperature"
                )
              }
              className="bg-dark-navy/50 border-2 border-panel-border focus:border-sonar-green text-sonar-green px-3 py-1 rounded font-mono text-xs outline-none transition-colors shadow-[--shadow-cockpit-border] focus:shadow-[0_0_10px_rgba(0,255,157,0.3)] cursor-pointer"
            >
              <option value="rarity">RARITY</option>
              <option value="name">NAME</option>
              <option value="temperature">TEMPERATURE</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="text-xs font-mono">
            <span className="text-text-secondary">RESULTS:</span>
            <span className="text-sonar-green ml-2 font-bold">
              {fishes.length}
            </span>
          </div>
        </div>
      </div>

      {/* Scrollable Fish Grid */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {fishes.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <div className="text-warning-amber text-4xl">⚠️</div>
              <div className="text-text-secondary font-mono text-sm">
                NO TARGETS FOUND
              </div>
              <div className="text-text-secondary/70 font-mono text-xs">
                ADJUST SEARCH OR FILTERS
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {fishes.map((fish) => (
              <FishCard
                key={fish.id}
                fish={fish}
                onHover={onFishHover}
                onClick={onFishClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
