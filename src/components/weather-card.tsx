import { motion } from 'framer-motion';
import {
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

import { WeatherData, WeatherIconType } from '../interfaces/weather';
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
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadWeather = useCallback(async () => {
    if (!provinceId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProvinceWeather(provinceId);
      setWeather(data);
    } catch {
      setError('Gagal memuat data cuaca real-time');
    } finally {
      setLoading(false);
    }
  }, [provinceId]);

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

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
            [CUACA TERKINI // {capital || provinceName}]
          </span>
        </div>

        <motion.button
          type='button'
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => loadWeather()}
          disabled={loading}
          title='Muat Ulang Cuaca'
          className='flex size-6 items-center justify-center rounded border border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50'
        >
          <RefreshCw
            className={`size-3 stroke-[2.5] ${loading ? 'animate-spin text-primary' : ''}`}
          />
        </motion.button>
      </div>

      {/* Konten Utama */}
      {loading ? (
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
      ) : error ? (
        <div className='py-3 text-center'>
          <p className='font-mono text-xs text-red-500'>{error}</p>
          <button
            type='button'
            onClick={() => loadWeather()}
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
            {/* Suhu Terasa */}
            <div className='rounded border border-border/80 bg-muted/30 p-2 text-center'>
              <div className='flex items-center justify-center gap-1 text-muted-foreground'>
                <Thermometer className='size-3 text-orange-500' />
                <span className='font-mono text-[9px] font-bold uppercase'>TERASA</span>
              </div>
              <p className='mt-0.5 font-mono text-xs font-bold text-foreground'>
                {weather.apparentTemperature}°C
              </p>
            </div>

            {/* Kelembapan */}
            <div className='rounded border border-border/80 bg-muted/30 p-2 text-center'>
              <div className='flex items-center justify-center gap-1 text-muted-foreground'>
                <Droplets className='size-3 text-blue-500' />
                <span className='font-mono text-[9px] font-bold uppercase'>LEMBAP</span>
              </div>
              <p className='mt-0.5 font-mono text-xs font-bold text-foreground'>
                {weather.humidity}%
              </p>
            </div>

            {/* Angin */}
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
      ) : null}

      {/* Legal & Open Source Attribution Footer */}
      <div className='mt-3 flex items-center justify-between border-t border-border/50 pt-2 text-[10px] text-muted-foreground'>
        <span className='font-mono'>Data Terbuka (Open Data)</span>
        <a
          href='https://open-meteo.com/'
          target='_blank'
          rel='noopener noreferrer'
          className='inline-flex items-center gap-1 font-mono font-medium hover:text-foreground hover:underline'
        >
          <span>Open-Meteo (CC BY 4.0)</span>
          <ExternalLink className='size-2.5' />
        </a>
      </div>
    </div>
  );
}
