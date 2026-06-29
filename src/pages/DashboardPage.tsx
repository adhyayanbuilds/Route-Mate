import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, IndianRupee, Route as RouteIcon, Clock,
  Droplets, UtensilsCrossed, GlassWater, Fuel,
  Wrench, HeartPulse, BedDouble, ParkingCircle,
  CloudSun, MapPin, Thermometer, Wind, Droplet,
  AlertTriangle, ArrowRight, TrendingUp, Plus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { fetchWeather } from '../lib/weather';
import { QUICK_ACCESS, CATEGORY_META } from '../lib/categories';
import type { WeatherData, DeliveryLog } from '../types';
import { supabase } from '../lib/supabase';
import { Spinner } from '../components/ui/Spinner';
import { WeatherSkeleton } from '../components/ui/Skeleton';

const QUICK_ICONS: Record<string, typeof Droplets> = {
  washrooms: Droplets, meals: UtensilsCrossed, water: GlassWater, fuel: Fuel,
  repair: Wrench, hospitals: HeartPulse, rest: BedDouble, parking: ParkingCircle,
};

const HEAT_CONFIG = {
  safe:    { label: 'Safe conditions',   color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  caution: { label: 'Stay hydrated',     color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
  extreme: { label: 'Extreme heat',      color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/20' },
  danger:  { label: 'Dangerous heat',    color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20' },
};

const ADVICE = {
  safe:    'Good riding conditions. Drink water every 30 min.',
  caution: 'Elevated heat. Drink water every 20 min, rest in shade.',
  extreme: 'Avoid peak hours. Rest frequently, hydrate every 15 min.',
  danger:  'Dangerous heat. Limit riding, seek AC breaks urgently.',
};

export function DashboardPage() {
  const { profile } = useAuth();
  const { location } = useGeolocation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [logs, setLogs] = useState<DeliveryLog | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [editingLogs, setEditingLogs] = useState(false);
  const [draft, setDraft] = useState({ deliveries: 0, earnings: 0, distance_km: 0, hours_worked: 0 });
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    supabase
      .from('delivery_logs')
      .select('*')
      .eq('log_date', today)
      .maybeSingle()
      .then(({ data }) => {
        const d = data as DeliveryLog | null;
        setLogs(d);
        if (d) setDraft({ deliveries: d.deliveries, earnings: d.earnings, distance_km: d.distance_km, hours_worked: d.hours_worked });
      });
  }, [today]);

  useEffect(() => {
    if (!location) return;
    setLoadingWeather(true);
    fetchWeather(location).then(setWeather).finally(() => setLoadingWeather(false));
  }, [location?.lat, location?.lng]);

  const saveLogs = async () => {
    setSaving(true);
    const { data, error } = await supabase
      .from('delivery_logs')
      .upsert({ log_date: today, ...draft })
      .select()
      .maybeSingle();
    setSaving(false);
    if (!error && data) { setLogs(data as DeliveryLog); setEditingLogs(false); }
  };

  const heat = weather ? HEAT_CONFIG[weather.heatAlert] : null;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="anim-fade-up">
        <p className="text-white/40 text-sm">{greeting}</p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight mt-0.5">
          {profile?.full_name || 'Rider'} <span aria-hidden="true">👋</span>
        </h1>
      </div>

      {/* Today's stats */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-[15px] text-white/60">Today's Progress</h2>
          <button
            onClick={() => setEditingLogs((v) => !v)}
            className="flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            {editingLogs ? 'Cancel' : 'Update'}
          </button>
        </div>

        {editingLogs ? (
          <div className="glass-card p-5 anim-scale-in">
            <div className="grid grid-cols-2 gap-3 mb-4">
              {([
                { key: 'deliveries',   label: 'Deliveries',     step: 1,   min: 0 },
                { key: 'earnings',     label: 'Earnings (₹)',   step: 10,  min: 0 },
                { key: 'distance_km',  label: 'Distance (km)',  step: 0.1, min: 0 },
                { key: 'hours_worked', label: 'Hours worked',   step: 0.5, min: 0 },
              ] as { key: keyof typeof draft; label: string; step: number; min: number }[]).map((f) => (
                <div key={f.key}>
                  <label className="label-text" htmlFor={`log-${f.key}`}>{f.label}</label>
                  <input
                    id={`log-${f.key}`} type="number" min={f.min} step={f.step}
                    value={draft[f.key]}
                    onChange={(e) => setDraft((d) => ({ ...d, [f.key]: parseFloat(e.target.value) || 0 }))}
                    className="input-field"
                  />
                </div>
              ))}
            </div>
            <button onClick={saveLogs} disabled={saving} className="btn-primary w-full">
              {saving ? <Spinner size="sm" /> : "Save today's log"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Deliveries', value: String(logs?.deliveries ?? 0),               icon: Package,     color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'Earnings',   value: `₹${(logs?.earnings ?? 0).toFixed(0)}`,      icon: IndianRupee, color: 'text-amber-400',   bg: 'bg-amber-500/10' },
              { label: 'Distance',   value: `${(logs?.distance_km ?? 0).toFixed(1)} km`, icon: RouteIcon,   color: 'text-sky-400',     bg: 'bg-sky-500/10' },
              { label: 'Hours',      value: `${(logs?.hours_worked ?? 0).toFixed(1)} h`, icon: Clock,       color: 'text-violet-400',  bg: 'bg-violet-500/10' },
            ].map((s, i) => (
              <div key={s.label} className="glass-card p-4 sm:p-5 anim-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                  <s.icon className={`w-[18px] h-[18px] ${s.color}`} strokeWidth={2} />
                </div>
                <div className="font-display text-xl sm:text-2xl font-bold tracking-tight">{s.value}</div>
                <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {!editingLogs && !logs && (
          <p className="text-xs text-white/30 mt-2 text-center">
            No data for today yet.{' '}
            <button onClick={() => setEditingLogs(true)} className="text-emerald-400 hover:underline">
              Log your progress →
            </button>
          </p>
        )}
      </div>

      {/* Weather + Heat */}
      <div className="grid lg:grid-cols-3 gap-4">
        {loadingWeather ? (
          <div className="lg:col-span-2"><WeatherSkeleton /></div>
        ) : (
          <div className="lg:col-span-2 glass-card p-6 anim-fade-up delay-100 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse 50% 80% at 100% 50%, rgba(251,191,36,0.07), transparent)' }} />
            <div className="relative">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <CloudSun className="w-5 h-5 text-emerald-400" />
                  <span className="font-display font-semibold text-[15px]">Live Weather</span>
                </div>
                {weather && (
                  <span className="chip-neutral text-xs">
                    <MapPin className="w-3 h-3" />{weather.city}
                  </span>
                )}
              </div>

              {weather ? (
                <div className="flex flex-wrap items-start gap-6">
                  <div>
                    <div className="font-display text-5xl font-bold tracking-tight">{weather.temperature}°</div>
                    <div className="text-white/50 text-sm mt-1">{weather.condition}</div>
                    <div className="text-white/30 text-sm">Feels like {weather.feelsLike}°</div>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-2.5 min-w-[200px]">
                    {[
                      { icon: Thermometer, label: 'Feels Like', val: `${weather.feelsLike}°`,   color: 'text-amber-400' },
                      { icon: Droplet,     label: 'Humidity',   val: `${weather.humidity}%`,    color: 'text-sky-400' },
                      { icon: Wind,        label: 'Wind',       val: `${weather.windSpeed} km/h`, color: 'text-cyan-400' },
                      { icon: TrendingUp,  label: 'Time',       val: weather.isDay ? 'Daytime' : 'Night', color: 'text-violet-400' },
                    ].map((m) => (
                      <div key={m.label} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.05]">
                        <m.icon className={`w-4 h-4 ${m.color} shrink-0`} strokeWidth={2} />
                        <div>
                          <div className="text-[10px] text-white/35">{m.label}</div>
                          <div className="text-sm font-semibold">{m.val}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-white/35 text-sm">Weather data unavailable.</p>
              )}

              <Link to="/app/weather" className="inline-flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium mt-4">
                Full forecast <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Heat alert */}
        <div className={`glass-card p-6 anim-fade-up delay-200 ${heat ? `border ${heat.border}` : ''}`}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className={`w-5 h-5 ${heat?.color ?? 'text-white/40'}`} />
            <span className="font-display font-semibold text-[15px]">Heat Alert</span>
          </div>
          {weather && heat ? (
            <>
              <div className="font-display text-4xl font-bold tracking-tight mb-1">{weather.heatIndex}°</div>
              <div className={`chip mb-4 ${heat.bg} ${heat.border} ${heat.color} border`}>{heat.label}</div>
              <p className="text-xs text-white/45 leading-relaxed">{ADVICE[weather.heatAlert]}</p>
            </>
          ) : loadingWeather ? (
            <div className="space-y-3">
              <div className="skeleton h-10 w-20 rounded-xl" />
              <div className="skeleton h-6 w-28 rounded-full" />
            </div>
          ) : (
            <p className="text-white/35 text-sm">No heat data.</p>
          )}
        </div>
      </div>

      {/* Quick Access */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-[15px] text-white/60">Quick Access</h2>
          <Link to="/app/map" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium flex items-center gap-1">
            Open map <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACCESS.map((cat, i) => {
            const meta = CATEGORY_META[cat];
            const Icon = QUICK_ICONS[cat];
            return (
              <Link
                key={cat}
                to={`/app/services/${cat}`}
                className={`glass-card-hover p-4 bg-gradient-to-br ${meta.bg} anim-fade-up`}
                style={{ animationDelay: `${i * 35}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-ink-900/70 flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${meta.color}`} strokeWidth={2} />
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/20 mt-0.5" />
                </div>
                <div className="font-semibold text-[13px] leading-tight">{meta.label}</div>
                <div className="text-[11px] text-white/40 mt-0.5">{meta.description}</div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
