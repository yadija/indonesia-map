import { AnimatePresence, motion } from 'framer-motion';
import {
  Building2,
  ChevronDown,
  ChevronUp,
  Filter,
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

import { ChoroplethMetric } from '../interfaces/choropleth';
import { Province } from '../interfaces/province';
import ThemeToggle from './theme-toggle';

interface SearchBarFilterProps {
  provinces: Province[];
  selectedIsland: string | null;
  activeMetric: ChoroplethMetric;
  isDark: boolean;
  isCompareActive?: boolean;
  compareCount?: number;
  onToggleTheme: () => void;
  onToggleCompareMode?: () => void;
  onSelectMetric: (metric: ChoroplethMetric) => void;
  onSelectIsland: (island: string | null) => void;
  onSelectProvince: (id: string) => void;
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
  onToggleTheme,
  onToggleCompareMode,
  onSelectMetric,
  onSelectIsland,
  onSelectProvince,
}: SearchBarFilterProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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

  // Filter provinces matching search query and optionally selected island
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return provinces.filter((p) => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchCapital = p.capital?.toLowerCase().includes(q);
      const matchIsland = p.island?.toLowerCase().includes(q);
      return matchName || matchCapital || matchIsland;
    });
  }, [provinces, query]);

  // Compute island counts
  const islandCounts = useMemo(() => {
    const counts: Record<string, number> = { Semua: provinces.length };
    provinces.forEach((p) => {
      if (p.island) {
        counts[p.island] = (counts[p.island] || 0) + 1;
      }
    });
    return counts;
  }, [provinces]);

  const handleSelect = (id: string) => {
    onSelectProvince(id);
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
        handleSelect(searchResults[selectedIndex].id);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  const hasActiveFilters = activeMetric !== 'none' || selectedIsland !== null;

  return (
    <div
      ref={containerRef}
      className='fixed inset-x-0 top-3 z-40 mx-auto w-full max-w-4xl px-3 sm:px-4'
    >
      <div className='rounded-xl border-2 border-black bg-background p-2.5 shadow-brutal transition-all dark:border-white dark:bg-zinc-950 dark:shadow-brutal-white sm:p-3'>
        {/* Top Header Row */}
        <div className='relative z-20 flex items-center justify-between gap-2 sm:gap-2.5'>
          {/* Brutalist Brand Tag on Desktop */}
          <div className='hidden items-center gap-1.5 rounded-lg border-2 border-black bg-red-600 px-2.5 py-1.5 font-mono text-xs font-black tracking-wider text-white shadow-brutal-sm dark:border-white sm:flex'>
            <span className='size-2 animate-pulse rounded-full bg-white' />
            <span>IDN // 38</span>
          </div>

          {/* Search Input Box */}
          <div className='relative flex-1'>
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
              placeholder='Cari provinsi / ibu kota...'
              className='w-full rounded-lg border-2 border-black bg-background py-1.5 pl-9 pr-9 font-mono text-xs font-bold text-foreground shadow-brutal-sm transition placeholder:font-sans placeholder:font-medium placeholder:text-muted-foreground focus:border-red-600 focus:shadow-brutal-red focus:outline-none dark:border-white dark:shadow-brutal-white-sm dark:focus:border-red-500 sm:py-2 sm:text-sm'
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

            {/* Auto-complete Search Suggestions Dropdown */}
            <AnimatePresence>
              {isOpen && query.trim() && (
                <motion.div
                  id='province-search-results'
                  role='listbox'
                  aria-label='Hasil pencarian provinsi'
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  onWheel={(e) => e.stopPropagation()}
                  className='no-scrollbar absolute inset-x-0 top-full z-50 mt-2 max-h-56 overflow-y-auto overscroll-contain rounded-xl border-2 border-black bg-background p-1.5 text-foreground shadow-brutal-lg dark:border-white dark:bg-zinc-900 dark:shadow-brutal-white-lg sm:max-h-72'
                >
                  {searchResults.length > 0 ? (
                    searchResults.map((prov, index) => {
                      const isHighlighted = selectedIndex === index;
                      return (
                        <motion.button
                          key={prov.id}
                          type='button'
                          role='option'
                          aria-selected={isHighlighted}
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelect(prov.id)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={`group flex w-full items-center justify-between border-b border-dashed border-black/20 px-3 py-2 text-left text-sm transition-colors last:border-b-0 ${
                            isHighlighted
                              ? 'bg-amber-100 dark:bg-zinc-800'
                              : 'hover:bg-red-50 dark:border-white/20 dark:hover:bg-zinc-800'
                          }`}
                        >
                          <div className='flex flex-col'>
                            <span
                              className={`font-bold ${
                                isHighlighted
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-foreground group-hover:text-red-600'
                              }`}
                            >
                              {prov.name}
                            </span>
                            {prov.capital && (
                              <span className='flex items-center gap-1 font-mono text-xs text-muted-foreground'>
                                <MapPin className='size-3 stroke-[2.5] text-red-600' />
                                Ibu Kota: {prov.capital}
                              </span>
                            )}
                          </div>
                          {prov.island && (
                            <span className='rounded border border-black bg-amber-300 px-2 py-0.5 font-mono text-[10px] font-bold text-black shadow-[1px_1px_0px_#000] dark:border-white'>
                              {prov.island}
                            </span>
                          )}
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

          {/* Right Controls */}
          <div className='flex shrink-0 items-center gap-1.5 sm:gap-2'>
            {/* Collapsible Filter Toggle */}
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

            {/* 38 Provinces Counter Tag */}
            <div className='hidden items-center gap-1.5 rounded-lg border-2 border-black bg-background px-2.5 py-1.5 font-mono text-xs font-black text-foreground shadow-brutal-sm dark:border-white dark:bg-zinc-900 md:flex'>
              <Filter className='size-3.5 stroke-[2.5] text-red-600' />
              <span>38 PROV</span>
            </div>

            {/* Theme Toggle Button */}
            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
          </div>
        </div>

        {/* Collapsible Drawer for Thematic Mode & Island Filters */}
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
                {/* Thematic Mode Tabs */}
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

                  {/* Mode Komparasi Toggle Button */}
                  {onToggleCompareMode && (
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

                {/* Island Filter Tabs */}
                <div className='flex flex-wrap items-center gap-1.5 sm:gap-2'>
                  <span className='mr-1 shrink-0 font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground'>
                    [PULAU]:
                  </span>
                  {ISLANDS.map((island) => {
                    const isAll = island === 'Semua';
                    const isActive = isAll ? !selectedIsland : selectedIsland === island;
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
