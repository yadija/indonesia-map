import { motion } from 'framer-motion';
import {
  Activity,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Droplets,
  ExternalLink,
  RefreshCw,
  Sun,
  Thermometer,
  Wind,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { AirQualityData } from '../interfaces/air-quality';
import { WeatherData, WeatherIconType } from '../interfaces/weather';
import { fetchProvinceAirQuality } from '../utils/air-quality';
import { fetchProvinceWeather } from '../utils/weather';

interface WeatherCardProps {
  provinceId: string;
  provinceName: string;
  capital?: string;
}

export default function WeatherCard({
  provinceId,
  provinceName,
  capital,
}: WeatherCardProps) {
  const [activeTab, setActiveTab] = useState<'weather' | 'airQuality'>('weather');

  // Weather States
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState<boolean>(true);
  const [errorWeather, setErrorWeather] = useState<string | null>(null);

  // Air Quality States
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [loadingAQI, setLoadingAQI] = useState<boolean>(true);
  const [errorAQI, setErrorAQI] = useState<string | null>(null);

  const loadWeather = useCallback(async () => {
    if (!provinceId) return;
    setLoadingWeather(true);
    setErrorWeather(null);
    try {
      const data = await fetchProvinceWeather(provinceId);
      setWeather(data);
    } catch {
      setErrorWeather('Gagal memuat data cuaca real-time');
    } finally {
      setLoadingWeather(false);
    }
  }, [provinceId]);

  const loadAirQuality = useCallback(async () => {
    if (!provinceId) return;
    setLoadingAQI(true);
    setErrorAQI(null);
    try {
      const data = await fetchProvinceAirQuality(provinceId);
      setAirQuality(data);
    } catch {
      setErrorAQI('Gagal memuat data kualitas udara');
    } finally {
      setLoadingAQI(false);
    }
  }, [provinceId]);

  const refreshAll = useCallback(() => {
    loadWeather();
    loadAirQuality();
  }, [loadWeather, loadAirQuality]);

  useEffect(() => {
    loadWeather();
    loadAirQuality();
  }, [loadWeather, loadAirQuality]);

  const renderWeatherIcon = (iconType?: WeatherIconType) => {
    const iconClass = 'size-8 sm:size-9 stroke-[2.2]';
    switch (iconType) {
      case 'Sun':
        return <Sun className={`${iconClass} animate-pulse text-amber-500`} />;
      case 'CloudSun':
        return <CloudSun className={`${iconClass} text-amber-400`} />;
      case 'Cloud':
        return <Cloud className={`${iconClass} text-sky-400`} />;
      case 'CloudFog':
        return <CloudFog className={`${iconClass} text-slate-400`} />;
      case 'CloudDrizzle':
        return <CloudDrizzle className={`${iconClass} text-cyan-500`} />;
      case 'CloudRain':
        return <CloudRain className={`${iconClass} text-blue-500`} />;
      case 'CloudLightning':
        return <CloudLightning className={`${iconClass} text-purple-500`} />;
      default:
        return <CloudSun className={`${iconClass} text-amber-400`} />;
    }
  };

  const isLoading = activeTab === 'weather' ? loadingWeather : loadingAQI;

  return (
    <div className='rounded-lg border-2 border-black bg-card p-3.5 shadow-brutal-sm dark:border-white dark:bg-zinc-900 sm:p-4'>
      {/* Header Widget */}
      <div className='flex items-center justify-between border-b border-border/60 pb-2.5'>
        <div className='flex items-center space-x-2'>
          <span className='relative flex size-2'>
            <span className='absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75' />
            <span className='relative inline-flex size-2 rounded-full bg-emerald-500' />
          </span>
          <span className='font-mono text-[10px] font-black uppercase tracking-wider text-muted-foreground'>
            [LINGKUNGAN & IKLIM // {capital || provinceName}]
          </span>
        </div>

        <motion.button
          type='button'
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={refreshAll}
          disabled={isLoading}
          title='Muat Ulang Data Lingkungan'
          className='flex size-6 items-center justify-center rounded border border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50'
        >
          <RefreshCw
            className={`size-3 stroke-[2.5] ${isLoading ? 'animate-spin text-primary' : ''}`}
          />
        </motion.button>
      </div>

      {/* Tab Switcher: Cuaca vs Kualitas Udara */}
      <div className='mt-2.5 flex items-center gap-1.5 rounded-lg border border-black/20 bg-muted/60 p-1 dark:border-white/20'>
        <button
          type='button'
          onClick={() => setActiveTab('weather')}
          className={`flex-1 rounded px-2 py-1 font-mono text-[10px] font-black uppercase transition-all ${
            activeTab === 'weather'
              ? 'border border-black bg-amber-300 text-black shadow-[1px_1px_0px_#000]'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          🌤️ Cuaca {weather ? `(${weather.temperature}°C)` : ''}
        </button>
        <button
          type='button'
          onClick={() => setActiveTab('airQuality')}
          className={`flex-1 rounded px-2 py-1 font-mono text-[10px] font-black uppercase transition-all ${
            activeTab === 'airQuality'
              ? 'border border-black bg-emerald-400 text-black shadow-[1px_1px_0px_#000]'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          🍃 Kualitas Udara {airQuality ? `(AQI ${airQuality.aqi})` : ''}
        </button>
      </div>

      {/* Konten Utama Berdasarkan Tab Aktif */}
      {activeTab === 'weather' ? (
        /* Tab Cuaca */
        loadingWeather ? (
          <div className='space-y-3 py-3'>
            <div className='flex animate-pulse items-center justify-between'>
              <div className='space-y-1.5'>
                <div className='h-8 w-24 rounded bg-muted' />
                <div className='h-3.5 w-32 rounded bg-muted' />
              </div>
              <div className='size-9 rounded-full bg-muted' />
            </div>
            <div className='grid grid-cols-3 gap-2 pt-1'>
              <div className='h-12 animate-pulse rounded bg-muted' />
              <div className='h-12 animate-pulse rounded bg-muted' />
              <div className='h-12 animate-pulse rounded bg-muted' />
            </div>
          </div>
        ) : errorWeather ? (
          <div className='py-3 text-center'>
            <p className='font-mono text-xs text-red-500'>{errorWeather}</p>
            <button
              type='button'
              onClick={loadWeather}
              className='mt-2 inline-flex items-center gap-1.5 rounded border border-black bg-muted px-2.5 py-1 font-mono text-[10px] font-bold uppercase hover:bg-muted/80 dark:border-white'
            >
              <RefreshCw className='size-2.5' /> Coba Lagi
            </button>
          </div>
        ) : weather ? (
          <div className='space-y-3 pt-2.5'>
            {/* Suhu & Kondisi */}
            <div className='flex items-center justify-between'>
              <div>
                <div className='flex items-baseline gap-1'>
                  <span className='font-mono text-3xl font-black text-foreground sm:text-4xl'>
                    {weather.temperature}
                  </span>
                  <span className='font-mono text-base font-bold text-muted-foreground'>
                    °C
                  </span>
                </div>
                <p className='font-mono text-xs font-bold text-primary sm:text-sm'>
                  {weather.label}
                </p>
              </div>
              <div className='flex flex-col items-center justify-center rounded-xl border border-border/80 bg-muted/40 p-2'>
                {renderWeatherIcon(weather.iconName)}
              </div>
            </div>

            {/* Rincian Parameter */}
            <div className='grid grid-cols-3 gap-1.5 sm:gap-2'>
              <div className='rounded border border-border/80 bg-muted/30 p-2 text-center'>
                <div className='flex items-center justify-center gap-1 text-muted-foreground'>
                  <Thermometer className='size-3 text-orange-500' />
                  <span className='font-mono text-[9px] font-bold uppercase'>TERASA</span>
                </div>
                <p className='mt-0.5 font-mono text-xs font-bold text-foreground'>
                  {weather.apparentTemperature}°C
                </p>
              </div>

              <div className='rounded border border-border/80 bg-muted/30 p-2 text-center'>
                <div className='flex items-center justify-center gap-1 text-muted-foreground'>
                  <Droplets className='size-3 text-blue-500' />
                  <span className='font-mono text-[9px] font-bold uppercase'>LEMBAP</span>
                </div>
                <p className='mt-0.5 font-mono text-xs font-bold text-foreground'>
                  {weather.humidity}%
                </p>
              </div>

              <div className='rounded border border-border/80 bg-muted/30 p-2 text-center'>
                <div className='flex items-center justify-center gap-1 text-muted-foreground'>
                  <Wind className='size-3 text-teal-500' />
                  <span className='font-mono text-[9px] font-bold uppercase'>ANGIN</span>
                </div>
                <p className='mt-0.5 font-mono text-xs font-bold text-foreground'>
                  {weather.windSpeed} <span className='text-[9px] font-normal'>km/h</span>
                </p>
              </div>
            </div>
          </div>
        ) : null
      ) : /* Tab Kualitas Udara */
      loadingAQI ? (
        <div className='space-y-3 py-3'>
          <div className='flex animate-pulse items-center justify-between'>
            <div className='space-y-1.5'>
              <div className='h-8 w-20 rounded bg-muted' />
              <div className='h-3.5 w-28 rounded bg-muted' />
            </div>
            <div className='h-6 w-24 rounded bg-muted' />
          </div>
          <div className='h-2.5 w-full animate-pulse rounded bg-muted' />
          <div className='grid grid-cols-3 gap-2 pt-1'>
            <div className='h-12 animate-pulse rounded bg-muted' />
            <div className='h-12 animate-pulse rounded bg-muted' />
            <div className='h-12 animate-pulse rounded bg-muted' />
          </div>
        </div>
      ) : errorAQI ? (
        <div className='py-3 text-center'>
          <p className='font-mono text-xs text-red-500'>{errorAQI}</p>
          <button
            type='button'
            onClick={loadAirQuality}
            className='mt-2 inline-flex items-center gap-1.5 rounded border border-black bg-muted px-2.5 py-1 font-mono text-[10px] font-bold uppercase hover:bg-muted/80 dark:border-white'
          >
            <RefreshCw className='size-2.5' /> Coba Lagi
          </button>
        </div>
      ) : airQuality ? (
        <div className='space-y-3 pt-2.5'>
          {/* Skor AQI & Kategori Status */}
          <div className='flex items-center justify-between'>
            <div>
              <div className='flex items-baseline gap-1.5'>
                <span className='font-mono text-3xl font-black text-foreground sm:text-4xl'>
                  {airQuality.aqi}
                </span>
                <span className='font-mono text-xs font-bold uppercase text-muted-foreground'>
                  US AQI
                </span>
              </div>
              <p className='font-mono text-xs font-bold text-muted-foreground'>
                Indeks Kualitas Udara
              </p>
            </div>

            <div
              className={`rounded border-2 px-2.5 py-1 font-mono text-xs font-black uppercase shadow-brutal-sm ${airQuality.category.badgeClass}`}
            >
              {airQuality.category.label}
            </div>
          </div>

          {/* Visual Gauge Bar */}
          <div>
            <div className='relative h-2.5 w-full overflow-hidden rounded-full border border-black bg-muted shadow-[1px_1px_0px_#000] dark:border-white'>
              <div className='size-full bg-gradient-to-r from-emerald-400 via-amber-300 via-orange-400 via-red-500 to-purple-600' />
              {/* Pointer / Marker */}
              <div
                style={{
                  left: `${Math.min(96, Math.max(4, (airQuality.aqi / 300) * 100))}%`,
                }}
                className='absolute top-0 h-full w-1.5 -translate-x-1/2 bg-black ring-1 ring-white dark:bg-white'
              />
            </div>
            <div className='mt-1 flex justify-between font-mono text-[9px] text-muted-foreground'>
              <span>0 (Baik)</span>
              <span>100 (Sedang)</span>
              <span>200 (Tidak Sehat)</span>
              <span>300+</span>
            </div>
          </div>

          {/* Parameter Partikulat */}
          <div className='grid grid-cols-3 gap-1.5 sm:gap-2'>
            <div className='rounded border border-border/80 bg-muted/30 p-2 text-center'>
              <div className='flex items-center justify-center gap-1 text-muted-foreground'>
                <Activity className='size-3 text-red-500' />
                <span className='font-mono text-[9px] font-bold uppercase'>PM2.5</span>
              </div>
              <p className='mt-0.5 font-mono text-xs font-bold text-foreground'>
                {airQuality.pm2_5}{' '}
                <span className='text-[8px] font-normal text-muted-foreground'>
                  µg/m³
                </span>
              </p>
            </div>

            <div className='rounded border border-border/80 bg-muted/30 p-2 text-center'>
              <div className='flex items-center justify-center gap-1 text-muted-foreground'>
                <Activity className='size-3 text-amber-500' />
                <span className='font-mono text-[9px] font-bold uppercase'>PM10</span>
              </div>
              <p className='mt-0.5 font-mono text-xs font-bold text-foreground'>
                {airQuality.pm10}{' '}
                <span className='text-[8px] font-normal text-muted-foreground'>
                  µg/m³
                </span>
              </p>
            </div>

            <div className='rounded border border-border/80 bg-muted/30 p-2 text-center'>
              <div className='flex items-center justify-center gap-1 text-muted-foreground'>
                <Wind className='size-3 text-sky-500' />
                <span className='font-mono text-[9px] font-bold uppercase'>
                  OZON (O₃)
                </span>
              </div>
              <p className='mt-0.5 font-mono text-xs font-bold text-foreground'>
                {airQuality.ozone}{' '}
                <span className='text-[8px] font-normal text-muted-foreground'>
                  µg/m³
                </span>
              </p>
            </div>
          </div>

          {/* Rekomendasi Kesehatan */}
          <div className='rounded border border-border/70 bg-muted/40 p-2'>
            <p className='font-mono text-[10px] leading-relaxed text-muted-foreground'>
              💡 <strong>Rekomendasi:</strong> {airQuality.category.recommendation}
            </p>
          </div>
        </div>
      ) : null}

      {/* Legal & Open Source Attribution Footer */}
      <div className='mt-3 flex items-center justify-between border-t border-border/50 pt-2 text-[10px] text-muted-foreground'>
        <span className='font-mono'>Data Terbuka (Open Data)</span>
        <a
          href={
            activeTab === 'weather'
              ? 'https://open-meteo.com/'
              : 'https://open-meteo.com/en/docs/air-quality-api'
          }
          target='_blank'
          rel='noopener noreferrer'
          className='inline-flex items-center gap-1 font-mono font-medium hover:text-foreground hover:underline'
        >
          <span>
            {activeTab === 'weather'
              ? 'Open-Meteo Weather (CC BY 4.0)'
              : 'Open-Meteo Air Quality (CC BY 4.0)'}
          </span>
          <ExternalLink className='size-2.5' />
        </a>
      </div>
    </div>
  );
}
