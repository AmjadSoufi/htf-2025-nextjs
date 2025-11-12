"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { applyChartTheme } from "@/lib/chartTheme";

// Apply theme defaults (idempotent)
applyChartTheme();

ChartJS.register(
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

interface Sighting {
  latitude: number;
  longitude: number;
  timestamp: string;
}

interface FishSightings {
  id: string;
  name: string;
  sightings: Sighting[];
}

interface Props {
  data?: FishSightings[]; // optional - if not provided the component renders sample data
}

export default function TimelineChart({ data }: Props) {
  const { labels, datasets } = useMemo(() => {
    const sample = [
      {
        id: "fish-1",
        name: "Blue Tang",
        sightings: [
          {
            timestamp: new Date(
              Date.now() - 1000 * 60 * 60 * 24 * 30
            ).toISOString(),
            latitude: 0,
            longitude: 0,
          },
          {
            timestamp: new Date(
              Date.now() - 1000 * 60 * 60 * 24 * 15
            ).toISOString(),
            latitude: 0,
            longitude: 0,
          },
          { timestamp: new Date().toISOString(), latitude: 0, longitude: 0 },
        ],
      },
      {
        id: "fish-2",
        name: "Clownfish",
        sightings: [
          {
            timestamp: new Date(
              Date.now() - 1000 * 60 * 60 * 24 * 40
            ).toISOString(),
            latitude: 0,
            longitude: 0,
          },
          {
            timestamp: new Date(
              Date.now() - 1000 * 60 * 60 * 24 * 20
            ).toISOString(),
            latitude: 0,
            longitude: 0,
          },
        ],
      },
    ];

    const items = data && data.length ? data : sample;

    // Build a sorted array of unique day strings (ISO YYYY-MM-DD) across sightings
    const allDatesSet = new Set<string>();
    items.forEach((f) =>
      f.sightings.forEach((s) => {
        const day = new Date(s.timestamp).toISOString().slice(0, 10);
        allDatesSet.add(day);
      })
    );
    const labelsArr = Array.from(allDatesSet).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    const colors = ["#3b82f6", "#f97316", "#10b981", "#ef4444"];

    // Prepare per-fish datasets as arrays of { x: dateISO, y: count }
    const datasets = items.map((f, idx) => {
      const countsByDay = new Map<string, number>();
      f.sightings.forEach((s) => {
        const day = new Date(s.timestamp).toISOString().slice(0, 10);
        countsByDay.set(day, (countsByDay.get(day) ?? 0) + 1);
      });

      const dataPoints = labelsArr.map((day) => ({
        x: day,
        y: countsByDay.get(day) ?? 0,
      }));

      return {
        label: f.name,
        data: dataPoints,
        borderColor: colors[idx % colors.length],
        backgroundColor: colors[idx % colors.length],
        tension: 0.25,
        borderWidth: 2,
        pointRadius: 3,
        fill: false,
      } as any;
    });

    // Aggregated total series across all fish
    const totalCounts = labelsArr.map((day) =>
      items.reduce((sum, f) => {
        return (
          sum +
          (f.sightings.filter(
            (s) => new Date(s.timestamp).toISOString().slice(0, 10) === day
          ).length || 0)
        );
      }, 0)
    );
    const totalPoints = labelsArr.map((day, i) => ({
      x: day,
      y: totalCounts[i],
    }));
    datasets.unshift({
      label: "Total Sightings",
      data: totalPoints,
      borderColor: "#7c3aed",
      backgroundColor: "#7c3aed",
      borderWidth: 3,
      tension: 0.2,
      pointRadius: 4,
    } as any);

    return { labels: labelsArr, datasets };
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#E5E7EB",
        },
      },
      tooltip: {
        backgroundColor: "#0b1220",
        titleColor: "#fff",
        bodyColor: "#fff",
        callbacks: {
          // Format the tooltip title (x value) using date-fns
          title: (items: any[]) => {
            const v = items?.[0]?.parsed?.x ?? items?.[0]?.label;
            try {
              return format(parseISO(String(v)), "PPP");
            } catch (e) {
              return String(v ?? "");
            }
          },
          label: (ctx: any) => `${ctx.dataset.label}: ${ctx.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#D1D5DB" },
        grid: { color: "rgba(255,255,255,0.04)" },
      },
      y: {
        ticks: { color: "#D1D5DB" },
        grid: { color: "rgba(255,255,255,0.04)" },
      },
    },
    elements: {
      point: { radius: 3 },
    },
  } as any;

  return (
    <div className="w-full p-4 bg-panel-bg border border-panel-border rounded-lg">
      <h3 className="text-sm font-bold mb-2 text-gray-100">
        Sightings Timeline
      </h3>
      <div style={{ height: 260 }}>
        <Line data={{ labels, datasets: datasets as any }} options={options} />
      </div>
    </div>
  );
}
