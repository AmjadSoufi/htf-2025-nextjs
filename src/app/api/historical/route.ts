import { randomUUID } from "crypto";

function haversineDist(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371e3; // meters
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fishId, species, latestSighting } = body;

    if (!fishId || !latestSighting) {
      return new Response(
        JSON.stringify({ error: "missing fishId or latestSighting" }),
        { status: 400 }
      );
    }

    // Generate synthetic history by jittering around latestSighting
    const baseLat = Number(latestSighting.latitude || 0);
    const baseLon = Number(latestSighting.longitude || 0);
    const now = Date.now();
    const days = 28; // 4 weeks
    const points: Array<{
      id: string;
      latitude: number;
      longitude: number;
      timestamp: string;
    }> = [];

    for (let i = 0; i < 12; i++) {
      const frac = i / 11;
      // move gradually north-east and jitter
      const jitterLat = (Math.random() - 0.5) * 0.05; // ~5km
      const jitterLon = (Math.random() - 0.5) * 0.05;
      const latitude = baseLat + (frac - 0.5) * 0.3 + jitterLat;
      const longitude = baseLon + (frac - 0.5) * 0.3 + jitterLon;
      const timestamp = new Date(
        now - days * 24 * 60 * 60 * 1000 * (1 - frac)
      ).toISOString();
      points.push({ id: randomUUID(), latitude, longitude, timestamp });
    }

    // sort by timestamp ascending
    points.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // compute total distance
    let totalDist = 0;
    for (let i = 1; i < points.length; i++) {
      totalDist += haversineDist(
        points[i - 1].latitude,
        points[i - 1].longitude,
        points[i].latitude,
        points[i].longitude
      );
    }

    const bbox = {
      minLat: Math.min(...points.map((p) => p.latitude)),
      maxLat: Math.max(...points.map((p) => p.latitude)),
      minLon: Math.min(...points.map((p) => p.longitude)),
      maxLon: Math.max(...points.map((p) => p.longitude)),
    };

    const insights = {
      totalSightings: points.length,
      totalDistanceMeters: Math.round(totalDist),
      bbox,
      firstSeen: points[0]?.timestamp ?? null,
      lastSeen: points[points.length - 1]?.timestamp ?? null,
      inferredDirection: (() => {
        const first = points[0];
        const last = points[points.length - 1];
        const latDiff = last.latitude - first.latitude;
        const lonDiff = last.longitude - first.longitude;
        const ns = latDiff > 0 ? "N" : latDiff < 0 ? "S" : "=";
        const ew = lonDiff > 0 ? "E" : lonDiff < 0 ? "W" : "=";
        return `${ns}${Math.abs(latDiff).toFixed(3)}°, ${ew}${Math.abs(
          lonDiff
        ).toFixed(3)}°`;
      })(),
    };

    return new Response(
      JSON.stringify({ success: true, sightings: points, insights }),
      { status: 200 }
    );
  } catch (err: any) {
    console.error("/api/historical POST error:", err);
    return new Response(
      JSON.stringify({ error: err?.message ?? String(err) }),
      { status: 500 }
    );
  }
}
