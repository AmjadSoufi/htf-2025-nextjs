"use client";

import React from "react";
import Map, { MapRef } from "react-map-gl/maplibre";
import { Marker, Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { Fish } from "@/types/fish";

interface Props {
  fish: Fish;
  sightings: Array<{
    id?: string;
    latitude: number;
    longitude: number;
    timestamp: string;
  }> | null;
}

export default function HistoricalSightingsMap({ fish, sightings }: Props) {
  const center =
    sightings && sightings.length
      ? {
          latitude: sightings[Math.floor(sightings.length / 2)].latitude,
          longitude: sightings[Math.floor(sightings.length / 2)].longitude,
        }
      : {
          latitude: fish.latestSighting.latitude,
          longitude: fish.latestSighting.longitude,
        };

  const lineGeo = sightings
    ? {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: sightings.map((s) => [s.longitude, s.latitude]),
            },
          },
        ],
      }
    : null;

  return (
    <div className="w-full h-full rounded">
      <Map
        mapStyle={"https://tiles.openfreemap.org/styles/liberty"}
        initialViewState={{
          longitude: center.longitude,
          latitude: center.latitude,
          zoom: 10,
        }}
        style={{ width: "100%", height: "100%" }}
      >
        {sightings && sightings.length ? (
          <>
            <Source id="route" type="geojson" data={lineGeo as any} />
            <Layer
              id="route-line"
              type="line"
              source="route"
              paint={{ "line-color": "#34D399", "line-width": 3 }}
            />
            {sightings.map((s) => (
              <Marker
                key={s.id ?? `${s.latitude}-${s.longitude}`}
                longitude={s.longitude}
                latitude={s.latitude}
              >
                <div
                  className="w-2 h-2 rounded-full bg-sonar-green border-2 border-white"
                  title={s.timestamp}
                />
              </Marker>
            ))}
          </>
        ) : (
          <Marker
            longitude={fish.latestSighting.longitude}
            latitude={fish.latestSighting.latitude}
          >
            <div className="w-3 h-3 rounded-full bg-sonar-green border-2 border-white" />
          </Marker>
        )}
      </Map>
    </div>
  );
}
