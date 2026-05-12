import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import type { Gig } from "@/store/gigStore";

// Custom div icon factory — renders a pill with the price
const gigIcon = (pay: number, accepted: boolean) =>
  L.divIcon({
    className: "",
    html: `
      <div style="position:relative;transform:translate(-50%,-100%);">
        <div style="
          display:flex;align-items:center;gap:4px;
          padding:4px 8px;border-radius:9999px;
          background:${accepted ? "hsl(142 75% 50%)" : "hsl(84 90% 58%)"};
          color:hsl(222 50% 8%);
          font-weight:800;font-size:12px;font-family:inherit;
          box-shadow:0 4px 12px hsl(0 0% 0% / 0.5), 0 0 0 2px hsl(222 30% 6%);
          white-space:nowrap;
        ">₹${pay}</div>
        <div style="
          width:0;height:0;margin:0 auto;
          border-left:6px solid transparent;border-right:6px solid transparent;
          border-top:8px solid ${accepted ? "hsl(142 75% 50%)" : "hsl(84 90% 58%)"};
        "></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

const FlyTo = ({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) => {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng], zoom); }, [lat, lng, zoom, map]);
  return null;
};

interface Props {
  gigs: Gig[];
  workerLocation: { lat: number; lng: number };
  acceptedGigIds: string[];
  onSelect?: (g: Gig) => void;
  height?: string;
  zoom?: number;
  showWorkerPulse?: boolean;
  workerMarkers?: { id: string; name: string; lat: number; lng: number; etaMin: number; distanceKm: number }[];
  destination?: { lat: number; lng: number; label?: string };
  routeLines?: [number, number][][];
}

const SatelliteMap = ({
  gigs,
  workerLocation,
  acceptedGigIds,
  onSelect,
  height = "100%",
  zoom = 12,
  showWorkerPulse = true,
  workerMarkers = [],
  destination,
  routeLines = [],
}: Props) => {
  return (
    <div style={{ height, width: "100%" }} className="overflow-hidden rounded-2xl">
      <MapContainer
        center={[workerLocation.lat, workerLocation.lng]}
        zoom={zoom}
        scrollWheelZoom={true}
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="Tiles &copy; Esri, OSM contributors"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
        />
        <FlyTo lat={workerLocation.lat} lng={workerLocation.lng} zoom={zoom} />

        {showWorkerPulse && (
          <>
            <CircleMarker
              center={[workerLocation.lat, workerLocation.lng]}
              radius={10}
              pathOptions={{ color: "hsl(180 95% 55%)", fillColor: "hsl(180 95% 55%)", fillOpacity: 0.9, weight: 3 }}
            >
              <Popup>You are here</Popup>
            </CircleMarker>
            <CircleMarker
              center={[workerLocation.lat, workerLocation.lng]}
              radius={28}
              pathOptions={{ color: "hsl(180 95% 55%)", fillColor: "hsl(180 95% 55%)", fillOpacity: 0.15, weight: 1 }}
            />
          </>
        )}

        {workerMarkers.map((w) => (
          <CircleMarker
            key={w.id}
            center={[w.lat, w.lng]}
            radius={8}
            pathOptions={{ color: "hsl(84 90% 58%)", fillColor: "hsl(84 90% 58%)", fillOpacity: 0.9, weight: 2 }}
          >
            <Popup>
              <div className="text-xs font-semibold">{w.name}</div>
              <div className="text-[11px] text-muted-foreground">{w.etaMin === 0 ? "Arrived" : `${w.etaMin} min · ${w.distanceKm} km`}</div>
            </Popup>
          </CircleMarker>
        ))}

        {routeLines.map((points, idx) => (
          <Polyline
            key={`route-${idx}`}
            positions={points}
            pathOptions={{ color: "#2d7dff", weight: 5, opacity: 0.9 }}
          />
        ))}

        {destination && (
          <CircleMarker
            center={[destination.lat, destination.lng]}
            radius={10}
            pathOptions={{ color: "hsl(0 80% 55%)", fillColor: "hsl(0 80% 55%)", fillOpacity: 1, weight: 3 }}
          >
            <Popup>{destination.label ?? "Destination"}</Popup>
          </CircleMarker>
        )}

        {gigs.map((g) => (
          <Marker
            key={g.id}
            position={[g.lat, g.lng]}
            icon={gigIcon(g.payPerWorker, acceptedGigIds.includes(g.id))}
            eventHandlers={{ click: () => onSelect?.(g) }}
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default SatelliteMap;
