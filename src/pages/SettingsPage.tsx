import { useState, useEffect } from 'react';
import { Settings, Bell, Map, Ruler, Shield, Info, ChevronRight } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface SettingsState {
  notifications: boolean;
  heatAlerts: boolean;
  hydrationReminders: boolean;
  searchRadius: number;
  units: string;
}

const DEFAULTS: SettingsState = {
  notifications: true,
  heatAlerts: true,
  hydrationReminders: true,
  searchRadius: 3,
  units: 'metric',
};

type BoolKey = 'notifications' | 'heatAlerts' | 'hydrationReminders';
type SelectKey = 'searchRadius' | 'units';

interface ToggleRow { kind: 'toggle'; key: BoolKey; label: string; sub: string; }
interface SelectRow { kind: 'select'; key: SelectKey; label: string; sub: string; options: { v: string | number; l: string }[]; }
type SettingRow = ToggleRow | SelectRow;

function Toggle({ checked, onChange, id }: { checked: boolean; onChange: (v: boolean) => void; id: string }) {
  return (
    <button
      role="switch" aria-checked={checked} id={id}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex items-center rounded-full transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
        checked ? 'bg-emerald-500' : 'bg-white/15'
      }`}
      style={{ width: 44, height: 24 }}
    >
      <span
        className="inline-block rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{ width: 18, height: 18, transform: checked ? 'translateX(22px)' : 'translateX(3px)' }}
      />
    </button>
  );
}

function Row({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-white/[0.05] last:border-0">
      <div className="min-w-0">
        <div className="text-[15px] font-medium">{label}</div>
        {sub && <div className="text-xs text-white/35 mt-0.5">{sub}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SettingsState>(DEFAULTS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('meta')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        const meta = (data as { meta?: Partial<SettingsState> } | null)?.meta;
        if (meta) setSettings((prev) => ({ ...prev, ...meta }));
      });
  }, [user]);

  const save = async (next: SettingsState) => {
    setSettings(next);
    if (!user) return;
    await supabase.from('profiles').update({ meta: next }).eq('id', user.id);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const SECTIONS: { title: string; icon: typeof Settings; rows: SettingRow[] }[] = [
    {
      title: 'Notifications',
      icon: Bell,
      rows: [
        { kind: 'toggle', key: 'notifications',       label: 'Push notifications',    sub: 'App updates and reminders' },
        { kind: 'toggle', key: 'heatAlerts',           label: 'Heat alerts',            sub: 'Warn when heat index is high' },
        { kind: 'toggle', key: 'hydrationReminders',   label: 'Hydration reminders',    sub: 'Periodic drink water prompts' },
      ],
    },
    {
      title: 'Search & Map',
      icon: Map,
      rows: [
        {
          kind: 'select', key: 'searchRadius',
          label: 'Search radius', sub: `Currently: ${settings.searchRadius} km`,
          options: [{ v: 1, l: '1 km' }, { v: 2, l: '2 km' }, { v: 3, l: '3 km' }, { v: 5, l: '5 km' }],
        },
      ],
    },
    {
      title: 'Units',
      icon: Ruler,
      rows: [
        {
          kind: 'select', key: 'units',
          label: 'Distance units', sub: settings.units === 'metric' ? 'Kilometres & metres' : 'Miles & feet',
          options: [{ v: 'metric', l: 'Metric (km)' }, { v: 'imperial', l: 'Imperial (mi)' }],
        },
      ],
    },
  ];

  return (
    <div className="max-w-2xl space-y-5">
      <PageHeader
        title="Settings"
        subtitle="Customise your RouteMate experience"
        backTo="/app/dashboard"
        backLabel="Dashboard"
        icon={<Settings className="w-5 h-5 text-white/60" />}
      />

      {saved && (
        <div className="px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm anim-fade-in">
          Settings saved.
        </div>
      )}

      {SECTIONS.map(({ title, icon: Icon, rows }) => (
        <div key={title} className="glass-card px-5 anim-fade-up">
          <div className="flex items-center gap-2.5 py-4 border-b border-white/[0.06]">
            <Icon className="w-4 h-4 text-emerald-400" strokeWidth={2} />
            <span className="font-display font-semibold text-[15px]">{title}</span>
          </div>
          {rows.map((row) => (
            <Row key={row.key} label={row.label} sub={row.sub}>
              {row.kind === 'toggle' ? (
                <Toggle
                  id={`setting-${row.key}`}
                  checked={settings[row.key] as boolean}
                  onChange={(v) => save({ ...settings, [row.key]: v })}
                />
              ) : (
                <div className="relative">
                  <select
                    value={String(settings[row.key])}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const val = row.key === 'searchRadius' ? parseFloat(raw) : raw;
                      save({ ...settings, [row.key]: val });
                    }}
                    className="input-field py-2 px-3 text-sm pr-8"
                    style={{ minWidth: 120, appearance: 'none' }}
                  >
                    {row.options.map((o) => (
                      <option key={String(o.v)} value={String(o.v)}>{o.l}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                      <path d="M1 1l4 4 4-4" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
              )}
            </Row>
          ))}
        </div>
      ))}

      {/* Privacy */}
      <div className="glass-card px-5 anim-fade-up delay-200">
        <div className="flex items-center gap-2.5 py-4 border-b border-white/[0.06]">
          <Shield className="w-4 h-4 text-emerald-400" strokeWidth={2} />
          <span className="font-display font-semibold text-[15px]">Privacy & Data</span>
        </div>
        <Row label="Location data" sub="Used only to find nearby services — never stored or shared.">
          <span className="chip-success text-[11px]">Safe</span>
        </Row>
        <Row label="Account data" sub="Your profile is stored securely in Supabase.">
          <span className="chip-success text-[11px]">Encrypted</span>
        </Row>
      </div>

      {/* About */}
      <div className="glass-card px-5 anim-fade-up delay-300">
        <div className="flex items-center gap-2.5 py-4 border-b border-white/[0.06]">
          <Info className="w-4 h-4 text-emerald-400" strokeWidth={2} />
          <span className="font-display font-semibold text-[15px]">About</span>
        </div>
        <Row label="Version"><span className="text-white/35 text-sm">2.0.0</span></Row>
        <Row label="Map data"><span className="text-white/35 text-sm">OpenStreetMap</span></Row>
        <Row label="Weather"><span className="text-white/35 text-sm">Open-Meteo API</span></Row>
        <Row label="Feedback">
          <ChevronRight className="w-4 h-4 text-white/25" />
        </Row>
      </div>
    </div>
  );
}
