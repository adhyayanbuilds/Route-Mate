import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Bike, MapPin, Phone, LogOut, Check, AlertCircle, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { PageHeader } from '../components/ui/PageHeader';
import { Spinner } from '../components/ui/Spinner';

export function ProfilePage() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [vehicleType, setVehicleType] = useState('bike');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setVehicleType(profile.vehicle_type || 'bike');
      setCity(profile.city || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    const { error: err } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: fullName,
      vehicle_type: vehicleType,
      city,
      phone,
    });
    setSaving(false);
    if (err) {
      setError(err.message);
    } else {
      setSaved(true);
      await refreshProfile();
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const initial = (fullName || 'R').charAt(0).toUpperCase();

  return (
    <div className="max-w-2xl space-y-5">
      <PageHeader
        title="Profile"
        subtitle="Your rider information and preferences"
        backTo="/app/dashboard"
        backLabel="Dashboard"
        icon={<User className="w-5 h-5 text-emerald-400" />}
      />

      {/* Avatar card */}
      <div className="glass-card p-6 flex items-center gap-5 anim-fade-up">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center text-ink-950 font-bold text-2xl font-display shadow-glow-sm">
            {initial}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-ink-800 border border-white/10 flex items-center justify-center">
            <Camera className="w-3 h-3 text-white/50" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display font-semibold text-lg truncate">{fullName || 'Rider'}</h2>
          <p className="text-white/40 text-sm truncate">{user?.email}</p>
          <p className="text-white/30 text-xs mt-0.5 capitalize">{vehicleType} rider · {city || 'No city set'}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="glass-card p-6 space-y-4 anim-fade-up delay-100">
        <h3 className="font-display font-semibold text-[15px] mb-1">Edit profile</h3>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}
        {saved && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
            <Check className="w-4 h-4 shrink-0" />Profile saved successfully.
          </div>
        )}

        <div>
          <label className="label-text" htmlFor="profile-name">Full name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input id="profile-name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name" className="input-field pl-11" autoComplete="name" />
          </div>
        </div>

        <div>
          <label className="label-text" htmlFor="profile-vehicle">Vehicle type</label>
          <div className="relative">
            <Bike className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none z-10" />
            <select id="profile-vehicle" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}
              className="input-field pl-11 cursor-pointer" style={{ appearance: 'none' }}>
              <option value="bike">Bike / Motorcycle</option>
              <option value="scooter">Scooter</option>
              <option value="cycle">Bicycle</option>
              <option value="car">Car</option>
              <option value="auto">Auto Rickshaw</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1l5 5 5-5" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label className="label-text" htmlFor="profile-city">City</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input id="profile-city" type="text" value={city} onChange={(e) => setCity(e.target.value)}
              placeholder="Your city" className="input-field pl-11" autoComplete="address-level2" />
          </div>
        </div>

        <div>
          <label className="label-text" htmlFor="profile-phone">Phone <span className="text-white/25">(optional)</span></label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input id="profile-phone" type="tel" value={phone ?? ''} onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9999 999999" className="input-field pl-11" autoComplete="tel" />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? <Spinner size="sm" /> : 'Save changes'}
        </button>
      </form>

      {/* Danger zone */}
      <div className="glass-card p-5 border border-rose-500/15 anim-fade-up delay-200">
        <h3 className="font-display font-semibold text-[15px] mb-1">Account</h3>
        <p className="text-white/35 text-sm mb-4">Sign out from RouteMate on this device.</p>
        <button onClick={handleSignOut} className="btn-danger w-full sm:w-auto">
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
