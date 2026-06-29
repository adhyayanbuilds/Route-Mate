import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, Navigation, Crosshair, AlertCircle, Search,
  Droplets, UtensilsCrossed, GlassWater, Fuel,
  Wrench, HeartPulse, BedDouble, ParkingCircle,
} from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';
import { RouteMap } from '../components/map/RouteMap';
import { fetchNearbyPois, formatDistance, openInGoogleMaps } from '../lib/geo';
import { QUICK_ACCESS, CATEGORY_META } from '../lib/categories';
import { Spinner } from '../components/ui/Spinner';
import type { Place, ServiceCategory } from '../types';

const CAT_ICONS: Record<string, typeof MapPin> = {
  washrooms: Droplets, meals: UtensilsCrossed, water: GlassWater, fuel: Fuel,
  repair: Wrench, hospitals: HeartPulse, rest: BedDouble, parking: ParkingCircle,
};

// Suppress scrollbar for category pills
const suppressStyle = document.createElement('style');
suppressStyle.textContent = '.no-sb::-webkit-scrollbar{display:none}.no-sb{scrollbar-width:none}';
document.head.appendChild(suppressStyle);

export function MapPage() {
  const { location, loading, permissionDenied, isDefault, setLocation } = useGeolocation();
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>('washrooms');
  const [places, setPlaces] = useState<Place[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!location) return;
    setLoadingPlaces(true);
    fetchNearbyPois(location, activeCategory, 2500)
      .then(setPlaces)
      .finally(() => setLoadingPlaces(false));
  }, [location?.lat, location?.lng, activeCategory]);

  const recenter = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      undefined,
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const filtered = search.trim()
    ? places.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : places;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3 anim-fade-up flex-wrap">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Nearby Map</h1>
          <p className="text-white/40 text-sm mt-0.5">
            {isDefault ? 'Showing default location — enable GPS for real results.' : 'Your current location · live results'}
          </p>
        </div>
        <button onClick={recenter} className="btn-ghost-sm shrink-0">
          <Crosshair className="w-4 h-4" /> Recenter
        </button>
      </div>

      {/* Location warning */}
      {(permissionDenied || isDefault) && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm anim-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Location access denied. Showing Bengaluru as default. Enable location in browser settings for accurate results.</span>
        </div>
      )}

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 anim-fade-up delay-100 no-sb">
        {QUICK_ACCESS.map((cat) => {
          const meta = CATEGORY_META[cat];
          const active = cat === activeCategory;
          const Icon = CAT_ICONS[cat];
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 border ${
                active
                  ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-300'
                  : 'bg-ink-800/60 border-white/[0.08] text-white/55 hover:text-white hover:border-white/15'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-emerald-400' : meta.color} shrink-0`} strokeWidth={2} />
              {meta.short}
            </button>
          );
        })}
      </div>

      {/* Map + sidebar */}
      <div className="grid lg:grid-cols-3 gap-4 anim-fade-up delay-200">
        <div className="lg:col-span-2">
          {location && (
            <RouteMap center={location} places={filtered.slice(0, 25)} zoom={14} className="h-[380px] sm:h-[460px] lg:h-[560px]" />
          )}
        </div>

        <div className="glass-card flex flex-col overflow-hidden" style={{ maxHeight: 560 }}>
          {/* Search */}
          <div className="p-3 border-b border-white/[0.06]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="search"
                placeholder={`Search ${CATEGORY_META[activeCategory].label.toLowerCase()}…`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10 text-sm py-2.5"
              />
            </div>
          </div>

          {/* Count */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
            <span className="font-display font-semibold text-sm">{CATEGORY_META[activeCategory].label}</span>
            <span className="text-xs text-white/35 flex items-center gap-1.5">
              {loadingPlaces ? <><Spinner size="sm" /> Loading…</> : `${filtered.length} found`}
            </span>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {loadingPlaces ? (
              [...Array(5)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <MapPin className="w-8 h-8 text-white/15 mb-3" />
                <p className="text-sm text-white/40">
                  {search ? 'No matches.' : `No ${CATEGORY_META[activeCategory].label.toLowerCase()} nearby.`}
                </p>
              </div>
            ) : (
              filtered.slice(0, 20).map((place) => (
                <button
                  key={place.id}
                  className="w-full flex items-start gap-3 p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-colors text-left"
                  onClick={() => openInGoogleMaps(place.lat, place.lng, place.name)}
                  aria-label={`Get directions to ${place.name}`}
                >
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight truncate">{place.name}</p>
                    <p className="text-xs text-white/35 mt-0.5">{formatDistance(place.distance)} away</p>
                  </div>
                  <Navigation className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                </button>
              ))
            )}
          </div>

          <div className="p-3 border-t border-white/[0.06]">
            <Link
              to={`/app/services/${activeCategory}`}
              className="block text-center text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium py-1"
            >
              View full list →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
