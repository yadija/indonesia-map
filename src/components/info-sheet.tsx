import { motion } from 'framer-motion';
import {
  Check,
  Clock,
  ExternalLink,
  Layers,
  MapPin,
  Maximize2,
  Plus,
  ShieldCheck,
  Users,
} from 'lucide-react';

import { hasRegenciesData } from '../data/regencies';
import { Province } from '../interfaces/province';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';
import WeatherCard from './weather-card';

interface InfoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  province: Province | null;
  isAlreadyCompared?: boolean;
  onAddToCompare?: (province: Province) => void;
  onDrillDown?: (province: Province) => void;
}

export default function InfoSheet({
  open,
  onOpenChange,
  province,
  isAlreadyCompared,
  onAddToCompare,
  onDrillDown,
}: InfoSheetProps) {
  const formatNumber = (val?: number) => {
    if (!val) return '-';
    return new Intl.NumberFormat('id-ID').format(val);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='w-full overflow-y-auto border-l-2 border-black bg-background p-4 shadow-brutal-xl dark:border-white sm:max-w-md sm:p-6'>
        <SheetHeader className='space-y-1.5 text-left sm:space-y-2'>
          {province?.island && (
            <div className='inline-flex w-fit items-center rounded-lg border-2 border-black bg-amber-300 px-2.5 py-0.5 font-mono text-[11px] font-black uppercase text-black shadow-brutal-sm dark:border-white sm:px-3 sm:py-1 sm:text-xs'>
              WILAYAH {province.island}
            </div>
          )}
          <SheetTitle className='font-mono text-xl font-black uppercase tracking-tight text-foreground sm:text-2xl'>
            {province ? province.name : 'Informasi Wilayah'}
          </SheetTitle>
          <SheetDescription className='font-mono text-[11px] text-muted-foreground sm:text-xs'>
            {province
              ? `[STATISTIK RESMI // PROVINSI ${province.name.toUpperCase()}]`
              : 'Silakan klik salah satu provinsi pada peta untuk melihat detail informasi.'}
          </SheetDescription>
        </SheetHeader>

        {province && (
          <div className='mt-4 space-y-3.5 sm:mt-6 sm:space-y-4'>
            {/* Action: Lihat Peta Kabupaten & Kota (Drill Down) */}
            {hasRegenciesData(province.id) && onDrillDown && (
              <motion.button
                type='button'
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98, y: 1 }}
                onClick={() => onDrillDown(province)}
                className='flex w-full items-center justify-center gap-2 rounded-lg border-2 border-black bg-amber-400 px-3 py-2.5 font-mono text-xs font-black uppercase tracking-wider text-black shadow-brutal transition-all hover:bg-amber-300 dark:border-white sm:px-4 sm:py-3'
              >
                <Layers className='-mt-0.5 size-4 shrink-0 stroke-[2.5]' />
                <span className='leading-none'>LIHAT PETA KOTA &amp; KABUPATEN</span>
              </motion.button>
            )}

            {/* Action: Tambahkan ke Komparasi */}
            {onAddToCompare && (
              <motion.button
                type='button'
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98, y: 1 }}
                onClick={() => onAddToCompare(province)}
                className={`flex w-full items-center justify-center gap-2 rounded-lg border-2 border-black px-3 py-2 font-mono text-xs font-black uppercase tracking-wider shadow-brutal-sm transition-all dark:border-white sm:px-4 sm:py-2.5 ${
                  isAlreadyCompared
                    ? 'bg-cyan-400 text-black shadow-brutal'
                    : 'bg-card text-foreground hover:bg-muted dark:bg-zinc-900'
                }`}
              >
                {isAlreadyCompared ? (
                  <Check className='-mt-0.5 size-3.5 shrink-0 stroke-[2.5]' />
                ) : (
                  <Plus className='-mt-0.5 size-3.5 shrink-0 stroke-[2.5]' />
                )}
                <span className='leading-none'>
                  {isAlreadyCompared ? 'DI DAFTAR KOMPARASI' : 'TAMBAH KE KOMPARASI'}
                </span>
              </motion.button>
            )}

            {/* Quick Stat Cards */}
            <div className='grid grid-cols-2 gap-2 sm:gap-3'>
              {/* Ibu Kota */}
              <motion.div
                whileHover={{ y: -2, scale: 1.02 }}
                className='rounded-lg border-2 border-black bg-card p-2.5 shadow-brutal-sm dark:border-white dark:bg-zinc-900 sm:p-3'
              >
                <div className='flex items-center gap-1.5 text-muted-foreground'>
                  <MapPin className='-mt-0.5 size-3.5 shrink-0 stroke-[2.5] text-red-600' />
                  <span className='font-mono text-[9px] font-bold uppercase leading-none sm:text-[10px]'>
                    IBU KOTA
                  </span>
                </div>
                <p className='mt-1 truncate font-mono text-xs font-bold text-foreground sm:text-sm'>
                  {province.capital || '-'}
                </p>
              </motion.div>

              {/* Zona Waktu */}
              <motion.div
                whileHover={{ y: -2, scale: 1.02 }}
                className='rounded-lg border-2 border-black bg-card p-3 shadow-brutal-sm dark:border-white dark:bg-zinc-900'
              >
                <div className='flex items-center gap-1.5 text-muted-foreground'>
                  <Clock className='-mt-0.5 size-3.5 shrink-0 stroke-[2.5] text-amber-500' />
                  <span className='font-mono text-[10px] font-bold uppercase leading-none'>
                    ZONA WAKTU
                  </span>
                </div>
                <p className='mt-1 font-mono text-sm font-bold text-foreground'>
                  {province.timezone || '-'}
                </p>
              </motion.div>

              {/* Penduduk */}
              <motion.div
                whileHover={{ y: -2, scale: 1.02 }}
                className='rounded-lg border-2 border-black bg-card p-3 shadow-brutal-sm dark:border-white dark:bg-zinc-900'
              >
                <div className='flex items-center gap-1.5 text-muted-foreground'>
                  <Users className='-mt-0.5 size-3.5 shrink-0 stroke-[2.5] text-blue-600' />
                  <span className='font-mono text-[10px] font-bold uppercase leading-none'>
                    POPULASI
                  </span>
                </div>
                <p className='mt-1 font-mono text-sm font-bold text-foreground'>
                  {formatNumber(province.population)}
                </p>
              </motion.div>

              {/* Luas Wilayah */}
              <motion.div
                whileHover={{ y: -2, scale: 1.02 }}
                className='rounded-lg border-2 border-black bg-card p-3 shadow-brutal-sm dark:border-white dark:bg-zinc-900'
              >
                <div className='flex items-center gap-1.5 text-muted-foreground'>
                  <Maximize2 className='-mt-0.5 size-3.5 shrink-0 stroke-[2.5] text-emerald-600' />
                  <span className='font-mono text-[10px] font-bold uppercase leading-none'>
                    LUAS WILAYAH
                  </span>
                </div>
                <p className='mt-1 font-mono text-sm font-bold text-foreground'>
                  {formatNumber(province.areaKm2)} km²
                </p>
              </motion.div>
            </div>

            {/* Widget Cuaca Terkini Real-time */}
            <WeatherCard
              provinceId={province.id}
              provinceName={province.name}
              capital={province.capital}
            />

            {/* Ringkasan & Deskripsi */}
            {province.description && (
              <div className='rounded-lg border-2 border-black bg-card p-4 shadow-brutal-sm dark:border-white dark:bg-zinc-900'>
                <h4 className='mb-2 font-mono text-[10px] font-black uppercase tracking-wider text-muted-foreground'>
                  [TENTANG PROVINSI]
                </h4>
                <p className='text-xs leading-relaxed text-foreground'>
                  {province.description}
                </p>
              </div>
            )}

            {/* Catatan Validitas & Sumber Data Resmi */}
            <div className='rounded-lg border-2 border-black bg-muted/60 p-3.5 text-xs text-muted-foreground dark:border-white dark:bg-zinc-900'>
              <div className='flex items-center gap-1.5 font-mono font-bold text-foreground'>
                <ShieldCheck className='size-4 shrink-0 stroke-[2.5] text-emerald-600' />
                <span className='leading-none'>
                  [RUJUKAN RESMI GEOSPASIAL & LINGKUNGAN]
                </span>
              </div>
              <ul className='mt-2 space-y-1.5 font-mono text-[10px] leading-relaxed'>
                <li className='flex items-start gap-1.5'>
                  <span className='mt-1.5 size-1.5 shrink-0 rounded-full bg-foreground/60' />
                  <span>
                    <strong>Populasi:</strong> BPS RI — Proyeksi Penduduk Interim 2023.
                  </span>
                </li>
                <li className='flex items-start gap-1.5'>
                  <span className='mt-1.5 size-1.5 shrink-0 rounded-full bg-foreground/60' />
                  <span>
                    <strong>Pemekaran 38 Provinsi:</strong> Kemendagri & BIG.
                  </span>
                </li>
                <li className='flex items-start gap-1.5'>
                  <span className='mt-1.5 size-1.5 shrink-0 rounded-full bg-foreground/60' />
                  <span>
                    <strong>Cuaca & Kualitas Udara (AQI):</strong> Open-Meteo API (Lisensi
                    Terbuka CC BY 4.0).
                  </span>
                </li>
              </ul>
            </div>

            {/* Tautan Wikipedia */}
            {province.wikipediaUrl && (
              <motion.div
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98, y: 1 }}
              >
                <a
                  href={province.wikipediaUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-black bg-red-600 px-4 py-2 font-mono text-xs font-black uppercase tracking-wider text-white shadow-brutal-sm transition hover:bg-red-500 hover:shadow-brutal dark:border-white'
                >
                  <span className='leading-none'>BACA DI WIKIPEDIA</span>
                  <ExternalLink className='size-3.5 shrink-0 stroke-[2.5]' />
                </a>
              </motion.div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
