import { AnimatePresence, motion } from 'framer-motion';
import {
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Filter,
  Info,
  Layers,
  ListFilter,
  Map,
  MapPin,
  Maximize2,
  Scale,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  getSlugFromProvinceId,
  hasRegenciesData,
  PROVINCE_REGENCIES_MAP,
} from '../data/regencies';
import { ChoroplethMetric } from '../interfaces/choropleth';
import { Province } from '../interfaces/province';
import { Regency } from '../interfaces/regency';
import ThemeToggle from './theme-toggle';

interface SearchBarFilterProps {
  provinces: Province[];
  selectedIsland: string | null;
  activeMetric: ChoroplethMetric;
  isDark: boolean;
  isCompareActive?: boolean;
  compareCount?: number;
  currentProvince?: Province | null;
  regencies?: Regency[];
  selectedRegencyType?: 'all' | 'kabupaten' | 'kota';
  onSelectRegencyType?: (type: 'all' | 'kabupaten' | 'kota') => void;
  onBackToNational?: () => void;
  onSelectOtherProvince?: (provinceId: string) => void;
  onToggleTheme: () => void;
  onToggleCompareMode?: () => void;
  onSelectMetric: (metric: ChoroplethMetric) => void;
  onSelectIsland: (island: string | null) => void;
  onSelectProvince: (id: string) => void;
  onSelectRegency?: (regency: Regency) => void;
  onOpenAbout?: () => void;
  onOpenRegencyList?: () => void;
}

const ISLANDS = [
  'Semua',
  'Sumatera',
  'Jawa',
  'Kalimantan',
  'Sulawesi',
  'Bali & Nusa Tenggara',
  'Maluku',
  'Papua',
] as const;

const METRIC_TABS = [
  { id: 'none' as const, label: 'Standar', icon: Map },
  { id: 'population' as const, label: 'Populasi', icon: Users },
  { id: 'density' as const, label: 'Kepadatan', icon: Building2 },
  { id: 'area' as const, label: 'Luas Wilayah', icon: Maximize2 },
];

export default function SearchBarFilter({
  provinces,
  selectedIsland,
  activeMetric,
  isDark,
  isCompareActive,
  compareCount,
  currentProvince,
  regencies,
  selectedRegencyType = 'all',
  onSelectRegencyType,
  onBackToNational,
  onSelectOtherProvince,
  onToggleTheme,
  onToggleCompareMode,
  onSelectMetric,
  onSelectIsland,
  onSelectProvince,
  onSelectRegency,
  onOpenAbout,
  onOpenRegencyList,
}: SearchBarFilterProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  type SearchItem =
    | { kind: 'province'; province: Province }
    | { kind: 'regency'; regency: Regency; province: Province };

  const availableProvinces = useMemo(() => Object.values(PROVINCE_REGENCIES_MAP), []);
  const currentSlug = currentProvince ? getSlugFromProvinceId(currentProvince.id) : '';

  // compute regency type breakdown in drill-down mode
  const regencyTypeTabs = useMemo(() => {
    if (!regencies || regencies.length === 0) return [];
    const kabCount = regencies.filter((r) => r.type.toLowerCase() === 'kabupaten').length;
    const kotaCount = regencies.filter((r) =>
      r.type.toLowerCase().includes('kota'),
    ).length;

    const tabs: Array<{
      id: 'all' | 'kabupaten' | 'kota';
      label: string;
      count: number;
    }> = [{ id: 'all', label: 'Semua', count: regencies.length }];
    if (kabCount > 0) {
      tabs.push({ id: 'kabupaten', label: 'Kabupaten', count: kabCount });
    }
    if (kotaCount > 0) {
      tabs.push({ id: 'kota', label: 'Kota', count: kotaCount });
    }
    return tabs;
  }, [regencies]);

  const searchResults = useMemo<SearchItem[]>(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();

    // search regencies of current province in drill-down mode
    if (currentProvince && regencies && regencies.length > 0) {
      return regencies
        .filter((r) => {
          const matchName = r.name.toLowerCase().includes(q);
          const matchCapital = r.capital?.toLowerCase().includes(q);
          return matchName || matchCapital;
        })
        .map((r) => ({
          kind: 'regency' as const,
          regency: r,
          province: currentProvince,
        }))
        .slice(0, 15);
    }

    // search provinces in national mode
    return provinces
      .filter((p) => {
        const matchName = p.name.toLowerCase().includes(q);
        const matchCapital = p.capital?.toLowerCase().includes(q);
        const matchIsland = p.island?.toLowerCase().includes(q);
        return matchName || matchCapital || matchIsland;
      })
      .map((p) => ({ kind: 'province' as const, province: p }))
      .slice(0, 15);
  }, [provinces, regencies, query, currentProvince]);

  // compute island counts
  const islandCounts = useMemo(() => {
    const counts: Record<string, number> = { Semua: provinces.length };
    provinces.forEach((p) => {
      if (p.island) {
        counts[p.island] = (counts[p.island] || 0) + 1;
      }
    });
    return counts;
  }, [provinces]);

  const handleSelectItem = (item: SearchItem) => {
    if (item.kind === 'province') {
      onSelectProvince(item.province.id);
    } else if (item.kind === 'regency') {
      if (onSelectRegency) {
        onSelectRegency(item.regency);
      } else {
        onSelectProvince(item.province.id);
      }
    }
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || searchResults.length === 0) {
      if (e.key === 'ArrowDown' && searchResults.length > 0) {
        setIsOpen(true);
        setSelectedIndex(0);
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
        e.preventDefault();
        handleSelectItem(searchResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  const hasActiveFilters = currentProvince
    ? activeMetric !== 'none' || (selectedRegencyType && selectedRegencyType !== 'all')
    : activeMetric !== 'none' || selectedIsland !== null;

  return (
    <div
      ref={containerRef}
      className='fixed inset-x-0 top-3 z-40 mx-auto w-full max-w-4xl px-3 sm:px-4'
    >
      <div className='rounded-xl border-2 border-black bg-background p-2.5 shadow-brutal transition-all dark:border-white dark:bg-zinc-950 dark:shadow-brutal-white sm:p-3'>
        {/* drill-down navigation bar */}
        {currentProvince && (
          <div className='relative z-20 mb-2 flex items-center justify-between gap-1.5 border-b-2 border-dashed border-black/20 pb-2 dark:border-white/20 sm:mb-2.5 sm:gap-2 sm:pb-2.5'>
            <div className='flex min-w-0 items-center gap-1.5 sm:gap-2'>
              {onBackToNational && (
                <motion.button
                  type='button'
                  whileHover={{ scale: 1.04, x: -1 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={onBackToNational}
                  className='flex shrink-0 items-center gap-1 rounded-lg border-2 border-black bg-red-600 px-2 py-1 font-mono text-[11px] font-black uppercase text-white shadow-brutal-sm transition hover:bg-red-700 dark:border-white sm:px-2.5 sm:py-1.5 sm:text-xs'
                  title='Kembali ke Peta Nasional'
                  aria-label='Kembali ke Peta Nasional'
                >
                  <ChevronLeft className='size-3.5 shrink-0 stroke-[3] sm:size-4' />
                  <span>PETA NASIONAL</span>
                </motion.button>
              )}

              <div className='flex min-w-0 items-center gap-1 rounded-lg border-2 border-black bg-muted/80 px-2 py-1 font-mono text-[11px] font-black uppercase text-foreground shadow-brutal-sm dark:border-white dark:bg-zinc-900 sm:px-2.5 sm:py-1.5 sm:text-xs'>
                <span className='hidden text-muted-foreground sm:inline'>INDONESIA</span>
                <ChevronRight className='hidden size-3 text-muted-foreground sm:inline' />
                <span className='truncate text-red-600 dark:text-red-400'>
                  {currentProvince.name}
                </span>
              </div>
            </div>

            <div className='flex shrink-0 items-center gap-1.5 sm:gap-2'>
              <div className='hidden items-center gap-1 rounded-lg border-2 border-black bg-amber-300 px-2 py-1 font-mono text-xs font-black text-black shadow-brutal-sm dark:border-white sm:flex sm:py-1.5'>
                <Filter className='size-3.5 stroke-[2.5]' />
                <span>{regencies ? regencies.length : 0} KAB/KOTA</span>
              </div>

              {onOpenRegencyList && (
                <motion.button
                  type='button'
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={onOpenRegencyList}
                  className='flex items-center gap-1.5 rounded-lg border-2 border-black bg-yellow-400 px-2 py-1 font-mono text-[11px] font-black uppercase text-black shadow-brutal-sm transition hover:bg-yellow-300 dark:border-white sm:px-2.5 sm:py-1.5 sm:text-xs'
                  title='Buka Daftar Wilayah Kabupaten & Kota'
                  aria-label='Daftar Kabupaten dan Kota'
                >
                  <ListFilter className='size-3.5 stroke-[2.5] sm:size-4' />
                  <span>DAFTAR WILAYAH</span>
                  {regencies && (
                    <span className='py-0.2 rounded bg-black px-1.5 font-mono text-[10px] font-black text-white dark:bg-white dark:text-black sm:hidden'>
                      {regencies.length}
                    </span>
                  )}
                </motion.button>
              )}
            </div>
          </div>
        )}

        {/* search & controls */}
        <div className='relative z-20 flex items-center justify-between gap-1.5 sm:gap-2.5'>
          {!currentProvince && (
            <div className='hidden items-center gap-1.5 rounded-lg border-2 border-black bg-red-600 px-2.5 py-1.5 font-mono text-xs font-black tracking-wider text-white shadow-brutal-sm dark:border-white sm:flex'>
              <span className='size-2 animate-pulse rounded-full bg-white' />
              <span>IDN // 38</span>
            </div>
          )}

          <div className='relative min-w-0 flex-1'>
            <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-black dark:text-white'>
              <Search className='size-4 stroke-[2.5]' />
            </div>

            <input
              type='text'
              role='combobox'
              aria-expanded={isOpen && searchResults.length > 0}
              aria-controls='province-search-results'
              aria-autocomplete='list'
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
                setSelectedIndex(-1);
              }}
              onFocus={() => {
                if (query.trim()) setIsOpen(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                currentProvince
                  ? `Cari kabupaten atau kota di ${currentProvince.name}...`
                  : 'Cari 38 provinsi di Indonesia...'
              }
              className='w-full rounded-lg border-2 border-black bg-background px-9 py-1.5 font-mono text-xs font-bold text-foreground shadow-brutal-sm transition placeholder:font-sans placeholder:font-medium placeholder:text-muted-foreground focus:border-red-600 focus:shadow-brutal-red focus:outline-none dark:border-white dark:shadow-brutal-white-sm dark:focus:border-red-500 sm:py-2 sm:text-sm'
            />

            {query && (
              <motion.button
                type='button'
                whileHover={{ scale: 1.15, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setQuery('');
                  setIsOpen(false);
                  setSelectedIndex(-1);
                }}
                className='absolute inset-y-0 right-0 flex items-center pr-3 font-bold text-foreground transition hover:text-red-600'
                aria-label='Hapus pencarian'
              >
                <X className='size-4 stroke-[2.5]' />
              </motion.button>
            )}

            {/* search suggestions dropdown */}
            <AnimatePresence>
              {isOpen && query.trim() && (
                <motion.div
                  id='province-search-results'
                  role='listbox'
                  aria-label='Hasil pencarian wilayah'
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  onWheel={(e) => e.stopPropagation()}
                  className='no-scrollbar absolute inset-x-0 top-full z-50 mt-2 max-h-56 overflow-y-auto overscroll-contain rounded-xl border-2 border-black bg-background p-1.5 text-foreground shadow-brutal-lg dark:border-white dark:bg-zinc-900 dark:shadow-brutal-white-lg sm:max-h-72'
                >
                  {searchResults.length > 0 ? (
                    searchResults.map((item, index) => {
                      const isHighlighted = selectedIndex === index;
                      const isProvince = item.kind === 'province';
                      const key = isProvince
                        ? item.province.id
                        : `reg-${item.regency.id}`;

                      return (
                        <motion.button
                          key={key}
                          type='button'
                          role='option'
                          aria-selected={isHighlighted}
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelectItem(item)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={`group flex w-full items-center justify-between border-b border-dashed border-black/20 px-3 py-2 text-left text-sm transition-colors last:border-b-0 ${
                            isHighlighted
                              ? 'bg-amber-100 dark:bg-zinc-800'
                              : 'hover:bg-red-50 dark:border-white/20 dark:hover:bg-zinc-800'
                          }`}
                        >
                          <div className='flex flex-col'>
                            <div className='flex items-center gap-1.5'>
                              <span
                                className={`font-bold ${
                                  isHighlighted
                                    ? 'text-red-600 dark:text-red-400'
                                    : 'text-foreground group-hover:text-red-600'
                                }`}
                              >
                                {isProvince ? item.province.name : item.regency.name}
                              </span>
                              {!isProvince && (
                                <span className='py-0.2 rounded bg-muted px-1 font-mono text-[9px] font-black text-muted-foreground'>
                                  {item.regency.type}
                                </span>
                              )}
                            </div>

                            {isProvince ? (
                              item.province.capital && (
                                <span className='flex items-center gap-1 font-mono text-xs text-muted-foreground'>
                                  <MapPin className='size-3 stroke-[2.5] text-red-600' />
                                  Ibu Kota: {item.province.capital}
                                </span>
                              )
                            ) : (
                              <span className='flex items-center gap-1 font-mono text-[11px] text-muted-foreground'>
                                <MapPin className='size-2.5 text-red-500' />
                                {item.province.name}
                                {item.regency.capital
                                  ? ` (Pusat: ${item.regency.capital})`
                                  : ''}
                              </span>
                            )}
                          </div>

                          <div className='flex items-center gap-1'>
                            {isProvince && hasRegenciesData(item.province.id) && (
                              <span className='rounded border border-black bg-cyan-300 px-1.5 py-0.5 font-mono text-[9px] font-black text-black shadow-brutal-sm dark:border-white'>
                                KAB/KOTA
                              </span>
                            )}
                            {isProvince && item.province.island && (
                              <span className='rounded border border-black bg-amber-300 px-2 py-0.5 font-mono text-[10px] font-bold text-black shadow-[1px_1px_0px_#000] dark:border-white'>
                                {item.province.island}
                              </span>
                            )}
                            {!isProvince && (
                              <span className='rounded border border-black bg-emerald-300 px-1.5 py-0.5 font-mono text-[9px] font-black text-black shadow-brutal-sm dark:border-white'>
                                PILIH
                              </span>
                            )}
                          </div>
                        </motion.button>
                      );
                    })
                  ) : (
                    <div className='py-6 text-center font-mono text-xs text-muted-foreground'>
                      Tidak ada hasil untuk &quot;
                      <span className='font-bold text-red-600'>{query}</span>
                      &quot;
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className='flex shrink-0 items-center gap-1.5 sm:gap-2'>
            <motion.button
              type='button'
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96, y: 1 }}
              onClick={() => setIsOptionsOpen((prev) => !prev)}
              className={`flex items-center gap-1.5 rounded-lg border-2 border-black px-2.5 py-1.5 text-xs font-bold transition dark:border-white sm:py-2 ${
                isOptionsOpen || hasActiveFilters
                  ? 'bg-red-600 text-white shadow-brutal-sm'
                  : 'bg-background text-foreground shadow-brutal-sm hover:bg-muted active:shadow-none'
              }`}
              aria-label={
                isOptionsOpen
                  ? 'Sembunyikan filter dan mode'
                  : 'Tampilkan filter dan mode'
              }
            >
              <SlidersHorizontal className='size-3.5 stroke-[2.5]' />
              <span className='hidden font-mono sm:inline'>
                {hasActiveFilters ? 'Filter Aktif' : 'Mode & Filter'}
              </span>
              {isOptionsOpen ? (
                <ChevronUp className='size-3.5 stroke-[2.5]' />
              ) : (
                <ChevronDown className='size-3.5 stroke-[2.5]' />
              )}
            </motion.button>

            {!currentProvince && (
              <div className='hidden items-center gap-1.5 rounded-lg border-2 border-black bg-background px-2.5 py-1.5 font-mono text-xs font-black text-foreground shadow-brutal-sm dark:border-white dark:bg-zinc-900 md:flex'>
                <Filter className='size-3.5 stroke-[2.5] text-red-600' />
                <span>38 PROV</span>
              </div>
            )}

            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />

            {onOpenAbout && (
              <motion.button
                type='button'
                onClick={onOpenAbout}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95, y: 1 }}
                className='flex size-9 items-center justify-center rounded-lg border-2 border-black bg-background text-foreground shadow-brutal-sm transition-colors hover:bg-muted active:shadow-none dark:border-white dark:bg-zinc-900 dark:shadow-brutal-white-sm dark:hover:bg-zinc-800'
                title='Tentang Aplikasi & Profil Pengembang'
                aria-label='Tentang Aplikasi dan Profil Pengembang'
              >
                <Info className='size-4 stroke-[2.5]' />
              </motion.button>
            )}
          </div>
        </div>

        {/* collapsible options drawer */}
        <AnimatePresence>
          {isOptionsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 26 }}
              className='no-scrollbar relative z-10 max-h-[60vh] overflow-y-auto overflow-x-hidden overscroll-contain'
            >
              <div className='mt-3 space-y-3 border-t-2 border-black pt-3 dark:border-white'>
                {/* thematic mode tabs */}
                <div className='flex flex-wrap items-center gap-1.5 sm:gap-2'>
                  <span className='mr-1 shrink-0 font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground'>
                    [MODE]:
                  </span>
                  {METRIC_TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeMetric === tab.id;

                    return (
                      <motion.button
                        key={tab.id}
                        type='button'
                        whileHover={{ y: -2, scale: 1.02 }}
                        whileTap={{ y: 1, scale: 0.98 }}
                        onClick={() => onSelectMetric(tab.id)}
                        className={`flex items-center gap-1.5 rounded-lg border-2 border-black px-2.5 py-1 font-mono text-xs font-bold transition dark:border-white sm:px-3 sm:py-1.5 ${
                          isActive
                            ? 'bg-red-600 text-white shadow-brutal-sm'
                            : 'bg-card text-foreground shadow-brutal-sm hover:bg-muted dark:bg-zinc-900'
                        }`}
                      >
                        <Icon className='size-3.5 stroke-[2.5]' />
                        <span>{tab.label}</span>
                      </motion.button>
                    );
                  })}

                  {/* compare mode button */}
                  {!currentProvince && onToggleCompareMode && (
                    <motion.button
                      type='button'
                      whileHover={{ y: -2, scale: 1.02 }}
                      whileTap={{ y: 1, scale: 0.98 }}
                      onClick={onToggleCompareMode}
                      className={`flex items-center gap-1.5 rounded-lg border-2 border-black px-2.5 py-1 font-mono text-xs font-bold transition dark:border-white sm:px-3 sm:py-1.5 ${
                        isCompareActive || (compareCount && compareCount > 0)
                          ? 'bg-cyan-400 text-black shadow-brutal-sm dark:bg-cyan-400'
                          : 'bg-card text-foreground shadow-brutal-sm hover:bg-muted dark:bg-zinc-900'
                      }`}
                    >
                      <Scale className='size-3.5 stroke-[2.5]' />
                      <span>KOMPARASI</span>
                      {compareCount && compareCount > 0 ? (
                        <span className='rounded border border-black bg-black px-1.5 text-[10px] font-black text-white dark:border-white'>
                          {compareCount}
                        </span>
                      ) : null}
                    </motion.button>
                  )}
                </div>

                {/* island filter tabs */}
                {!currentProvince && (
                  <div className='flex flex-wrap items-center gap-1.5 sm:gap-2'>
                    <span className='mr-1 shrink-0 font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground'>
                      [PULAU]:
                    </span>
                    {ISLANDS.map((island) => {
                      const isAll = island === 'Semua';
                      const isActive = isAll
                        ? !selectedIsland
                        : selectedIsland === island;
                      const count = islandCounts[island] || 0;

                      return (
                        <motion.button
                          key={island}
                          type='button'
                          whileHover={{ y: -1.5, scale: 1.02 }}
                          whileTap={{ y: 1, scale: 0.98 }}
                          onClick={() => onSelectIsland(isAll ? null : island)}
                          className={`rounded-lg border-2 border-black px-2 py-0.5 font-mono text-xs font-bold transition dark:border-white sm:px-2.5 sm:py-1 ${
                            isActive
                              ? 'bg-red-600 text-white shadow-brutal-sm'
                              : 'bg-card text-foreground shadow-brutal-sm hover:bg-muted dark:bg-zinc-900'
                          }`}
                        >
                          {island} <span className='opacity-80'>[{count}]</span>
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {/* regency type filter tabs */}
                {currentProvince && regencyTypeTabs.length > 0 && (
                  <div className='flex flex-wrap items-center gap-1.5 sm:gap-2'>
                    <span className='mr-1 shrink-0 font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground'>
                      [TIPE WILAYAH]:
                    </span>
                    {regencyTypeTabs.map((tab) => {
                      const isActive = (selectedRegencyType || 'all') === tab.id;

                      return (
                        <motion.button
                          key={tab.id}
                          type='button'
                          whileHover={{ y: -1.5, scale: 1.02 }}
                          whileTap={{ y: 1, scale: 0.98 }}
                          onClick={() => onSelectRegencyType?.(tab.id)}
                          className={`rounded-lg border-2 border-black px-2.5 py-1 font-mono text-xs font-bold transition dark:border-white sm:px-3 sm:py-1.5 ${
                            isActive
                              ? 'bg-red-600 text-white shadow-brutal-sm'
                              : 'bg-card text-foreground shadow-brutal-sm hover:bg-muted dark:bg-zinc-900'
                          }`}
                        >
                          {tab.label} <span className='opacity-80'>[{tab.count}]</span>
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {/* province switcher */}
                {currentProvince && onSelectOtherProvince && (
                  <div className='flex flex-wrap items-center gap-1.5 border-t border-dashed border-black/30 pt-2.5 dark:border-white/30 sm:gap-2'>
                    <span className='mr-1 flex shrink-0 items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground'>
                      <Layers className='size-3' />
                      <span>[GANTI PROVINSI]:</span>
                    </span>
                    {availableProvinces.map((p) => {
                      const isActive = p.provinceId === currentProvince.id;
                      return (
                        <motion.button
                          key={p.provinceId}
                          type='button'
                          whileHover={{ y: -1.5, scale: 1.02 }}
                          whileTap={{ y: 1, scale: 0.98 }}
                          onClick={() => onSelectOtherProvince(p.provinceId)}
                          className={`rounded-lg border-2 border-black px-2.5 py-1 font-mono text-xs font-bold transition dark:border-white ${
                            isActive
                              ? 'bg-cyan-400 text-black shadow-brutal-sm dark:bg-cyan-400'
                              : 'bg-card text-foreground shadow-brutal-sm hover:bg-muted dark:bg-zinc-900'
                          }`}
                        >
                          {p.provinceName
                            .replace('Daerah Khusus Ibukota ', '')
                            .replace('Daerah Istimewa ', 'DI ')}
                        </motion.button>
                      );
                    })}
                    {currentSlug && (
                      <span className='hidden rounded border border-black/20 bg-muted px-2 py-0.5 font-mono text-[10px] font-bold text-muted-foreground dark:border-white/20 sm:inline'>
                        /provinsi/{currentSlug}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
