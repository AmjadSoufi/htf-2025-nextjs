"use client";

import { useEffect, useRef } from "react";
import type { MapRef } from "react-map-gl/maplibre";
import { Fish } from "@/types/fish";

interface RadarOverlayProps {
  mapRef: React.RefObject<MapRef | null>;
  fishes: Fish[];
  // called when a fish is detected by the sweep
  onPing?: (id: string) => void;
  // radius in pixels (optional)
  radius?: number;
}

export default function RadarOverlay({
  mapRef,
  fishes,
  onPing,
  radius = 600,
}: RadarOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
  const canvasEl = canvasRef.current;
  if (!canvasEl) return;

  const ctx = canvasEl.getContext("2d");
  if (!ctx) return;

  const c = canvasEl;
  const ctx2 = ctx;

    const DPR = window.devicePixelRatio || 1;

    function resize() {
      const parent = c.parentElement!;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      c.width = Math.max(1, Math.floor(w * DPR));
      c.height = Math.max(1, Math.floor(h * DPR));
      c.style.width = `${w}px`;
      c.style.height = `${h}px`;
  ctx2.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(c.parentElement!);

    let lastPingTimestamps = new Map<string, number>();

    function draw(now: number) {
      if (startRef.current == null) startRef.current = now;
      const t = (now - startRef.current) / 1000; // seconds

  const parent = c.parentElement!;
      const w = parent.clientWidth;
      const h = parent.clientHeight;

  ctx2.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      // rotating sweep angle in degrees (0 -> 360 every 6 seconds)
      const sweepPeriod = 6; // seconds per revolution
      const angle = ((t / sweepPeriod) * 360) % 360; // degrees

      // draw concentric rings
  ctx2.save();
  ctx2.globalCompositeOperation = "lighter";
      for (let i = 1; i <= 4; i++) {
        const r = (radius / 4) * i;
  ctx2.beginPath();
  ctx2.strokeStyle = `rgba(50,200,150,${0.06 * (5 - i)})`;
  ctx2.lineWidth = 1;
  ctx2.arc(cx, cy, r, 0, Math.PI * 2);
  ctx2.stroke();
      }

      // draw sweep (a filled sector with radial gradient)
      const sweepWidth = 18; // degrees
      const startAngle = ((angle - sweepWidth / 2) * Math.PI) / 180;
      const endAngle = ((angle + sweepWidth / 2) * Math.PI) / 180;

  const g = ctx2.createRadialGradient(cx, cy, 0, cx, cy, radius);
      g.addColorStop(0, "rgba(50,230,160,0.22)");
      g.addColorStop(0.6, "rgba(50,200,150,0.08)");
      g.addColorStop(1, "rgba(50,200,150,0)");

  ctx2.beginPath();
  ctx2.moveTo(cx, cy);
  ctx2.arc(cx, cy, radius, startAngle, endAngle);
  ctx2.closePath();
  ctx2.fillStyle = g;
  ctx2.fill();

      // subtle center pulse
  ctx2.beginPath();
  ctx2.fillStyle = "rgba(50,230,160,0.12)";
  ctx2.arc(cx, cy, 6 + Math.abs(Math.sin(t * 2)) * 4, 0, Math.PI * 2);
  ctx2.fill();

  ctx2.restore();

      // detect fish pings: project fish lon/lat to screen coords
      try {
        const mapObj = (mapRef.current as any)?.getMap?.() || (mapRef.current as any)?.getMap || null;
        // if mapObj has project method, use it
        if (mapObj && typeof mapObj.project === "function") {
          for (const fish of fishes) {
            try {
              const p = mapObj.project([fish.latestSighting.longitude, fish.latestSighting.latitude]);
              const fx = p.x;
              const fy = p.y;
              const dx = fx - cx;
              const dy = fy - cy;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < radius) {
                // angle to fish
                const fishAngle = (Math.atan2(dy, dx) * 180) / Math.PI; // -180..180
                // normalize to 0..360
                const fa = (fishAngle + 360) % 360;
                let diff = Math.abs(fa - angle);
                if (diff > 180) diff = 360 - diff;
                const withinSweep = diff <= sweepWidth / 2;
                if (withinSweep) {
                  const last = lastPingTimestamps.get(fish.id) ?? 0;
                  if (now - last > 700) {
                    lastPingTimestamps.set(fish.id, now);
                    onPing?.(fish.id);
                  }
                }
              }
            } catch (e) {
              // ignore per-fish projection errors
            }
          }
        }
      } catch (e) {
        // ignore
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [mapRef, fishes, onPing, radius]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none radar-overlay"
      aria-hidden
    />
  );
}
