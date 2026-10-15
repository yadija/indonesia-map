import { AnimatePresence, motion } from 'framer-motion';
import {
  Building2,
  ChevronDown,
  ChevronUp,
  Filter,
  Map,
  MapPin,
  Maximize2,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { ChoroplethMetric } from '../interfaces/IChoropleth';
import { IProvince } from '../interfaces/IProvince';
import ThemeToggle from './ThemeToggle';

interface SearchBarFilterProps {
  provinces: IProvince[];
  selectedIsland: string | null;
  activeMetric: ChoroplethMetric;
  isDark: boolean;
  onToggleTheme: () => void;
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
  onToggleTheme,
  onSelectMetric,
  onSelectIsland,
  onSelectProvince,
}: SearchBarFilterProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
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
  };

  const hasActiveFilters = activeMetric !== 'none' || selectedIsland !== null;

  return (
    <div
      ref={containerRef}
      className='fixed inset-x-0 top-4 z-40 mx-auto w-full max-w-4xl px-4'
    >
      <div className='rounded-2xl border border-border/70 bg-background/90 p-3 shadow-lg backdrop-blur-md transition-all'>
        {/* Top Header Row - relative z-20 to stay above collapsible drawer */}
        <div className='relative z-20 flex items-center justify-between gap-2.5'>
          {/* Search Input Box */}
          <div className='relative flex-1'>
            <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground'>
              <Search className='size-4' />
            </div>

            <input
              type='text'
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => {
                if (query.trim()) setIsOpen(true);
              }}
              placeholder='Cari provinsi atau ibu kota (misal: Surabaya, Bandung)...'
              className='w-full rounded-lg border border-border/80 bg-background py-2 pl-9 pr-9 text-sm text-foreground shadow-sm transition placeholder:text-muted-foreground focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500'
            />

            {query && (
              <button
                type='button'
                onClick={() => {
                  setQuery('');
                  setIsOpen(false);
                }}
                className='absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground transition hover:text-foreground'
                aria-label='Hapus pencarian'
              >
                <X className='size-4' />
              </button>
            )}

            {/* Auto-complete Search Suggestions Dropdown - z-50 above everything */}
            <AnimatePresence>
              {isOpen && query.trim() && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  onWheel={(e) => e.stopPropagation()}
                  className='no-scrollbar absolute inset-x-0 top-full z-50 mt-2 max-h-64 overflow-y-auto rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-2xl backdrop-blur-md'
                >
                  {searchResults.length > 0 ? (
                    searchResults.map((prov) => (
                      <button
                        key={prov.id}
                        type='button'
                        onClick={() => handleSelect(prov.id)}
                        className='flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-accent hover:text-accent-foreground'
                      >
                        <div className='flex flex-col'>
                          <span className='font-semibold text-foreground'>
                            {prov.name}
                          </span>
                          {prov.capital && (
                            <span className='flex items-center gap-1 text-xs text-muted-foreground'>
                              <MapPin className='size-3 text-red-500' />
                              Ibu Kota: {prov.capital}
                            </span>
                          )}
                        </div>
                        {prov.island && (
                          <span className='rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground'>
                            {prov.island}
                          </span>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className='py-6 text-center text-sm text-muted-foreground'>
                      Tidak ada provinsi atau ibu kota yang cocok dengan &quot;
                      <span className='font-semibold text-foreground'>{query}</span>
                      &quot;
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Controls: Collapsible Options Toggle, Title Badge & Dark Mode */}
          <div className='flex shrink-0 items-center gap-2'>
            {/* Collapsible Toggle for Mode and Island Filters */}
            <button
              type='button'
              onClick={() => setIsOptionsOpen((prev) => !prev)}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-semibold transition ${
                isOptionsOpen || hasActiveFilters
                  ? 'border-red-500/40 bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                  : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
              aria-label={
                isOptionsOpen
                  ? 'Sembunyikan filter dan mode'
                  : 'Tampilkan filter dan mode'
              }
            >
              <SlidersHorizontal className='size-3.5' />
              <span className='hidden sm:inline'>
                {hasActiveFilters ? 'Filter Aktif' : 'Mode & Filter'}
              </span>
              {isOptionsOpen ? (
                <ChevronUp className='size-3.5' />
              ) : (
                <ChevronDown className='size-3.5' />
              )}
            </button>

            {/* 38 Provinces Badge */}
            <div className='hidden items-center gap-1.5 rounded-lg border bg-muted/40 px-3 py-2 text-xs font-semibold text-foreground md:flex'>
              <Filter className='size-3.5 text-red-500' />
              <span>38 Provinsi</span>
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
              transition={{ duration: 0.2 }}
              className='relative z-10 overflow-hidden'
            >
              <div className='mt-3 space-y-2.5 border-t border-border/50 pt-2.5'>
                {/* Thematic Map Mode Tabs - Flex wrap, no horizontal scroll needed */}
                <div className='flex flex-wrap items-center gap-1.5'>
                  <span className='mr-1 shrink-0 text-[11px] font-semibold text-muted-foreground'>
                    Mode:
                  </span>
                  {METRIC_TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeMetric === tab.id;
                    const activeColor =
                      tab.id === 'none'
                        ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                        : tab.id === 'population'
                          ? 'bg-blue-600 text-white'
                          : tab.id === 'density'
                            ? 'bg-orange-600 text-white'
                            : 'bg-emerald-600 text-white';

                    return (
                      <button
                        key={tab.id}
                        type='button'
                        onClick={() => onSelectMetric(tab.id)}
                        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition ${
                          isActive
                            ? `${activeColor} shadow-sm`
                            : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <Icon className='size-3' />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Island Filter Tabs (Pills) - Flex wrap, no horizontal scroll needed */}
                <div className='flex flex-wrap items-center gap-1.5'>
                  <span className='mr-1 shrink-0 text-[11px] font-semibold text-muted-foreground'>
                    Pulau:
                  </span>
                  {ISLANDS.map((island) => {
                    const isAll = island === 'Semua';
                    const isActive = isAll ? !selectedIsland : selectedIsland === island;
                    const count = islandCounts[island] || 0;

                    return (
                      <button
                        key={island}
                        type='button'
                        onClick={() => onSelectIsland(isAll ? null : island)}
                        className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                          isActive
                            ? 'bg-red-600 text-white shadow-sm hover:bg-red-700'
                            : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        {island} <span className='opacity-75'>({count})</span>
                      </button>
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
