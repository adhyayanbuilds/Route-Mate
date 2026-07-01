import type { GeoPoint, ServiceCategory, Place } from '../types';

export function haversine(a: GeoPoint, b: GeoPoint): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters / 10) * 10} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDuration(mins: number): string {
  if (mins < 60) return `${Math.round(mins)} min`;
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function openInGoogleMaps(lat: number, lng: number, name?: string) {
  const q = name ? `${encodeURIComponent(name)}@${lat},${lng}` : `${lat},${lng}`;
  window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
}

export async function fetchNearbyPois(
  center: GeoPoint,
  category: ServiceCategory,
  radius = 2000,
): Promise<Place[]> {
  const tags = OVERPASS_TAGS[category];
  if (!tags) return [];

  const queryParts = tags.map(
  (t) =>
    'node["${t.key}"~"${t.value}"](around:${radius},${center.lat},${center.lng});' +
    'way["${t.key}"~"${t.value}"](around:${radius},${center.lat},${center.lng});',
);
  
  const query = '[out:json][timeout:25];(' + queryParts.join('') + ');out center 50;';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch('/api/overpass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'data=' + encodeURIComponent(query),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) return [];
    const json = await res.json();
    return (json.elements || [])
      .map((el: OverpassElement) => mapOverpassToPlace(el, center, category))
      .filter((p: Place | null): p is Place => p !== null)
      .sort((a: Place, b: Place) => a.distance - b.distance);
  } catch {
    clearTimeout(timeoutId);
    return [];
  }
}

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function mapOverpassToPlace(
  el: OverpassElement,
  center: GeoPoint,
  category: ServiceCategory,
): Place | null {
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (lat == null || lng == null) return null;

  const t = el.tags || {};
  const name =
    t.name || t.brand || t.operator || DEFAULT_NAMES[category] || 'Unnamed place';
  const distance = haversine(center, { lat, lng });

  const tagSet = new Set<string>();

  // Accessibility
  if (t.wheelchair === 'yes') tagSet.add('Wheelchair accessible');
  else if (t.wheelchair === 'limited') tagSet.add('Limited access');
  if (t['toilets:wheelchair'] === 'yes') tagSet.add('Wheelchair accessible');

  // Amenity / shop type
  if (t.amenity && t.amenity !== 'parking' && t.amenity !== 'fuel') {
    tagSet.add(t.amenity.replace(/_/g, ' '));
  }
  if (t.shop) tagSet.add(t.shop.replace(/_/g, ' '));
  if (t.craft) tagSet.add(t.craft.replace(/_/g, ' '));

  // Cuisine
  if (t.cuisine) {
    t.cuisine
      .split(/[;,]/)
      .slice(0, 2)
      .forEach((c) => tagSet.add(c.trim().replace(/_/g, ' ')));
  }

  // Street address
  const street = [t['addr:street'], t['addr:city']].filter(Boolean).join(', ');

  // Parse budget from OSM tags
  let budget: Place['budget'];
  if (t['price_range'] === '$' || t['price:range'] === '$') budget = 'low';
  else if (t['price_range'] === '$$' || t['price:range'] === '$$') budget = 'medium';
  else if (t['price_range'] === '$$$' || t['price:range'] === '$$$') budget = 'high';
  else if (t['stars'] && parseInt(t['stars']) <= 2) budget = 'low';
  else if (t['stars'] && parseInt(t['stars']) >= 4) budget = 'high';

  return {
    id: `${el.type}-${el.id}`,
    name,
    category,
    lat,
    lng,
    distance,
    address: street || undefined,
    tags: [...tagSet].slice(0, 4),
    rating: t['stars'] ? parseFloat(t['stars']) : undefined,
    budget,
    cuisine: t.cuisine ? t.cuisine.split(/[;,]/)[0].trim().replace(/_/g, ' ') : undefined,
    accessible: t.wheelchair === 'yes' || t['toilets:wheelchair'] === 'yes',
    openNow: undefined,
  };
}

const DEFAULT_NAMES: Partial<Record<ServiceCategory, string>> = {
  washrooms: 'Public Washroom',
  water: 'Water Station',
  fuel: 'Fuel Station',
  repair: 'Repair Shop',
  hospitals: 'Medical Facility',
  rest: 'Rest Stop',
  parking: 'Parking Area',
  meals: 'Restaurant',
};

interface OverpassTagDef { key: string; value: string; }

const OVERPASS_TAGS: Record<ServiceCategory, OverpassTagDef[]> = {
  washrooms: [
    { key: 'amenity', value: 'toilets' },
    { key: 'amenity', value: 'public_bath' },
  ],
  meals: [
    { key: 'amenity', value: 'restaurant|fast_food|food_court|cafe|biergarten' },
    { key: 'shop', value: 'bakery|deli|convenience' },
  ],
  water: [
    { key: 'amenity', value: 'drinking_water' },
    { key: 'drinking_water', value: 'yes' },
    { key: 'amenity', value: 'cafe|water_point' },
    { key: 'man_made', value: 'water_well|water_tap' },
  ],
  fuel: [
    { key: 'amenity', value: 'fuel' },
  ],
  repair: [
    { key: 'shop', value: 'motorcycle_repair|tyres|bicycle|car_repair|vehicle' },
    { key: 'craft', value: 'mechanic' },
  ],
  hospitals: [
    { key: 'amenity', value: 'hospital|clinic|doctors|pharmacy|dentist' },
    { key: 'healthcare', value: 'hospital|clinic|doctor|pharmacy' },
  ],
  rest: [
    { key: 'highway', value: 'rest_area|services' },
    { key: 'leisure', value: 'park|garden' },
    { key: 'amenity', value: 'bus_station|shelter' },
    { key: 'tourism', value: 'camp_site|picnic_site' },
  ],
  parking: [
    { key: 'amenity', value: 'parking|motorcycle_parking|bicycle_parking' },
    { key: 'parking', value: 'surface|multi-storey|underground' },
  ],
};
