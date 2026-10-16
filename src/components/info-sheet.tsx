import { motion } from 'framer-motion';
import {
  Clock,
  ExternalLink,
  MapPin,
  Maximize2,
  Scale,
  ShieldCheck,
  Users,
} from 'lucide-react';

import { Province } from '../interfaces/province';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';

interface InfoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  province: Province | null;
  isAlreadyCompared?: boolean;
  onAddToCompare?: (province: Province) => void;
}

export default function InfoSheet({
  open,
  onOpenChange,
  province,
  isAlreadyCompared,
  onAddToCompare,
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
                <Scale className='size-3.5 stroke-[2.5]' />
                <span>
                  {isAlreadyCompared ? '✓ DI DAFTAR KOMPARASI' : '+ TAMBAH KE KOMPARASI'}
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
                <div className='flex items-center space-x-1.5 text-muted-foreground'>
                  <MapPin className='size-3 stroke-[2.5] text-red-600 sm:size-3.5' />
                  <span className='font-mono text-[9px] font-bold uppercase sm:text-[10px]'>
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
                <div className='flex items-center space-x-1.5 text-muted-foreground'>
                  <Clock className='size-3.5 stroke-[2.5] text-amber-500' />
                  <span className='font-mono text-[10px] font-bold uppercase'>
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
                <div className='flex items-center space-x-1.5 text-muted-foreground'>
                  <Users className='size-3.5 stroke-[2.5] text-blue-600' />
                  <span className='font-mono text-[10px] font-bold uppercase'>
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
                <div className='flex items-center space-x-1.5 text-muted-foreground'>
                  <Maximize2 className='size-3.5 stroke-[2.5] text-emerald-600' />
                  <span className='font-mono text-[10px] font-bold uppercase'>
                    LUAS WILAYAH
                  </span>
                </div>
                <p className='mt-1 font-mono text-sm font-bold text-foreground'>
                  {formatNumber(province.areaKm2)} km²
                </p>
              </motion.div>
            </div>

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
                <ShieldCheck className='size-4 stroke-[2.5] text-emerald-600' />
                <span>[RUJUKAN RESMI GEOSPASIAL]</span>
              </div>
              <ul className='mt-2 space-y-1 font-mono text-[10px] leading-relaxed'>
                <li>
                  • <strong>Populasi:</strong> BPS RI — Proyeksi Penduduk Interim 2023.
                </li>
                <li>
                  • <strong>Pemekaran 38 Provinsi:</strong> Kemendagri & BIG.
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
                  <span>BACA DI WIKIPEDIA</span>
                  <ExternalLink className='size-3.5 stroke-[2.5]' />
                </a>
              </motion.div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
