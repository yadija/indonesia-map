import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  Building2,
  ChevronDown,
  ChevronUp,
  Maximize2,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useState } from 'react';

import { ChoroplethConfig } from '../interfaces/choropleth';
import { formatNumber } from '../utils/choropleth';

interface ChoroplethLegendProps {
  config: ChoroplethConfig | null;
  isDark: boolean;
  hoveredTier: number | null;
  onHoverTier: (tier: number | null) => void;
}

export default function ChoroplethLegend({
  config,
  isDark,
  hoveredTier,
  onHoverTier,
}: ChoroplethLegendProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!config) return null;

  const MetricIcon = () => {
    switch (config.id) {
      case 'population':
        return <Users className='size-4 text-blue-500' />;
      case 'density':
        return <Building2 className='size-4 text-orange-500' />;
      case 'area':
        return <Maximize2 className='size-4 text-emerald-500' />;
      default:
        return <BarChart3 className='size-4 text-red-500' />;
    }
  };

  return (
    <motion.aside
      aria-label='Legenda Peta Tematik'
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={`fixed bottom-5 left-5 z-40 w-72 max-w-[calc(100vw-2.5rem)] rounded-xl border-2 border-black bg-background shadow-brutal transition-all dark:border-white dark:bg-zinc-950 dark:shadow-brutal-white ${
        isCollapsed ? 'p-2.5' : 'p-3.5'
      }`}
    >
      {/* Header Bar */}
      <div
        className={`flex items-center justify-between gap-2 transition-all ${
          isCollapsed ? 'pb-0' : 'border-b-2 border-black pb-2.5 dark:border-white'
        }`}
      >
        <div className='flex items-center gap-2 overflow-hidden'>
          <div className='flex size-7 shrink-0 items-center justify-center rounded border-2 border-black bg-card shadow-[1px_1px_0px_#000] dark:border-white dark:bg-zinc-900'>
            <MetricIcon />
          </div>
          <div className='truncate'>
            <h2 className='font-mono text-xs font-black uppercase leading-tight text-foreground'>
              {config.name}
            </h2>
            <span className='font-mono text-[10px] font-bold text-muted-foreground'>
              SATUAN: [{config.unit}]
            </span>
          </div>
        </div>

        <motion.button
          type='button'
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsCollapsed((prev) => !prev)}
          className='flex size-6 shrink-0 items-center justify-center rounded border-2 border-black bg-background text-foreground shadow-[1px_1px_0px_#000] transition hover:bg-muted dark:border-white'
          aria-label={isCollapsed ? 'Buka legenda' : 'Ciutkan legenda'}
        >
          {isCollapsed ? (
            <ChevronUp className='size-3.5 stroke-[2.5]' />
          ) : (
            <ChevronDown className='size-3.5 stroke-[2.5]' />
          )}
        </motion.button>
      </div>

      {/* Collapsible Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className='overflow-hidden'
          >
            <p className='mt-2 font-mono text-[11px] leading-relaxed text-muted-foreground'>
              {config.description}. Sorot tingkatan untuk melihat provinsi terkait.
            </p>

            {/* 5 Tiers List */}
            <div className='mt-3 space-y-1.5'>
              {config.tiers.map((t) => {
                const color = isDark ? t.colorDark : t.colorLight;
                const isHovered = hoveredTier === t.tier;
                const isOtherHovered = hoveredTier !== null && !isHovered;

                return (
                  <motion.div
                    key={t.tier}
                    whileHover={{ x: 4 }}
                    onMouseEnter={() => onHoverTier(t.tier)}
                    onMouseLeave={() => onHoverTier(null)}
                    className={`flex cursor-pointer items-center justify-between rounded border-2 border-black px-2 py-1 text-xs transition dark:border-white ${
                      isHovered
                        ? 'bg-amber-300 font-bold text-black shadow-brutal-sm dark:bg-amber-300 dark:text-black'
                        : isOtherHovered
                          ? 'opacity-40 hover:opacity-100 dark:bg-zinc-900'
                          : 'bg-card text-foreground shadow-[1px_1px_0px_#000] hover:bg-muted dark:bg-zinc-900 dark:shadow-[1px_1px_0px_#fff]'
                    }`}
                  >
                    <div className='flex items-center gap-2'>
                      <span
                        style={{ backgroundColor: color }}
                        className='size-3 shrink-0 border border-black shadow-[1px_1px_0px_#000]'
                      />
                      <span className='font-mono text-[11px] font-bold'>{t.label}</span>
                    </div>

                    <span className='rounded border border-black bg-background px-1.5 py-0.5 font-mono text-[10px] font-black dark:border-white'>
                      {t.count} PROV
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* Min and Max National Highlights */}
            <div className='mt-3 space-y-1.5 border-t-2 border-black pt-2.5 text-[11px] dark:border-white'>
              <div className='flex items-center justify-between font-mono text-muted-foreground'>
                <span className='flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400'>
                  <TrendingUp className='size-3 stroke-[2.5]' /> MAX:
                </span>
                <span
                  className='truncate font-bold text-foreground'
                  title={config.maxProvince.name}
                >
                  {config.maxProvince.name} ({formatNumber(config.maxProvince.value)})
                </span>
              </div>

              <div className='flex items-center justify-between font-mono text-muted-foreground'>
                <span className='flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400'>
                  <TrendingDown className='size-3 stroke-[2.5]' /> MIN:
                </span>
                <span
                  className='truncate font-bold text-foreground'
                  title={config.minProvince.name}
                >
                  {config.minProvince.name} ({formatNumber(config.minProvince.value)})
                </span>
              </div>
            </div>

            {/* Official Data Source Attribution */}
            <div className='mt-2.5 border-t border-dashed border-black/40 pt-2 font-mono text-[9px] text-muted-foreground dark:border-white/40'>
              <span className='font-bold text-foreground'>[SUMBER]:</span> {config.source}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}
