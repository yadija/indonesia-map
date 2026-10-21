import { AirQualityData, AQICategory } from '../interfaces/air-quality';
import { getIndonesianTimezoneLabel, getLocationCoordinates } from './weather';

export function evaluateAQI(aqi: number): AQICategory {
  if (aqi <= 50) {
    return {
      level: 'good',
      label: 'Baik',
      badgeClass: 'bg-emerald-400 text-black border border-black',
      barColor: 'bg-emerald-500',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      recommendation:
        'Kualitas udara sangat baik, aman untuk seluruh aktivitas luar ruangan.',
    };
  }
  if (aqi <= 100) {
    return {
      level: 'moderate',
      label: 'Sedang',
      badgeClass: 'bg-amber-300 text-black border border-black',
      barColor: 'bg-amber-400',
      textColor: 'text-amber-600 dark:text-amber-400',
      recommendation:
        'Kualitas udara dapat diterima; kelompok sangat sensitif disarankan waspada.',
    };
  }
  if (aqi <= 150) {
    return {
      level: 'unhealthy-sensitive',
      label: 'Kurang Sehat',
      badgeClass: 'bg-orange-400 text-black border border-black',
      barColor: 'bg-orange-500',
      textColor: 'text-orange-600 dark:text-orange-400',
      recommendation:
        'Kelompok sensitif (anak-anak, lansia, asma) sebaiknya mengurangi aktivitas luar.',
    };
  }
  if (aqi <= 200) {
    return {
      level: 'unhealthy',
      label: 'Tidak Sehat',
      badgeClass: 'bg-red-500 text-white border border-black',
      barColor: 'bg-red-500',
      textColor: 'text-red-600 dark:text-red-400',
      recommendation:
        'Kesehatan mulai terganggu; disarankan memakai masker jika keluar ruangan.',
    };
  }
  if (aqi <= 300) {
    return {
      level: 'very-unhealthy',
      label: 'Sangat Tidak Sehat',
      badgeClass: 'bg-purple-600 text-white border border-black',
      barColor: 'bg-purple-600',
      textColor: 'text-purple-600 dark:text-purple-400',
      recommendation: 'Peringatan kesehatan; hindari aktivitas fisik di luar ruangan.',
    };
  }
  return {
    level: 'hazardous',
    label: 'Berbahaya',
    badgeClass: 'bg-rose-950 text-white border border-black',
    barColor: 'bg-rose-950',
    textColor: 'text-rose-600 dark:text-rose-400',
    recommendation:
      'Seluruh populasi berisiko terdampak serius; tetap berada di dalam ruangan.',
  };
}

interface CacheEntry {
  data: AirQualityData;
  timestamp: number;
}

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache
const aqiCache = new Map<string, CacheEntry>();

export async function fetchProvinceAirQuality(
  locationId: string,
  fallbackProvinceId?: string,
): Promise<AirQualityData | null> {
  const coord = getLocationCoordinates(locationId, fallbackProvinceId);
  if (!coord) return null;

  const cached = aqiCache.get(locationId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${coord.lat}&longitude=${coord.lng}&current=us_aqi,pm10,pm2_5,ozone&timezone=auto`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Open-Meteo Air Quality returned status ${res.status}`);
    }

    const json = await res.json();
    const current = json.current;
    if (!current) throw new Error('Invalid air quality payload');

    const rawAqi =
      current.us_aqi !== undefined && current.us_aqi !== null
        ? Math.round(current.us_aqi)
        : 0;
    const category = evaluateAQI(rawAqi);

    const tzAbbr = getIndonesianTimezoneLabel(
      json.utc_offset_seconds,
      json.timezone,
      json.timezone_abbreviation,
    );

    const aqiData: AirQualityData = {
      aqi: rawAqi,
      category,
      pm2_5: current.pm2_5 !== undefined ? Math.round(current.pm2_5 * 10) / 10 : 0,
      pm10: current.pm10 !== undefined ? Math.round(current.pm10 * 10) / 10 : 0,
      ozone: current.ozone !== undefined ? Math.round(current.ozone) : 0,
      time: current.time || '',
      timezone: json.timezone,
      timezoneAbbreviation: tzAbbr,
      fetchedAt: Date.now(),
      capital: coord.capital,
    };

    aqiCache.set(locationId, {
      data: aqiData,
      timestamp: Date.now(),
    });

    return aqiData;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error(`Error fetching air quality for ${locationId}:`, error);
    throw error;
  }
}

export const fetchLocationAirQuality = fetchProvinceAirQuality;
