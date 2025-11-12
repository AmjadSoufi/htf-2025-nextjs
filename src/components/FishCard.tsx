"use client";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Fish } from "@/types/fish";
import { getRarityBadgeClass } from "@/utils/rarity";
import { useEffect, useState, useMemo } from "react";

interface FishCardProps {
  fish: Fish;
  onHover?: (fishId: string | null) => void;
  onClick?: (fish: Fish) => void;
}

function statWidth(val?: number) {
  if (typeof val !== "number") return "w-20";
  const pct = Math.max(5, Math.min(100, Math.round((val / 100) * 100)));
  const widthPx = Math.round((pct / 100) * 120);
  return `${widthPx}`;
}

export default function FishCard({ fish, onHover, onClick }: FishCardProps) {
  const displayName = fish.name.startsWith("http") ? "Unknown Fish" : fish.name;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);

  useEffect(() => {
    // fetch latest sighting metadata (if exists)
    const fetchMeta = async () => {
      try {
        const res = await fetch(
          `/api/sightings?fishId=${encodeURIComponent(fish.id)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data?.data?.imageUrl) setThumbnail(data.data.imageUrl);
        }
      } catch (e) {
        // ignore
      }
    };
    fetchMeta();
  }, [fish.id]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setSelectedFile(f);
  };

  // preview selected file
  useEffect(() => {
    if (!selectedFile) {
      setSelectedPreview(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setSelectedPreview(url);
    return () => {
      URL.revokeObjectURL(url);
      setSelectedPreview(null);
    };
  }, [selectedFile]);

  const markSeen = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        const payload = {
          fishId: fish.id,
          latitude: fish.latestSighting.latitude,
          longitude: fish.latestSighting.longitude,
          timestamp: fish.latestSighting.timestamp,
          imageData: dataUrl,
        };

        const res = await fetch(`/api/sightings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const json = await res.json();
          setThumbnail(json.metadata.imageUrl);
          setSelectedFile(null);
        } else {
          console.error("Upload failed", await res.text());
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // Provide fallbacks for missing metadata to make the card interesting
  const species = fish.species ?? "Unknown Species";
  const description =
    fish.description ??
    "A mysterious marine creature detected by the SONAR system.";

  // Deterministic fallback generator based on fish id so values don't change across renders
  const deterministicInt = (seed: string, min: number, max: number) => {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    const range = max - min + 1;
    return (h % range) + min;
  };

  const sizeCm = useMemo(() => {
    if (typeof fish.sizeCm === "number") return fish.sizeCm;
    return deterministicInt(fish.id + "-size", 20, 140);
  }, [fish.id, fish.sizeCm]);

  const weightKg = useMemo(() => {
    if (typeof fish.weightKg === "number") return fish.weightKg;
    // derive weight from size with a deterministic multiplier
    const factor = deterministicInt(fish.id + "-weightfactor", 12, 30) / 10; // 1.2 - 3.0
    return Number(((sizeCm / 100) * factor).toFixed(1));
  }, [fish.id, fish.weightKg, sizeCm]);

  // dynamic SPEED and AGILITY that update every 5s
  const initialSpeed = fish.speed ?? Math.round(20 + Math.random() * 60);
  const initialAgility = fish.agility ?? Math.round(20 + Math.random() * 60);
  const [dynSpeed, setDynSpeed] = useState<number>(initialSpeed);
  const [dynAgility, setDynAgility] = useState<number>(initialAgility);

  useEffect(() => {
    // reset when fish changes
    setDynSpeed(initialSpeed);
    setDynAgility(initialAgility);
    const id = setInterval(() => {
      // small random walk around base values
      setDynSpeed((s) => {
        const base = fish.speed ?? s;
        const nxt = Math.max(
          5,
          Math.min(100, Math.round(base + (Math.random() - 0.5) * 30))
        );
        return nxt;
      });
      setDynAgility((a) => {
        const base = fish.agility ?? a;
        const nxt = Math.max(
          5,
          Math.min(100, Math.round(base + (Math.random() - 0.5) * 30))
        );
        return nxt;
      });
    }, 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fish.id]);
  const habitat = fish.habitat ?? "Coastal";
  const abilities = fish.abilities ?? ["Echo-locate", "Camouflage"];
  const status = fish.conservationStatus ?? "LC";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(fish)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.(fish);
      }}
      className="relative border border-panel-border rounded-lg overflow-hidden bg-gradient-to-b from-[#081525] to-[#021018] shadow-[--shadow-cockpit-border] cursor-pointer"
      onMouseEnter={() => onHover?.(fish.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      {/* Top strip: name + rarity */}
      <div className="flex items-center justify-between px-3 py-2 bg-[rgba(0,0,0,0.25)] border-b border-panel-border">
        <div>
          <div className="text-sm font-bold text-sonar-green">{fish.name}</div>
          <div className="text-xs text-text-secondary">
            {species} • ID {fish.id.slice(0, 6)}
          </div>
        </div>
        <div
          className={`px-2 py-1 text-xs font-bold rounded ${getRarityBadgeClass(
            fish.rarity
          )}`}
        >
          {fish.rarity}
        </div>
      </div>

      {/* Image */}
      <div className="flex items-center justify-center p-3 bg-[linear-gradient(180deg,#012238,transparent)]">
        {selectedPreview || thumbnail || fish.image ? (
          <div className="relative w-full h-40 rounded-md overflow-hidden border border-panel-border shadow-inner">
            <Image
              src={selectedPreview ?? thumbnail ?? fish.image}
              alt={displayName}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="w-full h-40 rounded-md bg-gradient-to-br from-[#022b3a] to-[#01202a] flex items-center justify-center text-text-secondary">
            No image
          </div>
        )}
      </div>

      {/* Details */}
      <div className="px-3 py-2">
        <div className="text-xs text-text-secondary mb-2">{description}</div>

        <div className="flex gap-3">
          <div className="flex-1">
            <div className="text-[11px] text-text-secondary mb-1">
              SIZE / WEIGHT
            </div>
            <div className="text-sm font-bold text-sonar-green">
              {sizeCm} cm • {weightKg} kg
            </div>
          </div>
          <div className="w-36">
            <div className="text-[11px] text-text-secondary mb-1">HABITAT</div>
            <div className="text-sm font-bold">{habitat}</div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div>
            <div className="text-[11px] text-text-secondary">SPEED</div>
            <div className="h-3 bg-panel-border rounded overflow-hidden mt-1">
              <div
                style={{ width: `${Math.max(5, Math.min(100, dynSpeed))}%` }}
                className="h-full bg-sonar-green"
              />
            </div>
          </div>
          <div>
            <div className="text-[11px] text-text-secondary">AGILITY</div>
            <div className="h-3 bg-panel-border rounded overflow-hidden mt-1">
              <div
                style={{ width: `${Math.max(5, Math.min(100, dynAgility))}%` }}
                className="h-full bg-warning-amber"
              />
            </div>
          </div>
        </div>

        <div className="mt-3">
          <div className="text-[11px] text-text-secondary mb-1">ABILITIES</div>
          <div className="flex flex-wrap gap-2">
            {abilities.map((a, idx) => (
              <div
                key={idx}
                className="px-2 py-0.5 text-xs bg-[rgba(255,255,255,0.03)] border border-panel-border rounded"
              >
                {a}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-text-secondary">
            Last seen:{" "}
            <span className="text-warning-amber">
              {formatDistanceToNow(new Date(fish.latestSighting.timestamp), {
                addSuffix: true,
              })}
            </span>
          </div>
          <div className="text-xs text-text-secondary">
            Status: <span className="font-bold text-sonar-green">{status}</span>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="px-3 py-2 border-t border-panel-border bg-[rgba(0,0,0,0.12)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={onFileChange}
            className="text-xs"
          />
        </div>
        <div>
          <button
            disabled={!selectedFile || uploading}
            onClick={markSeen}
            className="px-3 py-1 text-xs rounded bg-sonar-green text-black disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Mark as seen"}
          </button>
        </div>
      </div>
    </div>
  );
}
