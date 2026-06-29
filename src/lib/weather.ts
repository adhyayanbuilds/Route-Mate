import type { GeoPoint, WeatherData } from '../types';

export async function fetchWeather(point: GeoPoint): Promise<WeatherData | null> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${point.lat}&longitude=${point.lng}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const c = json.current;
    if (!c) return null;

    const temperature = Math.round(c.temperature_2m);
    const feelsLike = Math.round(c.apparent_temperature);
    const humidity = c.relative_humidity_2m as number;
    const windSpeed = Math.round(c.wind_speed_10m);
    const conditionCode = c.weather_code as number;
    const { condition, icon } = mapWeatherCode(conditionCode);
    const heatIndex = computeHeatIndex(temperature, humidity);
    const heatAlert = heatAlertLevel(heatIndex);

    let city = 'Your location';
    try {
      const geo = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${point.lat}&lon=${point.lng}&zoom=10`,
        {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'RouteMate/1.0 (delivery-companion-app)',
          },
        },
      );
      if (geo.ok) {
        const g = await geo.json();
        city =
          g.address?.city ||
          g.address?.town ||
          g.address?.village ||
          g.address?.suburb ||
          g.address?.county ||
          g.display_name?.split(',')[0] ||
          city;
      }
    } catch {
      // keep default
    }

    return {
      temperature,
      feelsLike,
      humidity,
      windSpeed,
      condition,
      conditionCode,
      icon,
      isDay: c.is_day === 1,
      city,
      heatIndex,
      heatAlert,
    };
  } catch {
    return null;
  }
}

function computeHeatIndex(tempC: number, humidity: number): number {
  const t = (tempC * 9) / 5 + 32; // to Fahrenheit
  if (t < 80) return tempC; // below ~27°C: HI = temp (low humidity effect)
  const hi =
    -42.379 +
    2.04901523 * t +
    10.14333127 * humidity -
    0.22475541 * t * humidity -
    0.00683783 * t * t -
    0.05481717 * humidity * humidity +
    0.00122874 * t * t * humidity +
    0.00085282 * t * humidity * humidity -
    0.00000199 * t * t * humidity * humidity;
  return Math.round(((hi - 32) * 5) / 9);
}

function heatAlertLevel(hi: number): WeatherData['heatAlert'] {
  if (hi >= 52) return 'danger';
  if (hi >= 41) return 'extreme';
  if (hi >= 32) return 'caution';
  return 'safe';
}

function mapWeatherCode(code: number): { condition: string; icon: string } {
  const map: Record<number, { condition: string; icon: string }> = {
    0: { condition: 'Clear sky', icon: 'Sun' },
    1: { condition: 'Mainly clear', icon: 'Sun' },
    2: { condition: 'Partly cloudy', icon: 'CloudSun' },
    3: { condition: 'Overcast', icon: 'Cloud' },
    45: { condition: 'Fog', icon: 'CloudFog' },
    48: { condition: 'Rime fog', icon: 'CloudFog' },
    51: { condition: 'Light drizzle', icon: 'CloudDrizzle' },
    53: { condition: 'Drizzle', icon: 'CloudDrizzle' },
    55: { condition: 'Heavy drizzle', icon: 'CloudDrizzle' },
    56: { condition: 'Freezing drizzle', icon: 'CloudDrizzle' },
    57: { condition: 'Heavy freezing drizzle', icon: 'CloudDrizzle' },
    61: { condition: 'Light rain', icon: 'CloudRain' },
    63: { condition: 'Rain', icon: 'CloudRain' },
    65: { condition: 'Heavy rain', icon: 'CloudRainWind' },
    66: { condition: 'Freezing rain', icon: 'CloudRain' },
    67: { condition: 'Heavy freezing rain', icon: 'CloudRainWind' },
    71: { condition: 'Light snow', icon: 'CloudSnow' },
    73: { condition: 'Snow', icon: 'CloudSnow' },
    75: { condition: 'Heavy snow', icon: 'CloudSnow' },
    77: { condition: 'Snow grains', icon: 'CloudSnow' },
    80: { condition: 'Rain showers', icon: 'CloudRain' },
    81: { condition: 'Heavy showers', icon: 'CloudRainWind' },
    82: { condition: 'Violent showers', icon: 'CloudRainWind' },
    85: { condition: 'Snow showers', icon: 'CloudSnow' },
    86: { condition: 'Heavy snow showers', icon: 'CloudSnow' },
    95: { condition: 'Thunderstorm', icon: 'CloudLightning' },
    96: { condition: 'Storm with hail', icon: 'CloudLightning' },
    99: { condition: 'Severe thunderstorm', icon: 'CloudLightning' },
  };
  return map[code] || { condition: 'Cloudy', icon: 'Cloud' };
}
