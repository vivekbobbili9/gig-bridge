import { MapContainer, TileLayer, Marker, CircleMarker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import { fetchDrivingRoute } from "@/lib/routing";

interface Props {
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  height?: string;
  destLabel?: string;
}

const destIcon = L.divIcon({
  className: "",
  html: `<div style="position:relative;transform:translate(-50%,-100%);">
    <div style="width:20px;height:20px;border-radius:50%;background:hsl(0 80% 55%);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5);"></div>
    <div style="width:0;height:0;margin:0 auto;margin-top:-2px;border-left:5px solid transparent;border-right:5px solid transparent;border-top:8px solid hsl(0 80% 55%);"></div>
  </div>`,
  iconSize: [0, 0], iconAnchor: [0, 0],
});

const Fit = ({ a, b }: { a: [number, number]; b: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.fitBounds([a, b], { padding: [50, 50] });
  }, [a, b, map]);
  return null;
};

const RouteMap = ({ from, to, height = "100%", destLabel }: Props) => {
  const [route, setRoute] = useState<[number, number][]>([]);
  const [etaMin, setEtaMin] = useState<number | null>(null);
  const [distKm, setDistKm] = useState<number | null>(null);
  const [progress, setProgress] = useState(0); // 0..1 along route
  const startRef = useRef(Date.now());
  const totalDurRef = useRef(600); // seconds, from OSRM

  useEffect(() => {
    let cancelled = false;
    fetchDrivingRoute(from, to).then((summary) => {
      if (cancelled) return;
      setRoute(summary.points);
      setDistKm(summary.distanceKm);
      setEtaMin(summary.durationMin);
      totalDurRef.current = summary.durationMin * 60;
      startRef.current = Date.now();
    }).catch(() => {
      // Fallback: straight line if all providers fail.
      setRoute([[from.lat, from.lng], [to.lat, to.lng]]);
      const dKm = haversine(from, to);
      setDistKm(+dKm.toFixed(1));
      setEtaMin(Math.max(1, Math.round((dKm / 25) * 60)));
    });
    return () => { cancelled = true; };
  }, [from.lat, from.lng, to.lat, to.lng]);

  // Animate worker along route + tick ETA
  useEffect(() => {
    if (route.length === 0) return;
    const id = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      // Compress simulated travel into ~90s for demo (real ETA still shown)
      const simDur = Math.min(totalDurRef.current, 90);
      const p = Math.min(1, elapsed / simDur);
      setProgress(p);
      if (etaMin != null) {
        const remaining = Math.max(0, Math.round(etaMin * (1 - p)));
        setEtaMin(remaining);
      }
    }, 1500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.length]);

  const currentPos: [number, number] = route.length > 0
    ? interpolate(route, progress)
    : [from.lat, from.lng];

  return (
    <div style={{ height, width: "100%" }} className="relative overflow-hidden rounded-2xl">
      <MapContainer
        center={[from.lat, from.lng]}
        zoom={13}
        scrollWheelZoom
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="Tiles &copy; Esri, OSM contributors"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
        />
        <Fit a={[from.lat, from.lng]} b={[to.lat, to.lng]} />
        {route.length > 1 && (
          <Polyline positions={route} pathOptions={{ color: "hsl(180 95% 55%)", weight: 5, opacity: 0.9 }} />
        )}
        <CircleMarker
          center={currentPos}
          radius={9}
          pathOptions={{ color: "hsl(180 95% 55%)", fillColor: "hsl(180 95% 55%)", fillOpacity: 1, weight: 3 }}
        />
        <Marker position={[to.lat, to.lng]} icon={destIcon} />
      </MapContainer>

      {/* ETA pill */}
      <div className="pointer-events-none absolute left-3 top-3 z-[400] rounded-2xl border border-border bg-card/95 px-3 py-2 shadow-elevated backdrop-blur">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Live ETA</div>
        <div className="font-display text-xl font-extrabold text-primary">
          {etaMin != null ? `${etaMin} min` : "…"}
        </div>
        {distKm != null && <div className="text-[11px] text-muted-foreground">{distKm} km · {destLabel ?? "Destination"}</div>}
      </div>
    </div>
  );
};

const haversine = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};

const interpolate = (pts: [number, number][], t: number): [number, number] => {
  if (pts.length === 0) return [0, 0];
  if (pts.length === 1 || t <= 0) return pts[0];
  if (t >= 1) return pts[pts.length - 1];
  const idxF = t * (pts.length - 1);
  const i = Math.floor(idxF);
  const frac = idxF - i;
  const a = pts[i], b = pts[i + 1] ?? pts[i];
  return [a[0] + (b[0] - a[0]) * frac, a[1] + (b[1] - a[1]) * frac];
};

export default RouteMap;
