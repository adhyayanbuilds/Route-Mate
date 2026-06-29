import { Link } from 'react-router-dom';
import {
  Bike,
  Droplets,
  UtensilsCrossed,
  GlassWater,
  Fuel,
  Wrench,
  HeartPulse,
  BedDouble,
  ParkingCircle,
  ArrowRight,
  MapPin,
  Shield,
  Zap,
  Star,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SERVICES = [
  { icon: Droplets,       label: 'Washrooms',      sub: 'Clean & nearby',       color: 'text-sky-400',    bg: 'bg-sky-500/10' },
  { icon: UtensilsCrossed, label: 'Budget Meals',  sub: 'Affordable eats',      color: 'text-amber-400',  bg: 'bg-amber-500/10' },
  { icon: GlassWater,     label: 'Drinking Water', sub: 'Free refill points',   color: 'text-cyan-400',   bg: 'bg-cyan-500/10' },
  { icon: Fuel,           label: 'Fuel Stations',  sub: 'Petrol & CNG',         color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { icon: Wrench,         label: 'Repair Shops',   sub: 'Tyres & mechanics',    color: 'text-rose-400',   bg: 'bg-rose-500/10' },
  { icon: HeartPulse,     label: 'Hospitals',      sub: 'Emergency care',       color: 'text-red-400',    bg: 'bg-red-500/10' },
  { icon: BedDouble,      label: 'Rest Stops',     sub: 'Parks & shade zones',  color: 'text-violet-400', bg: 'bg-violet-500/10' },
  { icon: ParkingCircle,  label: 'Parking',        sub: 'Free & paid spots',    color: 'text-emerald-400',bg: 'bg-emerald-500/10' },
];

const BENEFITS = [
  {
    icon: Zap,
    title: 'Instant results',
    desc: 'Find what you need in seconds. No searching, no scrolling — just tap and go.',
  },
  {
    icon: MapPin,
    title: 'Always accurate',
    desc: 'Powered by OpenStreetMap with your live GPS. Results are sorted by real-time walking distance.',
  },
  {
    icon: Shield,
    title: 'Built for the road',
    desc: 'Designed for one-hand use on a phone mount. Large targets, minimal taps, maximum clarity.',
  },
];

export function LandingPage() {
  const { session } = useAuth();
  const cta = session ? '/app/dashboard' : '/signup';

  return (
    <div className="min-h-screen bg-ink-950 overflow-x-hidden">
      {/* ── Nav ── */}
      <nav className="fixed top-0 inset-x-0 z-50 px-4 sm:px-6 pt-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-5 rounded-2xl glass">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-glow-sm">
              <Bike className="w-4 h-4 text-ink-950" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-[15px] tracking-tight">RouteMate</span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm text-white/55">
            <a href="#services" className="hover:text-white transition-colors">Services</a>
            <a href="#how" className="hover:text-white transition-colors">How it works</a>
            <a href="#why" className="hover:text-white transition-colors">Why RouteMate</a>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-ghost-sm hidden sm:inline-flex">Sign in</Link>
            <Link to={cta} className="btn-primary-sm">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-36 sm:pt-44 pb-24 px-4 sm:px-6">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)',
          }}
        />

        {/* Glow orbs */}
        <div
          className="absolute top-16 left-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)',
            animation: 'floatY 8s ease-in-out infinite',
          }}
        />
        <div
          className="absolute top-32 right-1/4 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(251,191,36,0.1) 0%, transparent 70%)',
            animation: 'floatY 10s ease-in-out infinite 3s',
          }}
        />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Pill badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-white/65 mb-7 anim-fade-up"
            style={{ animationDelay: '0ms' }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            The daily companion for delivery riders
          </div>

          <h1
            className="font-display font-extrabold tracking-tight text-balance anim-fade-up"
            style={{
              fontSize: 'clamp(2.5rem, 8vw, 5.5rem)',
              lineHeight: '1.06',
              animationDelay: '60ms',
            }}
          >
            <span style={{ color: 'white' }}>Find essentials</span>
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              while you ride.
            </span>
          </h1>

          <p
            className="mt-6 text-base sm:text-lg text-white/50 max-w-xl mx-auto text-balance leading-relaxed anim-fade-up"
            style={{ animationDelay: '120ms' }}
          >
            Washrooms, food, fuel, repairs, and more — all sorted by distance from your
            current location. Built for Swiggy, Zomato, Blinkit, and Amazon riders.
          </p>

          <div
            className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3 anim-fade-up"
            style={{ animationDelay: '180ms' }}
          >
            <Link to={cta} className="btn-primary w-full sm:w-auto text-[15px] px-7 py-3.5">
              Start for free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#how" className="btn-ghost w-full sm:w-auto text-[15px] px-7 py-3.5">
              See how it works
              <ChevronDown className="w-4 h-4" />
            </a>
          </div>

          {/* Social proof strip */}
          <div
            className="mt-10 flex items-center justify-center gap-1.5 anim-fade-up"
            style={{ animationDelay: '240ms' }}
          >
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-sm text-white/40 ml-2">Built by developers, for riders</span>
          </div>
        </div>

        {/* ── Preview mockup ── */}
        <div
          className="relative max-w-3xl mx-auto mt-16 anim-fade-up"
          style={{ animationDelay: '300ms' }}
        >
          <div className="glass-card p-2 sm:p-2.5">
            <div className="rounded-2xl bg-ink-900 overflow-hidden">
              {/* App chrome */}
              <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-white/50 font-medium">Live location · Bengaluru, KA</span>
                </div>
                <span className="text-[11px] text-white/30">8 services nearby</span>
              </div>

              {/* Services grid */}
              <div className="grid grid-cols-4 gap-px bg-white/[0.04]">
                {SERVICES.slice(0, 4).map((s) => (
                  <div key={s.label} className="bg-ink-900 p-4 flex flex-col items-center gap-2.5 hover:bg-ink-800 transition-colors cursor-pointer">
                    <div className={`w-11 h-11 rounded-2xl ${s.bg} flex items-center justify-center`}>
                      <s.icon className={`w-5 h-5 ${s.color}`} strokeWidth={2} />
                    </div>
                    <span className="text-[11px] font-medium text-white/70 text-center">{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Result list */}
              <div className="px-4 py-3 space-y-2">
                <p className="text-[11px] text-white/30 font-medium uppercase tracking-wider mb-3">Nearest to you</p>
                {[
                  { n: 'Public Washroom — Railway Station', d: '80 m', icon: Droplets, c: 'text-sky-400' },
                  { n: 'Darshini Hotel', d: '210 m', icon: UtensilsCrossed, c: 'text-amber-400' },
                  { n: 'Indian Oil Petrol Pump', d: '450 m', icon: Fuel, c: 'text-orange-400' },
                ].map((r) => (
                  <div key={r.n} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] transition-colors">
                    <r.icon className={`w-4 h-4 ${r.c} shrink-0`} strokeWidth={2} />
                    <span className="text-sm flex-1 text-white/80">{r.n}</span>
                    <span className="text-xs text-white/35 font-medium">{r.d}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white/20" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating chips */}
          <div className="absolute -top-3 -right-3 sm:-right-6 bg-emerald-500 text-ink-950 text-xs font-bold px-3 py-1.5 rounded-full shadow-glow-sm hidden sm:block">
            Live GPS
          </div>
          <div className="absolute -bottom-3 -left-3 sm:-left-6 glass text-white/70 text-xs font-medium px-3 py-1.5 rounded-full hidden sm:block">
            No app download needed
          </div>
        </div>

        <div className="flex justify-center mt-12">
          <a
            href="#services"
            className="flex flex-col items-center gap-2 text-white/25 hover:text-white/50 transition-colors"
            aria-label="Scroll down"
          >
            <span className="text-xs">Explore</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </a>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="px-4 sm:px-6 py-8">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { n: '8', l: 'Essential services' },
            { n: '24/7', l: 'Always on' },
            { n: '3 km', l: 'Search radius' },
            { n: 'Free', l: 'No cost, ever' },
          ].map((s, i) => (
            <div
              key={s.l}
              className="glass-card p-5 text-center anim-fade-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="font-display text-2xl sm:text-3xl font-bold text-emerald-400">{s.n}</div>
              <div className="text-xs text-white/45 mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Services ── */}
      <section id="services" className="px-4 sm:px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-label mb-3">Services</p>
            <h2 className="font-display font-bold tracking-tight text-balance" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>
              Everything you need,
              <span className="text-emerald-400"> right where you are.</span>
            </h2>
            <p className="mt-4 text-white/45 text-[15px] max-w-lg mx-auto">
              Eight categories of essential services, fetched live from OpenStreetMap and sorted by distance from your current location.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {SERVICES.map((s, i) => (
              <div
                key={s.label}
                className="glass-card-hover p-5 flex flex-col items-center text-center anim-fade-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center mb-3`}>
                  <s.icon className={`w-6 h-6 ${s.color}`} strokeWidth={2} />
                </div>
                <div className="font-semibold text-sm mb-0.5">{s.label}</div>
                <div className="text-[11px] text-white/40">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="px-4 sm:px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-label mb-3">How it works</p>
            <h2 className="font-display font-bold tracking-tight" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>
              Three steps to anything nearby.
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              { num: '1', icon: MapPin, title: 'Allow location', desc: 'RouteMate uses your GPS to know exactly where you are. No account needed to start.' },
              { num: '2', icon: Zap,    title: 'Pick a category', desc: 'Tap any service — washrooms, food, fuel, hospitals. Results appear instantly.' },
              { num: '3', icon: ArrowRight, title: 'Get directions', desc: 'One tap opens Google Maps with turn-by-turn navigation to the selected spot.' },
            ].map((step, i) => (
              <div
                key={step.title}
                className="glass-card p-7 relative anim-fade-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="absolute top-0 left-0 w-8 h-8 bg-emerald-500 text-ink-950 rounded-tl-3xl rounded-br-2xl flex items-center justify-center font-display font-bold text-sm">
                  {step.num}
                </div>
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-5 mt-4">
                  <step.icon className="w-5 h-5 text-emerald-400" strokeWidth={2} />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why RouteMate ── */}
      <section id="why" className="px-4 sm:px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-label mb-3">Why RouteMate</p>
            <h2 className="font-display font-bold tracking-tight" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>
              Designed with delivery workers in mind.
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {BENEFITS.map((b, i) => (
              <div
                key={b.title}
                className="glass-card p-7 anim-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-5">
                  <b.icon className="w-5 h-5 text-emerald-400" strokeWidth={2} />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{b.title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-4 sm:px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <div
            className="glass-card p-10 sm:p-14 text-center relative overflow-hidden"
            style={{ borderColor: 'rgba(16,185,129,0.2)' }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(16,185,129,0.12), transparent)',
              }}
            />
            <div className="relative">
              <div className="w-14 h-14 rounded-3xl bg-emerald-500/15 flex items-center justify-center mx-auto mb-6">
                <Bike className="w-7 h-7 text-emerald-400" strokeWidth={2} />
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight mb-3">
                Ready to ride smarter?
              </h2>
              <p className="text-white/45 text-[15px] mb-8 max-w-sm mx-auto">
                Join delivery professionals who use RouteMate to work more efficiently every day. Free, forever.
              </p>
              <Link to={cta} className="btn-primary text-[15px] px-8 py-3.5 inline-flex">
                Get started for free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-4 sm:px-6 py-10 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Bike className="w-4 h-4 text-ink-950" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-sm tracking-tight">RouteMate</span>
          </div>

          <p className="text-sm text-white/30">
            Built for delivery professionals · 2025
          </p>

          <div className="flex items-center gap-4 text-sm text-white/30">
            <Link to="/login" className="hover:text-white/60 transition-colors">Sign in</Link>
            <Link to="/signup" className="hover:text-white/60 transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
