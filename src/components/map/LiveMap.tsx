import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { LatLng } from '../../data/mockData';

// Fix default marker icons
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createAmbulanceIcon = () => L.divIcon({
  html: `<div style="background:#059669;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:14px;">🚑</div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const createPatientIcon = () => L.divIcon({
  html: `<div style="background:#ef4444;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:14px;">🆘</div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const createHospitalIcon = () => L.divIcon({
  html: `<div style="background:#2563eb;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:14px;">🏥</div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

interface MapMarker {
  type: 'ambulance' | 'patient' | 'hospital';
  position: LatLng;
  label: string;
  info?: string;
}

interface LiveMapProps {
  center: LatLng;
  zoom?: number;
  markers?: MapMarker[];
  polyline?: LatLng[];
  height?: string;
  className?: string;
}

function RecenterMap({ center }: { center: LatLng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng]);
  }, [center, map]);
  return null;
}

export const LiveMap: React.FC<LiveMapProps> = ({
  center,
  zoom = 14,
  markers = [],
  polyline,
  height = '400px',
  className = '',
}) => {
  return (
    <div style={{ height }} className={`rounded-2xl overflow-hidden border border-slate-100 shadow-sm ${className}`}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap center={center} />

        {markers.map((marker, index) => {
          const icon =
            marker.type === 'ambulance' ? createAmbulanceIcon() :
            marker.type === 'patient' ? createPatientIcon() :
            createHospitalIcon();

          return (
            <Marker key={index} position={[marker.position.lat, marker.position.lng]} icon={icon}>
              <Popup>
                <div className="text-sm font-medium">{marker.label}</div>
                {marker.info && <div className="text-xs text-gray-500 mt-1">{marker.info}</div>}
              </Popup>
            </Marker>
          );
        })}

        {polyline && polyline.length > 1 && (
          <Polyline
            positions={polyline.map(p => [p.lat, p.lng])}
            color="#059669"
            weight={4}
            opacity={0.8}
            dashArray="10, 5"
          />
        )}
      </MapContainer>
    </div>
  );
};
