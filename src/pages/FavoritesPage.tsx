import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Navigation, Trash2, MapPin, Search, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { CATEGORY_META, QUICK_ACCESS } from '../lib/categories';
import { openInGoogleMaps } from '../lib/geo';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import type { ServiceCategory } from '../types';

interface FavoriteRow {
  id: string;
  category: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  meta: Record<string, unknown>;
  created_at: string;
}

export function FavoritesPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<ServiceCategory | 'all'>('all');

  useEffect(() => {
    if (!user) return;
    supabase
      .from('favorites')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (err) { setError(true); }
        else { setFavorites((data as FavoriteRow[]) ?? []); }
        setLoading(false);
      });
  }, [user]);

  const removeItem = async (id: string) => {
    const prev = favorites;
    setFavorites((f) => f.filter((x) => x.id !== id));
    const { error: err } = await supabase.from('favorites').delete().eq('id', id);
    if (err) setFavorites(prev);
  };

  const displayed = favorites.filter((f) => {
    const matchSearch = !search.trim() || f.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || f.category === filterCat;
    return matchSearch && matchCat;
  });

  // Categories present in saved favorites
  const presentCats = [...new Set(favorites.map((f) => f.category as ServiceCategory))];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Favorites"
        subtitle="Your saved spots for quick one-tap access"
        backTo="/app/dashboard"
        backLabel="Dashboard"
        icon={<Heart className="w-5 h-5 text-rose-400" />}
      />

      {/* Search + filter */}
      {!loading && favorites.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 anim-fade-up">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
            <input
              type="search"
              placeholder="Search favorites…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-11 text-[15px]"
            />
          </div>
          {presentCats.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0">
              <Filter className="w-4 h-4 text-white/30 shrink-0 ml-1" />
              <button
                onClick={() => setFilterCat('all')}
                className={`shrink-0 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                  filterCat === 'all'
                    ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-300'
                    : 'bg-ink-800/60 border-white/[0.08] text-white/50 hover:text-white'
                }`}
              >
                All
              </button>
              {QUICK_ACCESS.filter((c) => presentCats.includes(c)).map((c) => (
                <button
                  key={c}
                  onClick={() => setFilterCat(filterCat === c ? 'all' : c)}
                  className={`shrink-0 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                    filterCat === c
                      ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-300'
                      : 'bg-ink-800/60 border-white/[0.08] text-white/50 hover:text-white'
                  }`}
                >
                  {CATEGORY_META[c].short}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card p-5 space-y-3">
              <Skeleton className="h-4 w-16 rounded-full" />
              <Skeleton className="h-5 w-3/4 rounded-lg" />
              <Skeleton className="h-3 w-1/2 rounded-lg" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-9 flex-1 rounded-xl" />
                <Skeleton className="h-9 w-16 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon={<Heart className="w-8 h-8" strokeWidth={1.5} />}
          title="Couldn't load favorites"
          description="There was an error fetching your saved places. Check your connection and reload."
        />
      ) : favorites.length === 0 ? (
        <EmptyState
          icon={<Heart className="w-8 h-8" strokeWidth={1.5} />}
          title="No favorites yet"
          description="Tap the heart icon on any place in the service pages to save it here for quick access."
          action={<Link to="/app/map" className="btn-primary-sm">Explore nearby</Link>}
        />
      ) : displayed.length === 0 ? (
        <EmptyState
          icon={<Search className="w-8 h-8" strokeWidth={1.5} />}
          title="No matches"
          description="No favorites match your current search or filter. Try a different keyword."
          action={<button onClick={() => { setSearch(''); setFilterCat('all'); }} className="btn-ghost-sm">Clear filters</button>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {displayed.map((fav, i) => {
            const meta = CATEGORY_META[fav.category as ServiceCategory];
            return (
              <div
                key={fav.id}
                className="glass-card-hover p-5 anim-fade-up"
                style={{ animationDelay: `${Math.min(i * 35, 300)}ms` }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    {meta && (
                      <span className={`chip-neutral text-[11px] mb-2 inline-flex ${meta.color}`}>
                        {meta.short}
                      </span>
                    )}
                    <h3 className="font-display font-semibold text-[15px] leading-tight truncate mt-1">
                      {fav.name}
                    </h3>
                    {fav.address && (
                      <p className="text-xs text-white/35 mt-1 flex items-center gap-1.5 truncate">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {fav.address}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(fav.id)}
                    className="shrink-0 p-2 rounded-xl hover:bg-rose-500/10 transition-colors group"
                    aria-label={`Remove ${fav.name} from favorites`}
                  >
                    <Trash2 className="w-4 h-4 text-white/30 group-hover:text-rose-400 transition-colors" />
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openInGoogleMaps(fav.lat, fav.lng, fav.name)}
                    className="btn-primary-sm flex-1"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Directions
                  </button>
                  <Link
                    to={`/app/services/${fav.category}`}
                    className="btn-ghost-sm px-3.5"
                    aria-label="View category"
                  >
                    View all
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
