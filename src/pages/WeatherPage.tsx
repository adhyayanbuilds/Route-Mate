import { useEffect, useState } from 'react';
import {
  Thermometer, Droplets, Wind, Sun,
  AlertTriangle, GlassWater, CloudRain, MapPin,
} from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';
import { fetchWeather } from '../lib/weather';
import { PageHeader } from '../components/ui/PageHeader';
import { WeatherSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import type { WeatherData } from '../types';

const ALERT = {
  safe:    { label: 'Safe to ride',    color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', bar: 'bg-emerald-500' },
  caution: { label: 'Stay hydrated',   color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/25',   bar: 'bg-amber-400' },
  extreme: { label: 'Extreme heat',    color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/25',  bar: 'bg-orange-400' },
  danger:  { label: 'Dangerous heat',  color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/25',     bar: 'bg-red-500' },
};

const ADVICE = {
  safe:    'Conditions are comfortable for delivery work. Drink water every 30 minutes.',
  caution: 'Elevated heat detected. Drink water every 20 minutes, take shade breaks.',
  extreme: 'Avoid riding during peak hours (12–3 PM). Hydrate every 15 minutes with ORS.',
  danger:  'Heat is dangerous. Minimize outdoor exposure, seek air-conditioned rest urgently.',
};

// Heat index scale: 0% = 20°C, 100% = 55°C
const heatPercent = (hi: number) => Math.max(0, Math.min(100, ((hi - 20) / 35) * 100));

function MetricTile({ icon: Icon, label, value, sub, color }: {
  icon: typeof Thermometer; label: string; value: string; sub?: string; color: string;
}) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.05] border border-white/[0.06]">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color.replace('text-', 'bg-').replace('-4', '-5')}/10`}>
        <Icon className={`w-5 h-5 ${color}`} strokeWidth={2} />
      </div>
      <div>
        <p className="text-[11px] text-white/35">{label}</p>
        <p className="font-display font-semibold text-[15px] leading-tight">{value}</p>
        {sub && <p className="text-[11px] text-white/35">{sub}</p>}
      </div>
    </div>
  );
}

export function WeatherPage() {
  const { location, loading, permissionDenied } = useGeolocation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  useEffect(() => {
    if (!location) return;
    setLoadingWeather(true);
    fetchWeather(location).then(setWeather).finally(() => setLoadingWeather(false));
  }, [location?.lat, location?.lng]);

  const alert = weather ? ALERT[weather.heatAlert] : null;

  return (
    <div className="space-y-5 max-w-3xl">
      <PageHeader
        title="Weather"
        subtitle="Live conditions and heat safety for your ride"
        backTo="/app/dashboard"
        backLabel="Dashboard"
        icon={<Sun className="w-5 h-5 text-amber-400" />}
      />

      {loading || loadingWeather ? (
        <WeatherSkeleton />
      ) : !weather ? (
        <EmptyState
          icon={<CloudRain className="w-8 h-8" strokeWidth={1.5} />}
          title="Weather unavailable"
          description="Could not fetch weather data. Check your connection and try again."
        />
      ) : (
        <>
          {/* Main card */}
          <div className="glass-card p-7 relative overflow-hidden anim-fade-up">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse 60% 80% at 90% 10%, rgba(251,191,36,0.1), transparent)' }}
            />
            <div className="relative">
              <div className="flex items-center gap-2 text-white/40 text-sm mb-5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                {weather.city}
                {permissionDenied && <span className="text-white/25 text-xs">(default location)</span>}
              </div>

              <div className="flex flex-wrap gap-6 items-start">
                <div>
                  <div className="font-display font-bold tracking-tight" style={{ fontSize: '4.5rem', lineHeight: 1 }}>
                    {weather.temperature}°
                  </div>
                  <div className="text-white/55 text-lg mt-2 font-medium">{weather.condition}</div>
                  <div className="text-white/30 text-sm mt-0.5">Feels like {weather.feelsLike}°C</div>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-2.5 min-w-[220px]">
                  <MetricTile icon={Thermometer} label="Feels Like" value={`${weather.feelsLike}°C`} color="text-amber-400" />
                  <MetricTile icon={Droplets}    label="Humidity"   value={`${weather.humidity}%`}   color="text-sky-400" />
                  <MetricTile icon={Wind}        label="Wind Speed" value={`${weather.windSpeed} km/h`} color="text-cyan-400" />
                  <MetricTile
                    icon={Sun}
                    label="Daylight"
                    value={weather.isDay ? 'Daytime' : 'Nighttime'}
                    color="text-amber-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Heat index */}
          <div className={`glass-card p-6 border ${alert?.border} anim-fade-up delay-100`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl ${alert?.bg} flex items-center justify-center`}>
                <AlertTriangle className={`w-5 h-5 ${alert?.color}`} strokeWidth={2} />
              </div>
              <div>
                <div className="font-display font-semibold text-[15px]">Heat Index</div>
                <div className={`text-sm ${alert?.color}`}>{alert?.label}</div>
              </div>
              <div className="ml-auto font-display font-bold text-3xl tracking-tight">{weather.heatIndex}°</div>
            </div>

            {/* Progress bar */}
            <div className="h-2 rounded-full bg-white/[0.07] mb-4 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${alert?.bar}`}
                style={{ width: `${heatPercent(weather.heatIndex)}%` }}
              />
            </div>

            <p className="text-sm text-white/45 leading-relaxed">{ADVICE[weather.heatAlert]}</p>
          </div>

          {/* Hydration + Ride conditions */}
          <div className="grid sm:grid-cols-2 gap-4 anim-fade-up delay-200">
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <GlassWater className="w-5 h-5 text-cyan-400" strokeWidth={2} />
                </div>
                <span className="font-display font-semibold text-[15px]">Hydration</span>
              </div>
              <p className="text-white/45 text-sm leading-relaxed">
                {weather.heatAlert === 'safe'
                  ? 'Drink water every 30 minutes. Carry at least 1 litre.'
                  : weather.heatAlert === 'caution'
                  ? 'Drink water every 20 minutes. Carry 1.5–2 litres.'
                  : 'Drink water every 10–15 minutes. Use ORS if sweating heavily.'}
              </p>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <Wind className="w-5 h-5 text-violet-400" strokeWidth={2} />
                </div>
                <span className="font-display font-semibold text-[15px]">Ride Conditions</span>
              </div>
              <p className="text-white/45 text-sm leading-relaxed">
                {weather.conditionCode >= 95
                  ? 'Thunderstorm risk — delay non-urgent deliveries if possible.'
                  : weather.conditionCode >= 61
                  ? 'Rain expected — wear rain gear and ride carefully.'
                  : weather.heatAlert === 'danger'
                  ? 'Severe heat — minimise riding, prioritise rider safety.'
                  : 'Good conditions for riding. Stay safe on the road.'}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
