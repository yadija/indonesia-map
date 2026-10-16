import { WeatherCoordinates, WeatherData, WeatherIconType } from '../interfaces/weather';

export const PROVINCE_COORDINATES: Record<string, WeatherCoordinates> = {
  IDAC: { lat: 5.5483, lng: 95.3238, capital: 'Banda Aceh' },
  IDBA: { lat: -8.6705, lng: 115.2126, capital: 'Denpasar' },
  IDBT: { lat: -6.1104, lng: 106.164, capital: 'Serang' },
  IDBE: { lat: -3.8004, lng: 102.2655, capital: 'Bengkulu' },
  IDYO: { lat: -7.7956, lng: 110.3695, capital: 'Yogyakarta' },
  IDJK: { lat: -6.2088, lng: 106.8456, capital: 'Jakarta' },
  IDGO: { lat: 0.5435, lng: 123.0568, capital: 'Gorontalo' },
  IDJA: { lat: -1.6101, lng: 103.6131, capital: 'Jambi' },
  IDJB: { lat: -6.9175, lng: 107.6191, capital: 'Bandung' },
  IDJT: { lat: -6.9667, lng: 110.4167, capital: 'Semarang' },
  IDJI: { lat: -7.2575, lng: 112.7521, capital: 'Surabaya' },
  IDKB: { lat: -0.0263, lng: 109.3425, capital: 'Pontianak' },
  IDKS: { lat: -3.4402, lng: 114.8306, capital: 'Banjarbaru' },
  IDKT: { lat: -2.2161, lng: 113.914, capital: 'Palangka Raya' },
  IDKI: { lat: -0.5022, lng: 117.1536, capital: 'Samarinda' },
  IDKU: { lat: 2.8375, lng: 117.3653, capital: 'Tanjung Selor' },
  IDBB: { lat: -2.1316, lng: 106.1169, capital: 'Pangkalpinang' },
  IDKR: { lat: 0.9167, lng: 104.45, capital: 'Tanjungpinang' },
  IDLA: { lat: -5.45, lng: 105.2667, capital: 'Bandar Lampung' },
  IDMA: { lat: -3.6958, lng: 128.1831, capital: 'Ambon' },
  IDMU: { lat: 0.7483, lng: 127.5794, capital: 'Sofifi' },
  IDNB: { lat: -8.5833, lng: 116.1167, capital: 'Mataram' },
  IDNT: { lat: -10.1772, lng: 123.607, capital: 'Kupang' },
  IDPA: { lat: -2.5337, lng: 140.7181, capital: 'Jayapura' },
  IDPB: { lat: -0.8615, lng: 134.062, capital: 'Manokwari' },
  IDPD: { lat: -0.8762, lng: 131.2558, capital: 'Sorong' },
  IDPE: { lat: -4.0981, lng: 138.9442, capital: 'Wamena' },
  IDPS: { lat: -8.4991, lng: 140.4011, capital: 'Merauke' },
  IDPT: { lat: -3.3667, lng: 135.4833, capital: 'Nabire' },
  IDRI: { lat: 0.5071, lng: 101.4478, capital: 'Pekanbaru' },
  IDSR: { lat: -2.6788, lng: 118.8825, capital: 'Mamuju' },
  IDSN: { lat: -5.1477, lng: 119.4327, capital: 'Makassar' },
  IDST: { lat: -0.9003, lng: 119.878, capital: 'Palu' },
  IDSG: { lat: -3.9985, lng: 122.5126, capital: 'Kendari' },
  IDSA: { lat: 1.4748, lng: 124.8421, capital: 'Manado' },
  IDSB: { lat: -0.9471, lng: 100.4172, capital: 'Padang' },
  IDSS: { lat: -2.9909, lng: 104.7566, capital: 'Palembang' },
  IDSU: { lat: 3.5952, lng: 98.6722, capital: 'Medan' },
};

export function interpretWeatherCode(code: number): {
  label: string;
  iconName: WeatherIconType;
} {
  switch (code) {
    case 0:
      return { label: 'Cerah', iconName: 'Sun' };
    case 1:
      return { label: 'Sebagian Cerah', iconName: 'CloudSun' };
    case 2:
      return { label: 'Cerah Berawan', iconName: 'CloudSun' };
    case 3:
      return { label: 'Berawan Tebal', iconName: 'Cloud' };
    case 45:
    case 48:
      return { label: 'Berkabut', iconName: 'CloudFog' };
    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
      return { label: 'Gerimis', iconName: 'CloudDrizzle' };
    case 61:
      return { label: 'Hujan Ringan', iconName: 'CloudRain' };
    case 63:
      return { label: 'Hujan Sedang', iconName: 'CloudRain' };
    case 65:
    case 66:
    case 67:
      return { label: 'Hujan Lebat', iconName: 'CloudRain' };
    case 71:
    case 73:
    case 75:
    case 77:
      return { label: 'Hujan Es / Salju', iconName: 'CloudRain' };
    case 80:
      return { label: 'Hujan Rintik Lokal', iconName: 'CloudDrizzle' };
    case 81:
    case 82:
      return { label: 'Hujan Deras Lokal', iconName: 'CloudRain' };
    case 85:
    case 86:
      return { label: 'Hujan Salju / Es', iconName: 'CloudRain' };
    case 95:
      return { label: 'Hujan Badai Petir', iconName: 'CloudLightning' };
    case 96:
    case 99:
      return { label: 'Badai Petir & Es', iconName: 'CloudLightning' };
    default:
      return { label: 'Berawan', iconName: 'Cloud' };
  }
}

interface CacheEntry {
  data: WeatherData;
  timestamp: number;
}

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache
const weatherCache = new Map<string, CacheEntry>();

export async function fetchProvinceWeather(
  provinceId: string,
): Promise<WeatherData | null> {
  const coord = PROVINCE_COORDINATES[provinceId];
  if (!coord) return null;

  const cached = weatherCache.get(provinceId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coord.lat}&longitude=${coord.lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Open-Meteo returned status ${res.status}`);
    }

    const json = await res.json();
    const current = json.current;
    if (!current) throw new Error('Invalid weather payload');

    const interpretation = interpretWeatherCode(current.weather_code);

    const weatherData: WeatherData = {
      temperature: Math.round(current.temperature_2m),
      apparentTemperature: Math.round(current.apparent_temperature),
      humidity: Math.round(current.relative_humidity_2m),
      windSpeed: Math.round(current.wind_speed_10m),
      weatherCode: current.weather_code,
      label: interpretation.label,
      iconName: interpretation.iconName,
      time: current.time,
      capital: coord.capital,
    };

    weatherCache.set(provinceId, {
      data: weatherData,
      timestamp: Date.now(),
    });

    return weatherData;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error(`Error fetching weather for ${provinceId}:`, error);
    throw error;
  }
}
