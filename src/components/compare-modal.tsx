import { motion } from 'framer-motion';
import {
  ArrowLeftRight,
  ChevronsUpDown,
  Clock,
  CloudSun,
  ExternalLink,
  MapPin,
  Maximize2,
  Plus,
  Scale,
  ShieldCheck,
  TrendingUp,
  Users,
  Wind,
  X,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

import { AirQualityData } from '../interfaces/air-quality';
import { Province } from '../interfaces/province';
import { WeatherData } from '../interfaces/weather';
import { fetchProvinceAirQuality } from '../utils/air-quality';
import { fetchProvinceWeather } from '../utils/weather';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface CompareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comparedProvinces: Province[];
  allProvinces: Province[];
  onAddProvince: (id: string) => void;
  onRemoveProvince: (id: string) => void;
  onReplaceProvince: (oldId: string, newId: string) => void;
}

const COLUMN_COLORS = [
  {
    badge: 'bg-blue-600 text-white',
    border: 'border-black dark:border-white',
    bar: 'bg-blue-600',
    tag: 'bg-blue-100 text-blue-900 border border-black',
  },
  {
    badge: 'bg-amber-400 text-black',
    border: 'border-black dark:border-white',
    bar: 'bg-amber-400',
    tag: 'bg-amber-100 text-amber-900 border border-black',
  },
  {
    badge: 'bg-emerald-500 text-black',
    border: 'border-black dark:border-white',
    bar: 'bg-emerald-500',
    tag: 'bg-emerald-100 text-emerald-900 border border-black',
  },
];

function CompareWeatherBadge({ provinceId }: { provinceId: string }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchProvinceWeather(provinceId)
      .then((data) => {
        if (isMounted) {
          setWeather(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [provinceId]);

  if (loading) {
    return (
      <span className='animate-pulse font-mono text-[10px] text-muted-foreground'>
        Memuat...
      </span>
    );
  }

  if (!weather) {
    return <span className='font-mono text-[10px] text-muted-foreground'>-</span>;
  }

  return (
    <span className='inline-flex items-center gap-1 font-mono text-xs font-bold text-foreground'>
      <span className='text-amber-500'>{weather.temperature}°C</span>
      <span className='text-[10px] font-normal text-muted-foreground'>
        ({weather.label})
      </span>
    </span>
  );
}

function CompareAirQualityBadge({ provinceId }: { provinceId: string }) {
  const [aqi, setAqi] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchProvinceAirQuality(provinceId)
      .then((data) => {
        if (isMounted) {
          setAqi(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [provinceId]);

  if (loading) {
    return (
      <span className='animate-pulse font-mono text-[10px] text-muted-foreground'>
        Memuat...
      </span>
    );
  }

  if (!aqi) {
    return <span className='font-mono text-[10px] text-muted-foreground'>-</span>;
  }

  return (
    <span className='inline-flex items-center gap-1 font-mono text-xs font-bold'>
      <span className='text-foreground'>{aqi.aqi} AQI</span>
      <span
        className={`rounded px-1.5 py-0.5 text-[9px] font-black uppercase ${aqi.category.badgeClass}`}
      >
        {aqi.category.label}
      </span>
    </span>
  );
}

export default function CompareModal({
  open,
  onOpenChange,
  comparedProvinces,
  allProvinces,
  onAddProvince,
  onRemoveProvince,
  onReplaceProvince,
}: CompareModalProps) {
  const [selectedToAdd, setSelectedToAdd] = useState('');

  const formatNumber = (num?: number) => {
    if (!num) return '-';
    return new Intl.NumberFormat('id-ID').format(num);
  };

  // Find maximum values for comparative visual bars
  const stats = useMemo(() => {
    const list = comparedProvinces.map((p) => {
      const density =
        p.population && p.areaKm2 ? Math.round(p.population / p.areaKm2) : 0;
      return {
        ...p,
        density,
      };
    });

    const maxPop = Math.max(...list.map((p) => p.population || 1), 1);
    const maxArea = Math.max(...list.map((p) => p.areaKm2 || 1), 1);
    const maxDensity = Math.max(...list.map((p) => p.density || 1), 1);

    return { list, maxPop, maxArea, maxDensity };
  }, [comparedProvinces]);

  // Unselected provinces for dropdown
  const availableProvinces = useMemo(() => {
    const selectedIds = new Set(comparedProvinces.map((p) => p.id));
    return allProvinces
      .filter((p) => !selectedIds.has(p.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allProvinces, comparedProvinces]);

  // Group available unselected provinces by island for organized browsing
  const groupedProvinces = useMemo(() => {
    const groups: Record<string, Province[]> = {};
    availableProvinces.forEach((p) => {
      const island = p.island || 'Lainnya';
      if (!groups[island]) groups[island] = [];
      groups[island].push(p);
    });
    return groups;
  }, [availableProvinces]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedToAdd) return;
    onAddProvince(selectedToAdd);
    setSelectedToAdd('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90dvh] w-[96vw] max-w-5xl overflow-y-auto rounded-xl border-2 border-black p-3.5 shadow-brutal-xl dark:border-white dark:bg-zinc-950 dark:shadow-brutal-white-lg sm:p-6'>
        <DialogHeader className='text-left'>
          <div className='flex items-center gap-2.5'>
            <div className='flex size-8 shrink-0 items-center justify-center rounded-lg border-2 border-black bg-red-600 text-white shadow-brutal-sm dark:border-white sm:size-9'>
              <Scale className='size-4 stroke-[2.5] sm:size-5' />
            </div>
            <div>
              <DialogTitle className='font-mono text-lg font-black uppercase tracking-tight text-foreground sm:text-2xl'>
                KOMPARASI ANTAR-PROVINSI
              </DialogTitle>
              <DialogDescription className='font-mono text-[11px] text-muted-foreground sm:text-xs'>
                [ANALISIS KOMPARATIF STATISTIK KEPENDUDUKAN & GEOSPASIAL]
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Add 3rd Province Selector (if less than 3 provinces) */}
        {comparedProvinces.length < 3 && availableProvinces.length > 0 && (
          <form
            onSubmit={handleAdd}
            className='flex flex-wrap items-center gap-2 rounded-lg border-2 border-dashed border-black bg-muted/40 p-2 dark:border-white dark:bg-zinc-900 sm:gap-2.5 sm:p-3'
          >
            <span className='font-mono text-xs font-bold uppercase text-foreground'>
              + TAMBAH PROVINSI KE-3:
            </span>
            <div className='relative w-full flex-1 sm:w-auto sm:min-w-[200px] sm:max-w-xs'>
              <select
                value={selectedToAdd}
                onChange={(e) => setSelectedToAdd(e.target.value)}
                className='h-8 w-full cursor-pointer appearance-none rounded border-2 border-black bg-background py-1 pl-3 pr-8 font-mono text-xs font-bold text-foreground shadow-[2px_2px_0px_#000] transition focus:border-red-600 focus:outline-none dark:border-white'
              >
                <option value=''>-- Pilih Provinsi Lain --</option>
                {Object.entries(groupedProvinces).map(([island, list]) => (
                  <optgroup key={island} label={`── ${island} ──`}>
                    {list.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-foreground'>
                <ChevronsUpDown className='size-3.5 stroke-[2.5]' />
              </div>
            </div>
            <motion.button
              type='submit'
              disabled={!selectedToAdd}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='flex h-8 items-center gap-1 rounded border-2 border-black bg-red-600 px-3 font-mono text-xs font-black uppercase text-white shadow-brutal-sm transition hover:bg-red-500 disabled:opacity-50 dark:border-white'
            >
              <Plus className='size-3.5 stroke-[2.5]' />
              <span>TAMBAH</span>
            </motion.button>
          </form>
        )}

        {/* Comparative Columns Grid */}
        <div
          className={`mt-2 grid gap-4 ${
            stats.list.length === 3
              ? 'grid-cols-1 md:grid-cols-3'
              : 'grid-cols-1 md:grid-cols-2'
          }`}
        >
          {stats.list.map((prov, index) => {
            const colors = COLUMN_COLORS[index % COLUMN_COLORS.length];
            const isHighestPop =
              stats.list.length > 1 && prov.population === stats.maxPop;
            const isHighestArea = stats.list.length > 1 && prov.areaKm2 === stats.maxArea;
            const isHighestDensity =
              stats.list.length > 1 && prov.density === stats.maxDensity;

            return (
              <motion.div
                key={prov.id}
                whileHover={{ y: -2 }}
                className={`relative flex flex-col justify-between rounded-xl border-2 ${colors.border} bg-card p-4 shadow-brutal transition-all dark:bg-zinc-900`}
              >
                <div>
                  {/* Column Header */}
                  <div className='border-b-2 border-black pb-3 dark:border-white'>
                    {/* Top Row: Slot Badge, Full Province Title, Island Badge & Remove Button */}
                    <div className='flex items-start justify-between gap-2'>
                      <div className='flex min-w-0 flex-1 items-start gap-2'>
                        <span
                          className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded border border-black font-mono text-xs font-black shadow-[1px_1px_0px_#000] ${colors.badge}`}
                        >
                          {index + 1}
                        </span>
                        <div className='min-w-0 flex-1'>
                          <h3 className='break-words font-mono text-base font-black leading-snug text-foreground'>
                            {prov.name}
                          </h3>
                          {prov.island && (
                            <span className='mt-1 inline-block rounded border border-black bg-amber-300 px-2 py-0.5 font-mono text-[10px] font-bold text-black shadow-[1px_1px_0px_#000]'>
                              {prov.island}
                            </span>
                          )}
                        </div>
                      </div>

                      {stats.list.length > 2 && (
                        <motion.button
                          type='button'
                          whileHover={{ scale: 1.15, rotate: 90 }}
                          whileTap={{ scale: 0.85 }}
                          onClick={() => onRemoveProvince(prov.id)}
                          className='flex size-6 shrink-0 items-center justify-center rounded border border-black bg-background text-foreground shadow-[1px_1px_0px_#000] transition hover:bg-red-600 hover:text-white dark:border-white'
                          aria-label={`Hapus ${prov.name}`}
                          title={`Hapus ${prov.name}`}
                        >
                          <X className='size-3 stroke-[2.5]' />
                        </motion.button>
                      )}
                    </div>

                    {/* Sub Row: Switch Province Control */}
                    <div className='mt-3'>
                      <div className='group relative flex items-center'>
                        <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-foreground'>
                          <ArrowLeftRight className='size-3.5 stroke-[2.5] text-red-600' />
                        </div>
                        <select
                          aria-label={`Ganti provinsi ${prov.name}`}
                          value={prov.id}
                          onChange={(e) => onReplaceProvince(prov.id, e.target.value)}
                          className='h-8 w-full cursor-pointer appearance-none rounded border-2 border-black bg-background px-8 py-1 font-mono text-xs font-bold text-foreground shadow-brutal-sm transition-all focus:border-red-600 focus:outline-none dark:border-white dark:bg-zinc-950'
                        >
                          <option value={prov.id} disabled>
                            Ganti provinsi...
                          </option>
                          {Object.entries(groupedProvinces).map(([island, list]) => (
                            <optgroup key={island} label={`── ${island} ──`}>
                              {list.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-foreground'>
                          <ChevronsUpDown className='size-3.5 stroke-[2.5]' />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quantitative Metrics with Relative Progress Bars */}
                  <div className='mt-4 space-y-4 font-mono text-xs'>
                    {/* Populasi */}
                    <div>
                      <div className='flex items-center justify-between'>
                        <span className='flex items-center gap-1.5 font-bold uppercase text-muted-foreground'>
                          <Users className='size-3.5 stroke-[2.5] text-blue-600' />
                          POPULASI:
                        </span>
                        <div className='flex items-center gap-1'>
                          <strong className='font-black text-foreground'>
                            {formatNumber(prov.population)}
                          </strong>
                          {isHighestPop && (
                            <span className='rounded border border-black bg-blue-300 px-1 py-0.5 text-[9px] font-black text-black shadow-[1px_1px_0px_#000]'>
                              MAX
                            </span>
                          )}
                        </div>
                      </div>
                      <div className='mt-1.5 h-2.5 w-full overflow-hidden border-2 border-black bg-muted shadow-[1px_1px_0px_#000] dark:border-white'>
                        <div
                          style={{
                            width: `${((prov.population || 0) / stats.maxPop) * 100}%`,
                          }}
                          className={`h-full ${colors.bar} transition-all duration-300`}
                        />
                      </div>
                    </div>

                    {/* Luas Wilayah */}
                    <div>
                      <div className='flex items-center justify-between'>
                        <span className='flex items-center gap-1.5 font-bold uppercase text-muted-foreground'>
                          <Maximize2 className='size-3.5 stroke-[2.5] text-emerald-600' />
                          LUAS:
                        </span>
                        <div className='flex items-center gap-1'>
                          <strong className='font-black text-foreground'>
                            {formatNumber(prov.areaKm2)} km²
                          </strong>
                          {isHighestArea && (
                            <span className='rounded border border-black bg-emerald-300 px-1 py-0.5 text-[9px] font-black text-black shadow-[1px_1px_0px_#000]'>
                              MAX
                            </span>
                          )}
                        </div>
                      </div>
                      <div className='mt-1.5 h-2.5 w-full overflow-hidden border-2 border-black bg-muted shadow-[1px_1px_0px_#000] dark:border-white'>
                        <div
                          style={{
                            width: `${((prov.areaKm2 || 0) / stats.maxArea) * 100}%`,
                          }}
                          className={`h-full ${colors.bar} transition-all duration-300`}
                        />
                      </div>
                    </div>

                    {/* Kepadatan Penduduk */}
                    <div>
                      <div className='flex items-center justify-between'>
                        <span className='flex items-center gap-1.5 font-bold uppercase text-muted-foreground'>
                          <TrendingUp className='size-3.5 stroke-[2.5] text-amber-500' />
                          KEPADATAN:
                        </span>
                        <div className='flex items-center gap-1'>
                          <strong className='font-black text-foreground'>
                            {formatNumber(prov.density)} jiwa/km²
                          </strong>
                          {isHighestDensity && (
                            <span className='rounded border border-black bg-amber-300 px-1 py-0.5 text-[9px] font-black text-black shadow-[1px_1px_0px_#000]'>
                              MAX
                            </span>
                          )}
                        </div>
                      </div>
                      <div className='mt-1.5 h-2.5 w-full overflow-hidden border-2 border-black bg-muted shadow-[1px_1px_0px_#000] dark:border-white'>
                        <div
                          style={{
                            width: `${(prov.density / stats.maxDensity) * 100}%`,
                          }}
                          className={`h-full ${colors.bar} transition-all duration-300`}
                        />
                      </div>
                    </div>

                    {/* Quick Facts */}
                    <div className='space-y-1.5 border-t-2 border-black pt-3 dark:border-white'>
                      <div className='flex items-center justify-between'>
                        <span className='flex items-center gap-1.5 text-muted-foreground'>
                          <MapPin className='size-3.5 stroke-[2.5] text-red-600' />
                          IBU KOTA:
                        </span>
                        <span className='font-bold text-foreground'>
                          {prov.capital || '-'}
                        </span>
                      </div>

                      <div className='flex items-center justify-between'>
                        <span className='flex items-center gap-1.5 text-muted-foreground'>
                          <Clock className='size-3.5 stroke-[2.5] text-amber-500' />
                          ZONA WAKTU:
                        </span>
                        <span className='font-bold text-foreground'>
                          {prov.timezone || '-'}
                        </span>
                      </div>

                      <div className='flex items-center justify-between'>
                        <span className='flex items-center gap-1.5 text-muted-foreground'>
                          <CloudSun className='size-3.5 stroke-[2.5] text-amber-500' />
                          CUACA SAAT INI:
                        </span>
                        <CompareWeatherBadge provinceId={prov.id} />
                      </div>

                      <div className='flex items-center justify-between'>
                        <span className='flex items-center gap-1.5 text-muted-foreground'>
                          <Wind className='size-3.5 stroke-[2.5] text-emerald-500' />
                          UDARA (AQI):
                        </span>
                        <CompareAirQualityBadge provinceId={prov.id} />
                      </div>
                    </div>

                    {/* Deskripsi */}
                    {prov.description && (
                      <div className='border-t border-dashed border-black/30 pt-3 dark:border-white/30'>
                        <p className='line-clamp-3 text-[11px] leading-relaxed text-muted-foreground'>
                          {prov.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Wikipedia Link */}
                {prov.wikipediaUrl && (
                  <div className='mt-4 border-t-2 border-black pt-3 dark:border-white'>
                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      href={prov.wikipediaUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex w-full items-center justify-center gap-1.5 rounded border-2 border-black bg-background py-1.5 font-mono text-[11px] font-bold text-foreground shadow-brutal-sm transition hover:bg-muted dark:border-white'
                    >
                      <span>PROFIL WIKIPEDIA</span>
                      <ExternalLink className='size-3 stroke-[2.5]' />
                    </motion.a>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Footer & Source Citation */}
        <div className='mt-4 flex flex-wrap items-center justify-between gap-2 border-t-2 border-black pt-3 font-mono text-[11px] text-muted-foreground dark:border-white'>
          <div className='flex items-center gap-1.5'>
            <ShieldCheck className='size-3.5 stroke-[2.5] text-emerald-600' />
            <span>[RUJUKAN: BPS RI (2023), KEMENDAGRI RI & OPEN-METEO (CC BY 4.0)]</span>
          </div>

          <motion.button
            type='button'
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onOpenChange(false)}
            className='rounded border-2 border-black bg-black px-4 py-1.5 font-mono text-xs font-black uppercase text-white shadow-brutal-sm transition hover:bg-zinc-800 dark:border-white dark:bg-white dark:text-black'
          >
            TUTUP
          </motion.button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
