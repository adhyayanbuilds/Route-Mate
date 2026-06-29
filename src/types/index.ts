export type ServiceCategory =
  | 'washrooms'
  | 'meals'
  | 'water'
  | 'fuel'
  | 'repair'
  | 'hospitals'
  | 'rest'
  | 'parking';

export interface Place {
  id: string;
  name: string;
  category: ServiceCategory;
  lat: number;
  lng: number;
  distance: number; // metres
  address?: string;
  tags: string[];
  rating?: number;
  budget?: 'low' | 'medium' | 'high';
  cuisine?: string;
  accessible?: boolean;
  openNow?: boolean;
}

export interface DeliveryLog {
  id: string;
  log_date: string;
  deliveries: number;
  earnings: number;
  distance_km: number;
  hours_worked: number;
  notes: string | null;
}

export interface Profile {
  id: string;
  full_name: string;
  vehicle_type: string;
  city: string;
  avatar_url: string | null;
  phone: string | null;
}

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  conditionCode: number;
  icon: string;
  isDay: boolean;
  city: string;
  heatIndex: number;
  heatAlert: 'safe' | 'caution' | 'extreme' | 'danger';
}

export interface GeoPoint {
  lat: number;
  lng: number;
}
