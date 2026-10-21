import { motion } from 'framer-motion';
import {
  Building2,
  Filter,
  ListFilter,
  MapPin,
  Maximize2,
  PanelLeft,
  PanelRight,
  Search,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { Province } from '../interfaces/province';
import { Regency } from '../interfaces/regency';
import { formatNumber } from '../utils/choropleth';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface RegencyListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  province: Province | null;
  regencies: Regency[];
  hoveredRegencyId?: string | null;
  onHoverRegency: (regencyId: string | null) => void;
  onSelectRegency: (regency: Regency) => void;
}

export type DockPosition = 'left' | 'center' | 'right';

export default function RegencyListModal({
  open,
  onOpenChange,
  province,
  regencies,
  hoveredRegencyId,
  onHoverRegency,
  onSelectRegency,
}: RegencyListModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'kabupaten' | 'kota'>('all');
  const [dockPosition, setDockPosition] = useState<DockPosition>('right');

  // breakdown counts
  const kabCount = useMemo(
    () => regencies.filter((r) => r.type.toLowerCase() === 'kabupaten').length,
    [regencies],
  );
  const kotaCount = useMemo(
    () => regencies.filter((r) => r.type.toLowerCase().includes('kota')).length,
    [regencies],
  );

  // filtered regencies list
  const filteredRegencies = useMemo(() => {
    return regencies.filter((r) => {
      const matchType =
        selectedType === 'all' ||
        (selectedType === 'kabupaten' && r.type.toLowerCase() === 'kabupaten') ||
        (selectedType === 'kota' && r.type.toLowerCase().includes('kota'));

      if (!matchType) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchName = r.name.toLowerCase().includes(q);
      const matchCapital = r.capital?.toLowerCase().includes(q);
      return matchName || matchCapital;
    });
  }, [regencies, selectedType, searchQuery]);

  const dockClasses = useMemo(() => {
    if (dockPosition === 'left') {
      return 'md:left-6 md:top-1/2 md:translate-x-0 md:-translate-y-1/2 md:w-[480px] md:max-w-[42vw]';
    }
    if (dockPosition === 'right') {
      return 'md:left-[calc(100%-1.5rem)] md:top-1/2 md:-translate-x-full md:-translate-y-1/2 md:w-[480px] md:max-w-[42vw]';
    }
    // center
    return 'md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[94vw] md:max-w-4xl';
  }, [dockPosition]);

  if (!province) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onHoverRegency(null);
          setSearchQuery('');
          setSelectedType('all');
        }
        onOpenChange(isOpen);
      }}
    >
      <DialogContent
        hideCloseButton
        overlayClassName='bg-black/20 backdrop-blur-[1px]'
        className={`flex h-[84vh] max-h-[85vh] w-[94vw] max-w-lg flex-col overflow-hidden p-0 transition-[left,transform,width,max-width] duration-500 ease-out will-change-[left,transform] ${dockClasses}`}
        style={{
          transition:
            'left 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), width 0.45s cubic-bezier(0.16, 1, 0.3, 1), max-width 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div className='shrink-0 border-b-2 border-black bg-muted/70 p-3.5 dark:border-white dark:bg-zinc-900 sm:p-4'>
          <div className='flex items-center justify-between gap-2'>
            <div className='flex flex-wrap items-center gap-1.5 sm:gap-2'>
              <div className='flex items-center gap-1.5 rounded-md border-2 border-black bg-red-600 px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider text-white shadow-brutal-sm dark:border-white sm:text-xs'>
                <ListFilter className='size-3 sm:size-3.5' />
                <span>DAFTAR WILAYAH</span>
              </div>
              <span className='rounded-md border border-black bg-amber-300 px-2 py-0.5 font-mono text-[10px] font-black text-black shadow-brutal-sm dark:border-white sm:text-xs'>
                {regencies.length} KAB/KOTA
              </span>
              <span className='hidden items-center gap-1 rounded-md border border-black/30 bg-emerald-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 xl:inline-flex'>
                <span className='size-1.5 animate-pulse rounded-full bg-emerald-600 dark:bg-emerald-400' />
                Sorot Peta
              </span>
            </div>

            <div className='flex items-center gap-1.5 sm:gap-2'>
              <div className='hidden items-center rounded-lg border-2 border-black bg-background p-0.5 font-mono text-[10px] font-black uppercase text-foreground shadow-brutal-sm dark:border-white dark:bg-zinc-800 md:flex'>
                <button
                  type='button'
                  onClick={() => setDockPosition('left')}
                  className={`relative flex items-center gap-1 rounded px-2 py-0.5 transition-colors ${
                    dockPosition === 'left'
                      ? 'text-white'
                      : 'text-foreground hover:bg-muted'
                  }`}
                  title='Tampilan Samping Kiri (peta terlihat di kanan)'
                  aria-label='Tampilan Samping Kiri'
                >
                  {dockPosition === 'left' && (
                    <motion.div
                      layoutId='active-dock-pill'
                      className='absolute inset-0 rounded bg-red-600 shadow-sm'
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <PanelLeft className='relative z-10 size-3 stroke-[2.5]' />
                  <span className='relative z-10'>KIRI</span>
                </button>
                <button
                  type='button'
                  onClick={() => setDockPosition('center')}
                  className={`relative flex items-center gap-1 rounded px-2 py-0.5 transition-colors ${
                    dockPosition === 'center'
                      ? 'text-white'
                      : 'text-foreground hover:bg-muted'
                  }`}
                  title='Tampilan Tengah Layar Penuh'
                  aria-label='Tampilan Tengah Layar Penuh'
                >
                  {dockPosition === 'center' && (
                    <motion.div
                      layoutId='active-dock-pill'
                      className='absolute inset-0 rounded bg-red-600 shadow-sm'
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Maximize2 className='relative z-10 size-3 stroke-[2.5]' />
                  <span className='relative z-10'>TENGAH</span>
                </button>
                <button
                  type='button'
                  onClick={() => setDockPosition('right')}
                  className={`relative flex items-center gap-1 rounded px-2 py-0.5 transition-colors ${
                    dockPosition === 'right'
                      ? 'text-white'
                      : 'text-foreground hover:bg-muted'
                  }`}
                  title='Tampilan Samping Kanan (peta terlihat di kiri)'
                  aria-label='Tampilan Samping Kanan'
                >
                  {dockPosition === 'right' && (
                    <motion.div
                      layoutId='active-dock-pill'
                      className='absolute inset-0 rounded bg-red-600 shadow-sm'
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className='relative z-10'>KANAN</span>
                  <PanelRight className='relative z-10 size-3 stroke-[2.5]' />
                </button>
              </div>

              <DialogClose
                className='flex size-7 items-center justify-center rounded-lg border-2 border-black bg-background text-foreground shadow-brutal-sm transition hover:bg-red-600 hover:text-white dark:border-white dark:hover:bg-red-600 sm:size-8'
                title='Tutup modal daftar wilayah'
                aria-label='Tutup modal'
              >
                <X className='size-4 stroke-[2.5]' />
              </DialogClose>
            </div>
          </div>

          <DialogHeader className='mt-2 space-y-0.5 text-left'>
            <DialogTitle className='font-mono text-base font-black uppercase tracking-wide text-foreground sm:text-xl'>
              {province.name}
            </DialogTitle>
            <DialogDescription className='font-mono text-xs text-muted-foreground'>
              Arahkan kursor pada kartu untuk menyorot lokasinya di peta, atau klik untuk
              melihat profil lengkap.
            </DialogDescription>
          </DialogHeader>

          <div className='mt-3.5 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between'>
            <div className='relative flex-1'>
              <Search className='pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground' />
              <input
                type='text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Cari nama kabupaten atau kota...'
                className='w-full rounded-lg border-2 border-black bg-background py-1.5 pl-8 pr-7 font-mono text-xs font-bold text-foreground shadow-brutal-sm transition placeholder:font-sans placeholder:font-normal placeholder:text-muted-foreground focus:border-red-600 focus:outline-none dark:border-white dark:bg-zinc-950 sm:text-xs'
              />
              {searchQuery && (
                <button
                  type='button'
                  onClick={() => setSearchQuery('')}
                  className='absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-red-600'
                  aria-label='Hapus pencarian'
                >
                  <X className='size-3.5' />
                </button>
              )}
            </div>

            <div className='flex flex-wrap items-center gap-1.5'>
              <button
                type='button'
                onClick={() => setSelectedType('all')}
                className={`rounded-md border-2 border-black px-2 py-1 font-mono text-[11px] font-black transition dark:border-white ${
                  selectedType === 'all'
                    ? 'bg-red-600 text-white shadow-brutal-sm'
                    : 'bg-background text-foreground shadow-brutal-sm hover:bg-muted dark:bg-zinc-900'
                }`}
              >
                Semua [{regencies.length}]
              </button>
              {kabCount > 0 && (
                <button
                  type='button'
                  onClick={() => setSelectedType('kabupaten')}
                  className={`rounded-md border-2 border-black px-2 py-1 font-mono text-[11px] font-black transition dark:border-white ${
                    selectedType === 'kabupaten'
                      ? 'bg-red-600 text-white shadow-brutal-sm'
                      : 'bg-background text-foreground shadow-brutal-sm hover:bg-muted dark:bg-zinc-900'
                  }`}
                >
                  Kabupaten [{kabCount}]
                </button>
              )}
              {kotaCount > 0 && (
                <button
                  type='button'
                  onClick={() => setSelectedType('kota')}
                  className={`rounded-md border-2 border-black px-2 py-1 font-mono text-[11px] font-black transition dark:border-white ${
                    selectedType === 'kota'
                      ? 'bg-red-600 text-white shadow-brutal-sm'
                      : 'bg-background text-foreground shadow-brutal-sm hover:bg-muted dark:bg-zinc-900'
                  }`}
                >
                  Kota [{kotaCount}]
                </button>
              )}
            </div>
          </div>
        </div>

        {/* regency cards grid */}
        <div
          onMouseLeave={() => onHoverRegency(null)}
          className='no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5'
        >
          {filteredRegencies.length > 0 ? (
            <div
              className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${
                dockPosition === 'center' ? 'lg:grid-cols-3' : ''
              }`}
            >
              {filteredRegencies.map((reg) => {
                const isHovered = hoveredRegencyId === reg.id;
                const isKota = reg.type.toLowerCase().includes('kota');
                const pop = reg.population ?? 0;
                const area = reg.areaKm2 ?? 0;
                const density = area > 0 ? Math.round(pop / area) : 0;

                return (
                  <motion.div
                    layout
                    transition={{
                      layout: { duration: 0.35, ease: 'easeOut' },
                    }}
                    key={reg.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onMouseEnter={() => onHoverRegency(reg.id)}
                    onMouseLeave={() => onHoverRegency(null)}
                    onClick={() => {
                      onHoverRegency(null);
                      onSelectRegency(reg);
                      onOpenChange(false);
                    }}
                    className={`group relative flex cursor-pointer flex-col justify-between rounded-xl border-2 p-3 font-mono transition-all duration-150 ${
                      isHovered
                        ? 'border-red-600 bg-amber-50 shadow-brutal-red dark:bg-zinc-800'
                        : 'border-black bg-card shadow-brutal-sm hover:border-red-600 hover:shadow-brutal dark:border-white dark:bg-zinc-950'
                    }`}
                  >
                    <div>
                      <div className='flex items-start justify-between gap-1.5'>
                        <h4 className='text-xs font-black text-foreground group-hover:text-red-600 dark:group-hover:text-red-400 sm:text-sm'>
                          {reg.name}
                        </h4>
                        <span
                          className={`shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-black uppercase shadow-brutal-sm ${
                            isKota
                              ? 'border-black bg-cyan-300 text-black dark:border-white'
                              : 'border-black bg-emerald-300 text-black dark:border-white'
                          }`}
                        >
                          {reg.type}
                        </span>
                      </div>

                      {reg.capital && reg.capital !== '-' && (
                        <div className='mt-1 flex items-center gap-1 text-[11px] text-muted-foreground'>
                          <MapPin className='size-3 shrink-0 text-red-500' />
                          <span className='truncate'>Pusat: {reg.capital}</span>
                        </div>
                      )}
                    </div>

                    <div className='mt-3 grid grid-cols-2 gap-1.5 border-t border-dashed border-black/20 pt-2 text-[10px] dark:border-white/20'>
                      <div className='flex items-center gap-1 text-muted-foreground'>
                        <Users className='size-3 text-blue-500' />
                        <span className='font-bold text-foreground'>
                          {reg.population !== undefined
                            ? formatNumber(reg.population)
                            : '-'}
                        </span>
                      </div>
                      <div className='flex items-center gap-1 text-muted-foreground'>
                        <Maximize2 className='size-3 text-emerald-500' />
                        <span className='font-bold text-foreground'>
                          {reg.areaKm2 !== undefined
                            ? `${formatNumber(reg.areaKm2)} km²`
                            : '-'}
                        </span>
                      </div>
                      <div className='col-span-2 flex items-center justify-between text-[10px] text-muted-foreground'>
                        <div className='flex items-center gap-1'>
                          <Building2 className='size-3 text-orange-500' />
                          <span>{formatNumber(density)} jiwa/km²</span>
                        </div>
                        <span className='font-bold text-red-600 group-hover:underline dark:text-red-400'>
                          Lihat Detail &rarr;
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-12 text-center font-mono text-xs text-muted-foreground'>
              <Filter className='mb-2 size-8 text-muted-foreground/40' />
              <p>Tidak ada kabupaten/kota yang cocok dengan &quot;{searchQuery}&quot;</p>
              <button
                type='button'
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                }}
                className='mt-2 font-bold text-red-600 hover:underline dark:text-red-400'
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>

        <div className='flex shrink-0 items-center justify-between border-t-2 border-black bg-muted/40 px-4 py-2.5 font-mono text-[11px] text-muted-foreground dark:border-white dark:bg-zinc-900 sm:px-5'>
          <span className='flex items-center gap-1'>
            <Sparkles className='size-3 text-amber-500' />
            <span>Hover untuk menyorot peta</span>
          </span>
          <span>
            Menampilkan {filteredRegencies.length} dari {regencies.length}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
