import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin, Map, Navigation, Heart, Star, ExternalLink,
  Accessibility, Droplets, UtensilsCrossed, GlassWater,
  Fuel, Wrench, HeartPulse, BedDouble, ParkingCircle, Search,
  SlidersHorizontal,
} from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';
import { fetchNearbyPois, formatDistance, openInGoogleMaps } from '../lib/geo';
import { CATEGORY_META } from '../lib/categories';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/ui/PageHeader';
import { RouteMap } from '../components/map/RouteMap';
import { PlaceCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import type { Place, ServiceCategory } from '../types';

type SortMode = 'nearest' | 'budget' | 'rating';

// All category icons keyed by the iconName in CATEGORY_META
const ICON_MAP: Record<string, typeof MapPin> = {
  Droplets, UtensilsCrossed, GlassWater, Fuel,
  Wrench, HeartPulse, BedDouble, ParkingCircle,
};

export function ServiceCategoryPage() {
  const { category } = useParams<{ category: string }>();
  const { location, loading: geoLoading } = useGeolocation();
  const { user } = useAuth();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>('nearest');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showMap, setShowMap] = useState(false);
  const [search, setSearch] = useState('');
  const [showSort, setShowSort] = useState(false);

  const cat = category as ServiceCategory;
  const meta = CATEGORY_META[cat];
  const Icon = ICON_MAP[meta?.iconName] ?? MapPin;

  useEffect(() => {
    if (!location || !meta) return;
    setLoadingPlaces(true);
    fetchNearbyPois(location, cat, 3000)
      .then(setPlaces)
      .finally(() => setLoadingPlaces(false));
  }, [location?.lat, location?.lng, cat, meta]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('favorites')
      .select('id, name')
      .eq('category', cat)
      .then(({ data }) => {
        if (data) setFavorites(new Set(data.map((d) => d.name)));
      });
  }, [user, cat]);

  const toggleFavorite = async (place: Place) => {
    if (!user) return;
    const prev = new Set(favorites);
    if (favorites.has(place.name)) {
      setFavorites((s) => { const n = new Set(s); n.delete(place.name); return n; });
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('category', cat)
        .eq('name', place.name);
      if (error) setFavorites(prev); // rollback
    } else {
      setFavorites((s) => new Set(s).add(place.name));
      const { error } = await supabase.from('favorites').insert({
        category: cat,
        name: place.name,
        lat: place.lat,
        lng: place.lng,
        address: place.address ?? '',
        meta: { tags: place.tags },
      });
      if (error) setFavorites(prev); // rollback
    }
  };

  const sorted = useMemo(() => {
    let arr = [...places];
    if (search.trim()) arr = arr.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (sortMode === 'nearest') arr.sort((a, b) => a.distance - b.distance);
    if (sortMode === 'budget') {
      const o: Record<string, number> = { low: 0, medium: 1, high: 2 };
      arr.sort((a, b) => (o[a.budget ?? ''] ?? 3) - (o[b.budget ?? ''] ?? 3));
    }
    if (sortMode === 'rating') arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    return arr;
  }, [places, sortMode, search]);

  if (!meta) {
    return (
      <div className="text-center py-20">
        <p className="text-white/45 mb-4">Category not found.</p>
        <Link to="/app/dashboard" className="btn-ghost-sm">Back to dashboard</Link>
      </div>
    );
  }

  const isLoading = geoLoading || loadingPlaces;

  return (
    <div className="space-y-5">
      <PageHeader
        title={meta.label}
        subtitle={meta.description}
        backTo="/app/dashboard"
        backLabel="Dashboard"
        icon={<Icon className={`w-5 h-5 ${meta.color}`} strokeWidth={2} />}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSort((v) => !v)}
              className={`btn-ghost-sm ${showSort ? 'border-emerald-500/30 text-emerald-300' : ''}`}
              aria-label="Sort options"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Sort
            </button>
            <button
              onClick={() => setShowMap((s) => !s)}
              className={`btn-ghost-sm ${showMap ? 'border-emerald-500/30 text-emerald-300' : ''}`}
            >
              <Map className="w-4 h-4" />
              {showMap ? 'List' : 'Map'}
            </button>
          </div>
        }
      />

      {/* Sort panel */}
      {showSort && (
        <div className="glass-card p-4 anim-scale-in">
          <p className="section-label mb-3">Sort by</p>
          <div className="flex flex-wrap gap-2">
            {([
              { key: 'nearest', label: 'Nearest first' },
              { key: 'budget',  label: 'Budget friendly' },
              { key: 'rating',  label: 'Top rated' },
            ] as { key: SortMode; label: string }[]).map((opt) => (
              <button
                key={opt.key}
                onClick={() => { setSortMode(opt.key); setShowSort(false); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                  sortMode === opt.key
                    ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-300'
                    : 'bg-ink-800/60 border-white/[0.08] text-white/55 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative anim-fade-up">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
        <input
          type="search"
          placeholder={`Search ${meta.label.toLowerCase()}…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-11 text-[15px]"
        />
      </div>

      {/* Map view */}
      {showMap && location && (
        <div className="anim-fade-up">
          <RouteMap center={location} places={sorted} zoom={14} className="h-[460px]" />
        </div>
      )}

      {/* Count */}
      {!isLoading && !showMap && (
        <p className="text-xs text-white/35">
          {sorted.length > 0 ? `${sorted.length} result${sorted.length !== 1 ? 's' : ''} found within 3 km` : ''}
        </p>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <PlaceCardSkeleton key={i} />)}
        </div>
      ) : sorted.length === 0 && !showMap ? (
        <EmptyState
          icon={<Icon className="w-8 h-8" strokeWidth={1.5} />}
          title={`No ${meta.label} found`}
          description={`We couldn't find any ${meta.label.toLowerCase()} within 3 km of your location. Try expanding your radius or check another category.`}
          action={
            <div className="flex gap-2">
              <Link to="/app/map" className="btn-ghost-sm">Open map</Link>
              <Link to="/app/dashboard" className="btn-ghost-sm">Dashboard</Link>
            </div>
          }
        />
      ) : !showMap ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {sorted.map((place, i) => (
            <div
              key={place.id}
              className="glass-card-hover p-5 anim-fade-up"
              style={{ animationDelay: `${Math.min(i * 35, 350)}ms` }}
            >
              {/* Card header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-[15px] leading-tight truncate">{place.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1 text-white/40 text-xs flex-wrap">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{formatDistance(place.distance)}</span>
                    {place.address && (
                      <><span className="text-white/20">·</span><span className="truncate max-w-[120px]">{place.address}</span></>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => toggleFavorite(place)}
                  className="shrink-0 p-2 rounded-xl hover:bg-white/[0.08] transition-colors"
                  aria-label={favorites.has(place.name) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart
                    className={`w-[18px] h-[18px] transition-all ${
                      favorites.has(place.name) ? 'fill-rose-500 text-rose-500 scale-110' : 'text-white/35'
                    }`}
                  />
                </button>
              </div>

              {/* Tags */}
              {place.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {place.tags.slice(0, 3).map((t) => (
                    <span key={t} className="chip-neutral text-[11px] capitalize">{t}</span>
                  ))}
                </div>
              )}

              {/* Category-specific badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {cat === 'washrooms' && place.accessible && (
                  <span className="chip-sky text-[11px]">
                    <Accessibility className="w-3 h-3" />
                    Accessible
                  </span>
                )}
                {cat === 'meals' && place.budget && (
                  <span className={`chip text-[11px] ${
                    place.budget === 'low'
                      ? 'chip-success'
                      : place.budget === 'medium'
                      ? 'chip-warning'
                      : 'chip-danger'
                  }`}>
                    {place.budget === 'low' ? '₹ Budget' : place.budget === 'medium' ? '₹₹ Mid-range' : '₹₹₹ Premium'}
                  </span>
                )}
                {cat === 'meals' && place.cuisine && (
                  <span className="chip-neutral text-[11px] capitalize">{place.cuisine}</span>
                )}
                {place.rating && (
                  <span className="flex items-center gap-1 text-amber-400 text-xs font-medium">
                    <Star className="w-3 h-3 fill-amber-400" />
                    {place.rating.toFixed(1)}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => openInGoogleMaps(place.lat, place.lng, place.name)}
                  className="btn-primary-sm flex-1"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Directions
                </button>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lng}#map=18/${place.lat}/${place.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost-sm px-3.5"
                  aria-label="View on OpenStreetMap"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
