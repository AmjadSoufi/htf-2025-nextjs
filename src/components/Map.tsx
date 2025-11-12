"use client";

import { useRef, useEffect, useState } from "react";
import Map, { MapRef } from "react-map-gl/maplibre";
import { Marker, Source, Layer, Popup } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { Fish } from "@/types/fish";
import FishMarker from "./FishMarker";
import RadarOverlay from "./RadarOverlay";

interface MapComponentProps {
  fishes: Fish[];
  hoveredFishId: string | null;
  // toggles
  showTemperatureHeatmap?: boolean;
  showTemperatureSensors?: boolean;
}

const calculateMapCenter = (fishes: Fish[]) => {
  if (fishes.length === 0) {
    return { latitude: 10.095, longitude: 99.805 };
  }

  const totalLat = fishes.reduce(
    (sum, fish) => sum + fish.latestSighting.latitude,
    0
  );
  const totalLon = fishes.reduce(
    (sum, fish) => sum + fish.latestSighting.longitude,
    0
  );

  return {
    latitude: totalLat / fishes.length,
    longitude: totalLon / fishes.length,
  };
};

export default function MapComponent({
  fishes,
  hoveredFishId,
  showTemperatureHeatmap = true,
  showTemperatureSensors = true,
}: MapComponentProps) {
  const mapRef = useRef<MapRef>(null);
  const { latitude, longitude } = calculateMapCenter(fishes);

  const isAnyHovered = hoveredFishId !== null;

  const [tempGeo, setTempGeo] = useState<any | null>(null);
  const [sensors, setSensors] = useState<any[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<any | null>(null);
  const [pingedIds, setPingedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // fetch temperature sensors and their latest reading
    const fetchTemps = async () => {
      try {
        const baseUrl = (
          process.env.NEXT_PUBLIC_API_URL ||
          process.env.API_URL ||
          "http://localhost:5555"
        ).replace(/\/$/, "");
        const res = await fetch(`${baseUrl}/api/temperatures`);
        if (!res.ok) return;
        const data = await res.json();
        // data is array of sensors with lastReading
        const features = data.map((s: any) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [s.longitude, s.latitude] },
          properties: {
            sensorId: s.id,
            temperature: s.lastReading?.temperature ?? null,
            timestamp: s.lastReading?.timestamp ?? null,
          },
        }));

        setSensors(data);
        setTempGeo({ type: "FeatureCollection", features });
      } catch (e) {
        // ignore
      }
    };

    fetchTemps();
    // refresh every 30s to keep heatmap updated
    const id = setInterval(fetchTemps, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full h-full relative">
      {/* Radar overlay canvas - only visible on the map container */}
      <RadarOverlay
        mapRef={mapRef}
        fishes={fishes}
        onPing={(id) => {
          setPingedIds((prev) => new Set(prev).add(id));
          // remove ping after short duration
          setTimeout(() => {
            setPingedIds((prev) => {
              const copy = new Set(prev);
              copy.delete(id);
              return copy;
            });
          }, 900);
        }}
      />
      <Map
        ref={mapRef}
        mapStyle={"https://tiles.openfreemap.org/styles/liberty"}
        initialViewState={{
          longitude,
          latitude,
          zoom: 13,
        }}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Temperature heatmap layer */}
        {showTemperatureHeatmap && tempGeo && (
          <>
            <Source id="temps" type="geojson" data={tempGeo as any} />
            <Layer
              id="temps-heat"
              type="heatmap"
              source="temps"
              paint={{
                // weight based on temperature (map 16-30C to 0-1)
                "heatmap-weight": [
                  "interpolate",
                  ["linear"],
                  ["coalesce", ["get", "temperature"], 0],
                  16,
                  0,
                  30,
                  1,
                ],
                "heatmap-intensity": 1,
                "heatmap-radius": 30,
                "heatmap-color": [
                  "interpolate",
                  ["linear"],
                  ["heatmap-density"],
                  0,
                  "rgba(33,150,243,0)",
                  0.2,
                  "rgb(33,150,243)",
                  0.4,
                  "rgb(0,200,83)",
                  0.6,
                  "rgb(255,235,59)",
                  1,
                  "rgb(244,67,54)",
                ],
              }}
            />
          </>
        )}
        {fishes.map((fish) => (
          <FishMarker
            key={fish.id}
            fish={fish}
            isHovered={fish.id === hoveredFishId}
            isAnyHovered={isAnyHovered}
            pinged={pingedIds.has(fish.id)}
          />
        ))}

        {/* Sensor markers (clickable) */}
        {showTemperatureSensors &&
          sensors.map((s) => (
            <Marker key={s.id} longitude={s.longitude} latitude={s.latitude}>
              <div
                onClick={() => setSelectedSensor(s)}
                className="w-3 h-3 rounded-full border-2 border-white cursor-pointer"
                style={{
                  background:
                    s.lastReading?.temperature != null
                      ? `rgba(255,0,0,0.6)`
                      : "rgba(128,128,128,0.4)",
                }}
                title={
                  s.lastReading?.temperature != null
                    ? `${s.lastReading.temperature}°C`
                    : "No reading"
                }
              />
            </Marker>
          ))}

        {selectedSensor && (
          <Popup
            longitude={selectedSensor.longitude}
            latitude={selectedSensor.latitude}
            anchor="top"
            onClose={() => setSelectedSensor(null)}
          >
            <div className="text-xs">
              <div className="font-bold">Sensor</div>
              <div>
                Temperature: {selectedSensor.lastReading?.temperature ?? "—"}°C
              </div>
              <div className="text-text-secondary text-[11px]">
                {selectedSensor.lastReading?.timestamp
                  ? new Date(
                      selectedSensor.lastReading.timestamp
                    ).toLocaleString()
                  : ""}
              </div>
              <div className="mt-2 text-[12px]">Nearby species:</div>
              <ul className="text-[12px]">
                {fishes
                  .filter((f) => {
                    const dLat =
                      f.latestSighting.latitude - selectedSensor.latitude;
                    const dLon =
                      f.latestSighting.longitude - selectedSensor.longitude;
                    return dLat * dLat + dLon * dLon < 0.001; // heuristic
                  })
                  .slice(0, 5)
                  .map((f) => (
                    <li key={f.id}>{f.name}</li>
                  ))}
              </ul>
            </div>
          </Popup>
        )}
      </Map>

      {/* Coordinate display overlay */}
      <div className="absolute top-4 left-4 bg-[color-mix(in_srgb,var(--color-dark-navy)_85%,transparent)] border-2 border-panel-border shadow-[--shadow-cockpit] backdrop-blur-[10px] px-4 py-2 rounded text-xs font-mono">
        <div className="text-sonar-green font-bold mb-1">SONAR TRACKING</div>
        <div className="text-text-secondary">
          Active Targets: {fishes.length}
        </div>
      </div>
    </div>
  );
}
