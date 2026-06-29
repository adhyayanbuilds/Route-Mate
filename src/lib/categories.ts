import type { ServiceCategory } from '../types';

export const CATEGORY_META: Record<
  ServiceCategory,
  {
    label: string;
    short: string;
    iconName: string;
    color: string;
    bg: string;
    glow: string;
    description: string;
  }
> = {
  washrooms: {
    label: 'Washrooms',
    short: 'Washrooms',
    iconName: 'Droplets',
    color: 'text-sky-400',
    bg: 'from-sky-500/20 to-sky-500/5',
    glow: 'shadow-[0_0_30px_-8px_rgba(56,189,248,0.4)]',
    description: 'Clean public washrooms & restrooms',
  },
  meals: {
    label: 'Budget Meals',
    short: 'Meals',
    iconName: 'UtensilsCrossed',
    color: 'text-amber-400',
    bg: 'from-amber-500/20 to-amber-500/5',
    glow: 'shadow-[0_0_30px_-8px_rgba(251,191,36,0.4)]',
    description: 'Affordable restaurants & food stalls',
  },
  water: {
    label: 'Drinking Water',
    short: 'Water',
    iconName: 'GlassWater',
    color: 'text-cyan-400',
    bg: 'from-cyan-500/20 to-cyan-500/5',
    glow: 'shadow-[0_0_30px_-8px_rgba(34,211,238,0.4)]',
    description: 'Free drinking water & refill stations',
  },
  fuel: {
    label: 'Fuel Stations',
    short: 'Fuel',
    iconName: 'Fuel',
    color: 'text-orange-400',
    bg: 'from-orange-500/20 to-orange-500/5',
    glow: 'shadow-[0_0_30px_-8px_rgba(249,115,22,0.4)]',
    description: 'Nearby petrol & fuel pumps',
  },
  repair: {
    label: 'Repair Shops',
    short: 'Repair',
    iconName: 'Wrench',
    color: 'text-rose-400',
    bg: 'from-rose-500/20 to-rose-500/5',
    glow: 'shadow-[0_0_30px_-8px_rgba(251,113,133,0.4)]',
    description: 'Bike mechanics & tyre shops',
  },
  hospitals: {
    label: 'Hospitals',
    short: 'Medical',
    iconName: 'HeartPulse',
    color: 'text-red-400',
    bg: 'from-red-500/20 to-red-500/5',
    glow: 'shadow-[0_0_30px_-8px_rgba(248,113,113,0.4)]',
    description: 'Hospitals, clinics & pharmacies',
  },
  rest: {
    label: 'Rest Stops',
    short: 'Rest',
    iconName: 'BedDouble',
    color: 'text-violet-400',
    bg: 'from-violet-500/20 to-violet-500/5',
    glow: 'shadow-[0_0_30px_-8px_rgba(167,139,250,0.4)]',
    description: 'Parks, shaded areas & rest zones',
  },
  parking: {
    label: 'Parking',
    short: 'Parking',
    iconName: 'ParkingCircle',
    color: 'text-emerald-400',
    bg: 'from-emerald-500/20 to-emerald-500/5',
    glow: 'shadow-[0_0_30px_-8px_rgba(16,185,129,0.4)]',
    description: 'Free & paid bike parking',
  },
};

export const QUICK_ACCESS: ServiceCategory[] = [
  'washrooms',
  'meals',
  'water',
  'fuel',
  'repair',
  'hospitals',
  'rest',
  'parking',
];
