export interface RouteSummary {
  points: [number, number][];
  distanceKm: number;
  durationMin: number;
}

interface LatLng {
  lat: number;
  lng: number;
}

const buildOsrmUrls = (from: LatLng, to: LatLng) => {
  const path = `${from.lng},${from.lat};${to.lng},${to.lat}`;
  return [
    `https://routing.openstreetmap.de/routed-car/route/v1/driving/${path}?overview=full&geometries=geojson`,
    `https://router.project-osrm.org/route/v1/driving/${path}?overview=full&geometries=geojson`,
  ];
};

export const fetchDrivingRoute = async (from: LatLng, to: LatLng): Promise<RouteSummary> => {
  const urls = buildOsrmUrls(from, to);
  let lastError: unknown = null;

  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Routing API failed: ${res.status}`);
      const data = await res.json();
      const r0 = data?.routes?.[0];
      if (!r0?.geometry?.coordinates?.length) throw new Error("No route geometry");
      return {
        points: r0.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]),
        distanceKm: +(r0.distance / 1000).toFixed(1),
        durationMin: Math.max(1, Math.round(r0.duration / 60)),
      };
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError ?? new Error("All routing providers failed");
};

