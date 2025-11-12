"use client";

import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { applyChartTheme } from "@/lib/chartTheme";

applyChartTheme();
import { useMemo } from "react";

ChartJS.register(ArcElement, Tooltip, Legend);

interface FishMinimal {
  id: string;
  name: string;
  latestSighting: {
    latitude: number;
    longitude: number;
    timestamp: string;
  } | null;
}

interface Props {
  fishes?: FishMinimal[]; // optional
}

export default function ProgressChart({ fishes }: Props) {
  const { seen, total } = useMemo(() => {
    const sampleTotal = 20;
    if (!fishes || fishes.length === 0) return { seen: 5, total: sampleTotal };
    const seen = fishes.filter((f) => f.latestSighting).length;
    return { seen, total: fishes.length };
  }, [fishes]);

  const data = {
    labels: ["Seen", "Not seen"],
    datasets: [
      {
        data: [seen, Math.max(0, total - seen)],
        backgroundColor: ["rgba(52,211,153,0.95)", "rgba(59,130,246,0.95)"],
        hoverBackgroundColor: ["rgba(16,185,129,0.95)", "rgba(37,99,235,0.95)"],
      },
    ],
  };
  const options = {
    cutout: "70%",
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
  } as any;

  return (
    <div className="w-full p-4 bg-panel-bg border border-panel-border rounded-lg">
      <h3 className="text-sm font-bold mb-2 text-gray-100">
        Catalog Completion
      </h3>
      <div style={{ height: 200 }}>
        <Doughnut data={data as any} options={options} />
      </div>
      <div className="text-xs text-text-secondary mt-2 font-mono">
        <div>
          Seen: <span className="text-sonar-green font-bold">{seen}</span>
        </div>
        <div>
          Total: <span className="font-bold">{total}</span>
        </div>
      </div>
    </div>
  );
}
