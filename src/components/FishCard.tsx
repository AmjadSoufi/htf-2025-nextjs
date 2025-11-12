"use client";

import { formatDistanceToNow } from "date-fns";
import { Fish } from "@/types/fish";
import { getRarityBadgeClass } from "@/utils/rarity";
import { useEffect, useState } from "react";

interface FishCardProps {
  fish: Fish;
  onHover?: (fishId: string | null) => void;
}

export default function FishCard({ fish, onHover }: FishCardProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [thumbnail, setThumbnail] = useState<string | null>(null);

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
  return (
    <div
      className="border border-panel-border shadow-[--shadow-cockpit-border] rounded-lg p-3 hover:border-sonar-green transition-all duration-300 cursor-pointer group"
      onMouseEnter={() => onHover?.(fish.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="text-sm font-bold text-text-primary group-hover:text-sonar-green transition-colors mb-1">
            {fish.name}
          </div>
          <div
            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${getRarityBadgeClass(
              fish.rarity
            )}`}
          >
            {fish.rarity}
          </div>
        </div>
        <div className="ml-3">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={`${fish.name} thumbnail`}
              className="w-16 h-12 object-cover rounded"
            />
          ) : (
            <div className="w-16 h-12 bg-panel-border rounded flex items-center justify-center text-[10px] text-text-secondary">
              No Photo
            </div>
          )}
        </div>
      </div>
      <div className="text-xs font-mono space-y-1">
        <div className="flex justify-between text-text-secondary">
          <span>LAT:</span>
          <span className="text-sonar-green">
            {fish.latestSighting.latitude.toFixed(6)}
          </span>
        </div>
        <div className="flex justify-between text-text-secondary">
          <span>LON:</span>
          <span className="text-sonar-green">
            {fish.latestSighting.longitude.toFixed(6)}
          </span>
        </div>
        <div className="flex justify-between text-text-secondary pt-1 border-t border-panel-border">
          <span>LAST SEEN:</span>
          <span className="text-warning-amber">
            {formatDistanceToNow(new Date(fish.latestSighting.timestamp), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>

      <div className="pt-2">
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={onFileChange}
            className="text-xs"
          />
          <button
            disabled={!selectedFile || uploading}
            onClick={markSeen}
            className="px-2 py-1 text-xs rounded bg-sonar-green text-black disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Mark as seen"}
          </button>
        </div>
      </div>
    </div>
  );
}
