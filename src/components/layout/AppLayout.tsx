import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  CloudSun,
  Heart,
  User,
  LogOut,
  Bike,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/map',       label: 'Map',        icon: Map },
  { to: '/app/weather',   label: 'Weather',    icon: CloudSun },
  { to: '/app/favorites', label: 'Favorites',  icon: Heart },
  { to: '/app/profile',   label: 'Profile',    icon: User },
];

export function AppLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const initial = (profile?.full_name || 'R').charAt(0).toUpperCase();

  // Derive page title for mobile header
  const pageTitle = (() => {
    const seg = location.pathname.split('/').pop() ?? '';
    if (seg === 'dashboard') return 'RouteMate';
    const map: Record<string, string> = {
      map: 'Nearby Map', weather: 'Weather', favorites: 'Favorites',
      profile: 'Profile', settings: 'Settings',
    };
    return map[seg] ?? 'RouteMate';
  })();

  return (
    <div className="min-h-dvh bg-ink-950">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-white/[0.07] bg-ink-900/60 backdrop-blur-2xl z-40">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-white/[0.06]">
          <NavLink to="/app/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-glow-sm">
              <Bike className="w-5 h-5 text-ink-950" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">RouteMate</span>
          </NavLink>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <item.icon className="w-[18px] h-[18px]" strokeWidth={2} />
              {item.label}
            </NavLink>
          ))}

          <hr className="divider my-2" />

          <NavLink
            to="/app/settings"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <Settings className="w-[18px] h-[18px]" strokeWidth={2} />
            Settings
          </NavLink>
        </nav>

        {/* User footer */}
        <div className="px-3 py-4 border-t border-white/[0.06] space-y-0.5">
          <NavLink
            to="/app/profile"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center text-ink-950 font-bold text-xs">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate text-white">
                {profile?.full_name || 'Rider'}
              </p>
              <p className="text-[11px] text-white/35 truncate capitalize leading-tight">
                {profile?.vehicle_type || 'bike'} · {profile?.city || 'Set your city'}
              </p>
            </div>
          </NavLink>
          <button onClick={handleSignOut} className="nav-link w-full hover:text-rose-400">
            <LogOut className="w-[18px] h-[18px]" strokeWidth={2} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 border-b border-white/[0.07] bg-ink-950/85 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Bike className="w-4 h-4 text-ink-950" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold tracking-tight text-[15px]">{pageTitle}</span>
        </div>
        <NavLink
          to="/app/profile"
          className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center text-ink-950 font-bold text-sm"
          aria-label="Profile"
        >
          {initial}
        </NavLink>
      </header>

      {/* ── Main content ── */}
      <main className="lg:pl-64 pb-[calc(4rem+env(safe-area-inset-bottom,0px))] lg:pb-0 min-h-dvh">
        <div className="px-4 sm:px-5 lg:px-8 py-5 lg:py-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/[0.07] bg-ink-900/90 backdrop-blur-xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-center justify-around px-1 h-16">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 px-3 h-full min-w-[52px] transition-colors duration-150 ${
                  isActive ? 'text-emerald-400' : 'text-white/40'
                }`
              }
              aria-label={item.label}
            >
              {({ isActive }) => (
                <>
                  <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.8} />
                  <span className="text-[11px] font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
