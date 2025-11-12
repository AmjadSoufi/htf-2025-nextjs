import { Chart } from "chart.js";

export function applyChartTheme() {
  // Basic dark theme defaults for Chart.js
  Chart.defaults.color = "#D1D5DB"; // default tick/label color
  Chart.defaults.backgroundColor = "#071226";
  Chart.defaults.font = {
    family: "Inter, ui-sans-serif, system-ui",
    size: 12,
  } as any;

  // Legend and tooltip defaults
  if (Chart.defaults.plugins) {
    (Chart.defaults.plugins as any).legend =
      (Chart.defaults.plugins as any).legend ?? {};
    (Chart.defaults.plugins as any).legend.labels = {
      color: "#E5E7EB",
      ...((Chart.defaults.plugins as any).legend.labels ?? {}),
    };

    (Chart.defaults.plugins as any).tooltip =
      (Chart.defaults.plugins as any).tooltip ?? {};
    (Chart.defaults.plugins as any).tooltip.backgroundColor = "#0b1220";
    (Chart.defaults.plugins as any).tooltip.titleColor = "#ffffff";
    (Chart.defaults.plugins as any).tooltip.bodyColor = "#ffffff";
  }

  // Grid and ticks defaults for axes
  (Chart.defaults as any).scales = (Chart.defaults as any).scales ?? {};
  (Chart.defaults as any).scales.x = (Chart.defaults as any).scales.x ?? {};
  (Chart.defaults as any).scales.y = (Chart.defaults as any).scales.y ?? {};

  (Chart.defaults as any).scales.x.ticks = { color: "#D1D5DB" };
  (Chart.defaults as any).scales.x.grid = { color: "rgba(255,255,255,0.04)" };
  (Chart.defaults as any).scales.y.ticks = { color: "#D1D5DB" };
  (Chart.defaults as any).scales.y.grid = { color: "rgba(255,255,255,0.04)" };
}

export default applyChartTheme;
