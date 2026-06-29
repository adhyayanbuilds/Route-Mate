import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useMemo } from 'react';
import type { GeoPoint, Place } from '../../types';
import { formatDistance, openInGoogleMaps } from '../../lib/geo';

// Pre-built pulse ring CSS (inlined so JIT doesn't need to scan template strings)
const PULSE_RING_CSS = `
  <style>
    @keyframes rmp { 0%{transform:scale(0.85);opacity:.7} 100%{transform:scale(2.4);opacity:0} }
    .rm-pulse { animation: rmp 2.4s cubic-bezier(.4,0,.6,1) infinite; }
  </style>
`;

function makeIcon(emoji: string, color: string, pulse = false) {
  const ring = pulse
    ? `${PULSE_RING_CSS}<span class="rm-pulse" style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:0.35;"></span>`
    : '';
  return L.divIcon({
    className: 'route-marker',
    html: `<div style="position:relative;width:36px;height:36px;display:flex;align-items:center;justify-content:center;">
      ${ring}
      <div style="position:relative;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;background:${color};border:2.5px solid rgba(255,255,255,0.92);box-shadow:0 4px 12px -2px rgba(0,0,0,0.6);">
        ${emoji}
      </div>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -22],
  });
}

const CATEGORY_CONFIG: Record<string, { emoji: string; color: string }> = {
  washrooms:  { emoji: '🚻', color: '#0ea5e9' },
  meals:      { emoji: '🍱', color: '#f59e0b' },
  water:      { emoji: '🥤', color: '#06b6d4' },
  fuel:       { emoji: '⛽', color: '#f97316' },
  repair:     { emoji: '🛠', color: '#f43f5e' },
  hospitals:  { emoji: '🏥', color: '#ef4444' },
  rest:       { emoji: '🛌', color: '#8b5cf6' },
  parking:    { emoji: '🅿', color: '#10b981' },
};

interface RouteMapProps {
  center: GeoPoint;
  places?: Place[];
  zoom?: number;
  showUserMarker?: boolean;
  className?: string;
}

function MapController({ center, zoom }: { center: GeoPoint; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], zoom, { animate: true, duration: 0.8 });
  }, [center.lat, center.lng, zoom, map]);
  return null;
}

export function RouteMap({
  center,
  places = [],
  zoom = 14,
  showUserMarker = true,
  className = '',
}: RouteMapProps) {
  const userIcon = useMemo(() => makeIcon('📍', '#10b981', true), []);

  const placeIcons = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(CATEGORY_CONFIG).map(([cat, cfg]) => [cat, makeIcon(cfg.emoji, cfg.color)]),
      ),
    [],
  );

  return (
    <div className={`relative rounded-3xl overflow-hidden border border-white/10 shadow-card ${className}`}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full"
        style={{ background: '#0b1120' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <MapController center={center} zoom={zoom} />

        {showUserMarker && (
          <Marker position={[center.lat, center.lng]} icon={userIcon}>
            <Popup>
              <div className="p-3 min-w-[160px]">
                <div className="font-semibold text-sm">Your location</div>
                <div className="text-xs text-white/50 mt-0.5">
                  {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {places.map((place) => {
          const icon = placeIcons[place.category] || userIcon;
          return (
            <Marker key={place.id} position={[place.lat, place.lng]} icon={icon}>
              <Popup>
                <div className="p-3 min-w-[200px]">
                  <div className="font-semibold text-sm mb-1 pr-4">{place.name}</div>
                  <div className="text-xs text-white/50 mb-3">
                    {formatDistance(place.distance)} away
                    {place.address && ` · ${place.address}`}
                  </div>
                  {place.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {place.tags.slice(0, 3).map((t) => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60 capitalize">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => openInGoogleMaps(place.lat, place.lng, place.name)}
                    className="w-full text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors text-left"
                  >
                    Get directions →
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
