"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useMemo } from "react";
import { applyChartTheme } from "@/lib/chartTheme";

applyChartTheme();

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface Sighting {
  latitude: number;
  longitude: number;
  timestamp: string;
}

interface Props {
  sightings?: Sighting[]; // optional: list of sightings to aggregate by month
}

export default function MonthlyStatsChart({ sightings }: Props) {
  const { labels, counts } = useMemo(() => {
    const sample = [
      {
        timestamp: new Date(
          Date.now() - 1000 * 60 * 60 * 24 * 90
        ).toISOString(),
        latitude: 0,
        longitude: 0,
      },
      {
        timestamp: new Date(
          Date.now() - 1000 * 60 * 60 * 24 * 60
        ).toISOString(),
        latitude: 0,
        longitude: 0,
      },
      {
        timestamp: new Date(
          Date.now() - 1000 * 60 * 60 * 24 * 30
        ).toISOString(),
        latitude: 0,
        longitude: 0,
      },
      { timestamp: new Date().toISOString(), latitude: 0, longitude: 0 },
    ];
    const items = sightings && sightings.length ? sightings : sample;

    // Aggregate by month-year
    const map = new Map<string, number>();
    items.forEach((s) => {
      const d = new Date(s.timestamp);
      const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      map.set(label, (map.get(label) ?? 0) + 1);
    });
    const labels = Array.from(map.keys()).sort();
    const counts = labels.map((l) => map.get(l) ?? 0);
    return { labels, counts };
  }, [sightings]);

  const data = {
    labels,
    datasets: [
      {
        label: "Sightings",
        data: counts,
        backgroundColor: "rgba(96,165,250,0.9)",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: "#E5E7EB" } },
      tooltip: {
        backgroundColor: "#0b1220",
        titleColor: "#fff",
        bodyColor: "#fff",
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
  } as any;

  return (
    <div className="w-full p-4 bg-panel-bg border border-panel-border rounded-lg">
      <h3 className="text-sm font-bold mb-2 text-gray-100">
        Monthly Sightings
      </h3>
      <div style={{ height: 220 }}>
        <Bar data={data as any} options={options} />
      </div>
    </div>
  );
}
