"use client";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Fish } from "@/types/fish";
import { getRarityBadgeClass } from "@/utils/rarity";
import { useEffect, useState, useMemo } from "react";

interface SparkPoint {
  t: string;
  temperature: number;
}

function TemperatureSparkline({
  points,
  latest,
}: {
  points: SparkPoint[];
  latest?: number | null;
}) {
  const w = 96;
  const h = 24;
  if (!points || points.length === 0) {
    return null;
  }

  const temps = points.map((p) => p.temperature);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const range = max - min || 1;

  const coords = points.map((p, i) => {
    const x = points.length === 1 ? w / 2 : (i / (points.length - 1)) * w;
    const y = h - ((p.temperature - min) / range) * h;
    return { x, y };
  });

  const d = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");

  const first = temps[0];
  const last = temps[temps.length - 1];
  const trend = last - first;

  return (
    <div className="inline-flex items-center">
      <svg width={w} height={h} className="block">
        <path
          d={d}
          fill="none"
          stroke="#60f2a1"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx={coords[coords.length - 1].x}
          cy={coords[coords.length - 1].y}
          r={2}
          fill={trend >= 0 ? "#34D399" : "#f87171"}
        />
      </svg>
    </div>
  );
}

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
  // latest sighting metadata fetched from /api/sightings (null when none)
  const [latestMeta, setLatestMeta] = useState<any | null>(null);

  useEffect(() => {
    // fetch latest sighting metadata (if exists)
    const fetchMeta = async () => {
      try {
        const res = await fetch(
          `/api/sightings?fishId=${encodeURIComponent(fish.id)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data?.data) {
            setLatestMeta(data.data);
            setThumbnail(data.data.imageUrl ?? null);
          } else {
            setLatestMeta(null);
            setThumbnail(null);
          }
        } else {
          setLatestMeta(null);
          setThumbnail(null);
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

  const markSeenOrUndo = async () => {
    // If already have a latestMeta then this should act as an UNDO
    if (latestMeta) {
      setUploading(true);
      try {
        const res = await fetch(
          `/api/sightings?fishId=${encodeURIComponent(
            fish.id
          )}&rarity=${encodeURIComponent(fish.rarity ?? "COMMON")}`,
          {
            method: "DELETE",
          }
        );
        if (res.ok) {
          setLatestMeta(null);
          setThumbnail(null);
          // notify UI to refresh user progress (XP/rank)
          try {
            window.dispatchEvent(new CustomEvent("user:progress:updated"));
          } catch (e) {
            /* ignore in non-browser env */
          }
        } else {
          console.error("Undo failed", await res.text());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setUploading(false);
      }
      return;
    }

    // Otherwise mark as seen. If a file is selected, upload it; otherwise mark seen without image
    setUploading(true);
    try {
      if (selectedFile) {
        const reader = new FileReader();
        reader.onload = async () => {
          const dataUrl = reader.result as string;
          const payload = {
            fishId: fish.id,
            latitude: fish.latestSighting.latitude,
            longitude: fish.latestSighting.longitude,
            timestamp: fish.latestSighting.timestamp,
            rarity: fish.rarity,
            imageData: dataUrl,
          };

          const res = await fetch(`/api/sightings`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            const json = await res.json();
            setLatestMeta(json.metadata);
            setThumbnail(json.metadata.imageUrl ?? null);
            setSelectedFile(null);
            // notify UI to refresh user progress (XP/rank)
            try {
              window.dispatchEvent(new CustomEvent("user:progress:updated"));
            } catch (e) {
              /* ignore in non-browser env */
            }
          } else {
            console.error("Upload failed", await res.text());
          }
        };
        reader.readAsDataURL(selectedFile);
      } else {
        // No file selected — mark seen without an image
        const payload = {
          fishId: fish.id,
          latitude: fish.latestSighting.latitude,
          longitude: fish.latestSighting.longitude,
          timestamp: fish.latestSighting.timestamp,
          rarity: fish.rarity,
        };
        const res = await fetch(`/api/sightings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const json = await res.json();
          setLatestMeta(json.metadata);
          setThumbnail(json.metadata.imageUrl ?? null);
          // notify UI to refresh user progress (XP/rank)
          try {
            window.dispatchEvent(new CustomEvent("user:progress:updated"));
          } catch (e) {
            /* ignore in non-browser env */
          }
        } else {
          console.error("Mark seen failed", await res.text());
        }
      }
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
  // Prefer provided stats; otherwise derive deterministic stable defaults from id
  const initialSpeed =
    fish.speed ?? deterministicInt(fish.id + "-base-speed", 20, 80);
  const initialAgility =
    fish.agility ?? deterministicInt(fish.id + "-base-agility", 20, 80);
  const [dynSpeed, setDynSpeed] = useState<number>(initialSpeed);
  const [dynAgility, setDynAgility] = useState<number>(initialAgility);

  // Temperature sparkline state
  const [tempPoints, setTempPoints] = useState<
    Array<{ t: string; temperature: number }>
  >([]);
  const [tempLoading, setTempLoading] = useState(false);

  // Haversine distance (meters)
  const haversine = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371000; // meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    // Fetch recent temperature readings near the fish's latest sighting
    if (!fish.latestSighting || !fish.latestSighting.latitude) return;

    let cancelled = false;
    const fetchTemps = async () => {
      setTempLoading(true);
      try {
        const end = new Date();
        const start = new Date(end.getTime() - 6 * 60 * 60 * 1000); // last 6 hours
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL ||
          process.env.API_URL ||
          "http://localhost:5555";
        const url = `${baseUrl.replace(
          /\/$/,
          ""
        )}/api/temperatures/history?start=${encodeURIComponent(
          start.toISOString()
        )}&end=${encodeURIComponent(end.toISOString())}`;
        const res = await fetch(url);
        if (!res.ok) {
          setTempPoints([]);
          return;
        }
        const data: Array<any> = await res.json();

        // Filter readings by proximity (within 2km)
        const nearby = data
          .filter((r) => {
            const d = haversine(
              fish.latestSighting.latitude,
              fish.latestSighting.longitude,
              r.latitude,
              r.longitude
            );
            return d <= 2000;
          })
          .sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          )
          .map((r) => ({ t: r.timestamp, temperature: Number(r.temperature) }));

        if (!cancelled) {
          // keep at most 40 points
          setTempPoints(nearby.slice(-40));
        }
      } catch (e) {
        // ignore
      } finally {
        if (!cancelled) setTempLoading(false);
      }
    };

    fetchTemps();
    return () => {
      cancelled = true;
    };
  }, [fish.latestSighting]);

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
      className="relative border-2 border-panel-border rounded-xl overflow-hidden bg-gradient-to-br from-[#0a1829] via-[#081525] to-[#021018] shadow-[0_0_20px_rgba(0,255,157,0.1)] hover:shadow-[0_0_30px_rgba(0,255,157,0.2)] transition-all duration-300 cursor-pointer flex flex-col h-full hover:scale-[1.02] hover:border-sonar-green/50"
      onMouseEnter={() => onHover?.(fish.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      {/* Top strip: name + rarity */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[rgba(0,255,157,0.05)] to-transparent border-b-2 border-panel-border">
        <div className="flex-1">
          <div className="text-base font-bold text-sonar-green flex items-center gap-2">
            {fish.name}
            {latestMeta && (
              <span className="text-xs bg-sonar-green/20 border border-sonar-green/40 text-sonar-green px-2 py-0.5 rounded-full">
                ✓ Seen
              </span>
            )}
          </div>
          <div className="text-xs text-text-secondary italic mt-0.5">
            {species} • #{fish.id.slice(0, 8)}
          </div>
        </div>
        <div
          className={`px-3 py-1.5 text-xs font-bold rounded-full border-2 shadow-lg ${getRarityBadgeClass(
            fish.rarity
          )}`}
        >
          {fish.rarity}
        </div>
      </div>

      {/* Image */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onClick?.(fish)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onClick?.(fish);
        }}
        className="relative flex items-center justify-center p-4 bg-gradient-to-b from-[#012238]/50 to-transparent"
      >
        {selectedPreview || thumbnail || fish.image ? (
          <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-panel-border shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:border-sonar-green/40 transition-all">
            <Image
              src={selectedPreview ?? thumbnail ?? fish.image}
              alt={displayName}
              fill
              className="object-cover"
              unoptimized
            />
            {selectedPreview && (
              <div className="absolute top-2 right-2 bg-sonar-green/90 text-black px-2 py-1 rounded-full text-xs font-bold">
                Preview
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-48 rounded-lg bg-gradient-to-br from-[#022b3a] to-[#01202a] flex items-center justify-center text-text-secondary border-2 border-dashed border-panel-border">
            <div className="text-center">
              <div className="text-4xl mb-2">🐟</div>
              <div className="text-xs">No image available</div>
            </div>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="px-4 py-3 flex-1 space-y-3">
        <div className="text-xs text-text-secondary leading-relaxed line-clamp-2">
          {description}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-panel-bg/30 border border-panel-border rounded-lg p-2">
            <div className="text-[10px] text-text-secondary mb-1 uppercase tracking-wider">
              Size / Weight
            </div>
            <div className="text-sm font-bold text-white">{sizeCm} cm</div>
            <div className="text-xs text-sonar-green font-semibold">
              {weightKg} kg
            </div>
          </div>
          <div className="bg-panel-bg/30 border border-panel-border rounded-lg p-2">
            <div className="text-[10px] text-text-secondary mb-1 uppercase tracking-wider">
              Habitat
            </div>
            <div className="text-sm font-bold text-white">{habitat}</div>
            <div className="text-xs text-text-secondary">Status: {status}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-[10px] text-text-secondary uppercase tracking-wider">
                Speed
              </div>
              <div className="text-xs font-bold text-sonar-green">
                {dynSpeed}
              </div>
            </div>
            <div className="h-2 bg-panel-bg border border-panel-border rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.max(5, Math.min(100, dynSpeed))}%` }}
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 transition-all duration-300"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-[10px] text-text-secondary uppercase tracking-wider">
                Agility
              </div>
              <div className="text-xs font-bold text-warning-amber">
                {dynAgility}
              </div>
            </div>
            <div className="h-2 bg-panel-bg border border-panel-border rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.max(5, Math.min(100, dynAgility))}%` }}
                className="h-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-300"
              />
            </div>
          </div>
        </div>

        <div className="bg-panel-bg/20 border border-panel-border rounded-lg p-2">
          <div className="text-[10px] text-text-secondary mb-1.5 uppercase tracking-wider">
            Abilities
          </div>
          <div className="flex flex-wrap gap-1.5">
            {abilities.map((a, idx) => (
              <div
                key={idx}
                className="px-2 py-1 text-xs bg-sonar-green/10 border border-sonar-green/30 text-sonar-green rounded-md font-medium"
              >
                {a}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-panel-bg/40 to-transparent border-l-2 border-sonar-green/50 pl-3 pr-2 py-2 rounded">
          <div className="text-[10px] text-text-secondary mb-1 uppercase tracking-wider">
            Last Sighting
          </div>
          <div className="text-xs text-warning-amber font-semibold">
            {formatDistanceToNow(new Date(fish.latestSighting.timestamp), {
              addSuffix: true,
            })}
          </div>
          {fish.latestSighting?.temperature != null && (
            <div className="mt-2 flex items-center flex-wrap gap-2">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-text-secondary">Water:</span>
                <span className="text-xs font-bold text-sonar-green">
                  {Number(fish.latestSighting.temperature).toFixed(1)}°C
                </span>
              </div>
              {typeof fish.preferredTemperatureMin === "number" &&
                typeof fish.preferredTemperatureMax === "number" && (
                  <span className="text-[10px] text-text-secondary">
                    (pref {fish.preferredTemperatureMin}–
                    {fish.preferredTemperatureMax}°C)
                  </span>
                )}
              {fish.latestSighting?.isTemperatureInPreferredRange != null && (
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    fish.latestSighting.isTemperatureInPreferredRange
                      ? "bg-sonar-green shadow-[0_0_4px_rgba(0,255,157,0.8)]"
                      : "bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.8)]"
                  }`}
                  title={
                    fish.latestSighting.isTemperatureInPreferredRange
                      ? "Within preferred range"
                      : "Outside preferred range"
                  }
                />
              )}
              {/* Sparkline */}
              <div className="ml-auto">
                {tempLoading ? (
                  <div className="w-24 h-6 bg-panel-border/30 rounded-sm animate-pulse" />
                ) : tempPoints && tempPoints.length > 0 ? (
                  <TemperatureSparkline
                    points={tempPoints}
                    latest={fish.latestSighting.temperature}
                  />
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="px-4 py-3 border-t-2 border-panel-border bg-gradient-to-r from-[rgba(0,0,0,0.3)] to-[rgba(0,0,0,0.2)] flex items-center justify-between gap-3">
        <div className="flex-1">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={onFileChange}
              className="hidden"
            />
            <div className="flex items-center gap-2 text-xs text-text-secondary group-hover:text-sonar-green transition-colors border border-panel-border group-hover:border-sonar-green/50 rounded-lg px-3 py-1.5 bg-panel-bg/30">
              <span>📷</span>
              <span className="hidden sm:inline">
                {selectedFile ? selectedFile.name : "Add photo"}
              </span>
              <span className="sm:hidden">Photo</span>
            </div>
          </label>
        </div>
        <div>
          <button
            disabled={uploading}
            onClick={markSeenOrUndo}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
              latestMeta
                ? "bg-red-600/20 text-red-400 border-2 border-red-600/50 hover:bg-red-600/30"
                : "bg-sonar-green text-black border-2 border-sonar-green hover:bg-sonar-green/90 shadow-[0_0_10px_rgba(0,255,157,0.3)]"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Uploading...
              </span>
            ) : latestMeta ? (
              "✕ Undo"
            ) : (
              "✓ Mark as seen"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
