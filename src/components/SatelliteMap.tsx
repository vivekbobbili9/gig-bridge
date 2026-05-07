import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
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
}

const SatelliteMap = ({ gigs, workerLocation, acceptedGigIds, onSelect, height = "100%", zoom = 12 }: Props) => {
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
          attribution='&copy; OpenStreetMap &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />
        <FlyTo lat={workerLocation.lat} lng={workerLocation.lng} zoom={zoom} />

        {/* Worker pulse */}
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
