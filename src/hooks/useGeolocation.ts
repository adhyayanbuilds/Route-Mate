import { useEffect, useRef, useState } from 'react';
import type { GeoPoint } from '../types';

// Bengaluru as fallback — clearly a default, not the user's real location
const FALLBACK_LOCATION: GeoPoint = { lat: 12.9716, lng: 77.5946 };

export function useGeolocation() {
  const [location, setLocation] = useState<GeoPoint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by this browser');
      setLocation(FALLBACK_LOCATION);
      setIsDefault(true);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!mountedRef.current) return;
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        if (!mountedRef.current) return;
        setPermissionDenied(err.code === err.PERMISSION_DENIED);
        setError(err.message);
        setLocation(FALLBACK_LOCATION);
        setIsDefault(true);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  }, []);

  return { location, error, loading, permissionDenied, isDefault, setLocation };
}
