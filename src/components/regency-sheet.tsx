import { motion } from 'framer-motion';
import { Building, MapPin, Maximize2, ShieldCheck, Users } from 'lucide-react';

import { Regency } from '../interfaces/regency';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';
import WeatherCard from './weather-card';

interface RegencySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  regency: Regency | null;
  provinceName?: string;
}

export default function RegencySheet({
  open,
  onOpenChange,
  regency,
  provinceName,
}: RegencySheetProps) {
  const formatNumber = (val?: number) => {
    if (!val) return '-';
    return new Intl.NumberFormat('id-ID').format(val);
  };

  const density =
    regency?.population && regency?.areaKm2 && regency.areaKm2 > 0
      ? Math.round(regency.population / regency.areaKm2)
      : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='w-full overflow-y-auto border-l-2 border-black bg-background p-4 shadow-brutal-xl dark:border-white sm:max-w-md sm:p-6'>
        <SheetHeader className='space-y-1.5 text-left sm:space-y-2'>
          <div className='flex flex-wrap items-center gap-1.5'>
            {regency?.type && (
              <span
                className={`rounded border-2 border-black px-2 py-0.5 font-mono text-[10px] font-black uppercase text-black shadow-brutal-sm dark:border-white ${
                  regency.type === 'Kota' ? 'bg-cyan-300' : 'bg-emerald-300'
                }`}
              >
                {regency.type}
              </span>
            )}
            {provinceName && (
              <span className='rounded border-2 border-black bg-amber-300 px-2 py-0.5 font-mono text-[10px] font-black uppercase text-black shadow-brutal-sm dark:border-white'>
                PROVINSI {provinceName.toUpperCase()}
              </span>
            )}
            <span className='font-mono text-[10px] font-bold text-muted-foreground'>
              [KODE WILAYAH: {regency?.id}]
            </span>
          </div>

          <SheetTitle className='font-mono text-xl font-black uppercase tracking-tight text-foreground sm:text-2xl'>
            {regency ? regency.name : 'Detail Kabupaten/Kota'}
          </SheetTitle>
          <SheetDescription className='font-mono text-[11px] text-muted-foreground sm:text-xs'>
            {regency
              ? `[STATISTIK ADMINISTRATIF TINGKAT II // ${regency.name.toUpperCase()}]`
              : 'Informasi demografi dan geografis wilayah administratif'}
          </SheetDescription>
        </SheetHeader>

        {regency && (
          <div className='mt-4 space-y-3.5 sm:mt-6 sm:space-y-4'>
            {/* Quick Stat Cards */}
            <div className='grid grid-cols-2 gap-2 sm:gap-3'>
              {/* Capital City / Administrative Center */}
              <motion.div
                whileHover={{ y: -2, scale: 1.02 }}
                className='rounded-lg border-2 border-black bg-card p-2.5 shadow-brutal-sm dark:border-white dark:bg-zinc-900 sm:p-3'
              >
                <div className='flex items-center gap-1.5 text-muted-foreground'>
                  <MapPin className='-mt-0.5 size-3.5 shrink-0 stroke-[2.5] text-red-600' />
                  <span className='font-mono text-[9px] font-bold uppercase leading-none sm:text-[10px]'>
                    PUSAT PEMERINTAHAN
                  </span>
                </div>
                <div className='mt-1.5 font-mono text-xs font-black uppercase tracking-tight text-foreground sm:text-sm'>
                  {regency.capital || '-'}
                </div>
              </motion.div>

              {/* Autonomy Status */}
              <motion.div
                whileHover={{ y: -2, scale: 1.02 }}
                className='rounded-lg border-2 border-black bg-card p-2.5 shadow-brutal-sm dark:border-white dark:bg-zinc-900 sm:p-3'
              >
                <div className='flex items-center gap-1.5 text-muted-foreground'>
                  <Building className='-mt-0.5 size-3.5 shrink-0 stroke-[2.5] text-amber-500' />
                  <span className='font-mono text-[9px] font-bold uppercase leading-none sm:text-[10px]'>
                    BENTUK OTONOMI
                  </span>
                </div>
                <div className='mt-1.5 font-mono text-xs font-black uppercase tracking-tight text-foreground sm:text-sm'>
                  {regency.type} Otonom
                </div>
              </motion.div>

              {/* Total Population */}
              <motion.div
                whileHover={{ y: -2, scale: 1.02 }}
                className='rounded-lg border-2 border-black bg-card p-2.5 shadow-brutal-sm dark:border-white dark:bg-zinc-900 sm:p-3'
              >
                <div className='flex items-center gap-1.5 text-muted-foreground'>
                  <Users className='-mt-0.5 size-3.5 shrink-0 stroke-[2.5] text-blue-600' />
                  <span className='font-mono text-[9px] font-bold uppercase leading-none sm:text-[10px]'>
                    JUMLAH PENDUDUK
                  </span>
                </div>
                <div className='mt-1.5 font-mono text-xs font-black tracking-tight text-foreground sm:text-sm'>
                  {formatNumber(regency.population)}
                  <span className='ml-1 text-[10px] font-bold text-muted-foreground'>
                    Jiwa
                  </span>
                </div>
              </motion.div>

              {/* Land Area */}
              <motion.div
                whileHover={{ y: -2, scale: 1.02 }}
                className='rounded-lg border-2 border-black bg-card p-2.5 shadow-brutal-sm dark:border-white dark:bg-zinc-900 sm:p-3'
              >
                <div className='flex items-center gap-1.5 text-muted-foreground'>
                  <Maximize2 className='-mt-0.5 size-3.5 shrink-0 stroke-[2.5] text-emerald-600' />
                  <span className='font-mono text-[9px] font-bold uppercase leading-none sm:text-[10px]'>
                    LUAS DARATAN
                  </span>
                </div>
                <div className='mt-1.5 font-mono text-xs font-black tracking-tight text-foreground sm:text-sm'>
                  {formatNumber(
                    regency.areaKm2 ? Math.round(regency.areaKm2) : undefined,
                  )}
                  <span className='ml-1 text-[10px] font-bold text-muted-foreground'>
                    km²
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Population Density Card */}
            {density && (
              <div className='flex items-center justify-between rounded-lg border-2 border-black bg-muted/60 px-3 py-2 font-mono text-xs shadow-brutal-sm dark:border-white dark:bg-zinc-900'>
                <span className='font-bold uppercase text-muted-foreground'>
                  Kepadatan Rata-rata:
                </span>
                <span className='font-black text-foreground'>
                  {formatNumber(density)} Jiwa/km²
                </span>
              </div>
            )}

            {/* Real-time Weather & Air Quality Widget */}
            <WeatherCard
              provinceId={regency.provinceId}
              provinceName={provinceName || regency.provinceId}
              regencyId={regency.id}
              regencyName={regency.name}
              capital={regency.capital}
            />

            {/* Overview Description */}
            <div className='rounded-lg border-2 border-black bg-card p-3 font-mono shadow-brutal-sm dark:border-white dark:bg-zinc-900 sm:p-4'>
              <div className='flex items-center gap-1.5 text-muted-foreground'>
                <ShieldCheck className='size-3.5 shrink-0 stroke-[2.5] text-indigo-500' />
                <span className='text-[10px] font-bold uppercase'>
                  PROFIL &amp; KEWILAYAHAN
                </span>
              </div>
              <p className='mt-2 text-xs leading-relaxed text-muted-foreground'>
                {regency.description ||
                  `${regency.name} merupakan salah satu daerah otonom tingkat II di ${provinceName} dengan peran penting dalam pembangunan ekonomi dan kebudayaan daerah.`}
              </p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
