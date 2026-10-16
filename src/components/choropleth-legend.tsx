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
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className={`fixed bottom-5 left-5 z-40 w-72 max-w-[calc(100vw-2.5rem)] rounded-2xl border border-border/80 bg-background/95 shadow-2xl backdrop-blur-md transition-all ${
        isCollapsed ? 'p-3' : 'p-3.5'
      }`}
    >
      {/* Header Bar - Border is completely removed when collapsed */}
      <div
        className={`flex items-center justify-between gap-2 transition-all ${
          isCollapsed ? 'pb-0' : 'border-b border-border/60 pb-2.5'
        }`}
      >
        <div className='flex items-center gap-2 overflow-hidden'>
          <MetricIcon />
          <div className='truncate'>
            <h2 className='text-xs font-bold leading-tight text-foreground'>
              {config.name}
            </h2>
            <span className='text-[10px] text-muted-foreground'>
              Satuan: {config.unit}
            </span>
          </div>
        </div>

        <button
          type='button'
          onClick={() => setIsCollapsed((prev) => !prev)}
          className='flex size-6 shrink-0 items-center justify-center rounded-md border border-border/70 text-muted-foreground transition hover:bg-muted hover:text-foreground'
          aria-label={isCollapsed ? 'Buka legenda' : 'Ciutkan legenda'}
        >
          {isCollapsed ? (
            <ChevronUp className='size-3.5' />
          ) : (
            <ChevronDown className='size-3.5' />
          )}
        </button>
      </div>

      {/* Collapsible Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='overflow-hidden'
          >
            <p className='mt-2 text-[11px] leading-relaxed text-muted-foreground'>
              {config.description}. Sorot tingkatan untuk melihat provinsi terkait.
            </p>

            {/* 5 Tiers List */}
            <div className='mt-3 space-y-1.5'>
              {config.tiers.map((t) => {
                const color = isDark ? t.colorDark : t.colorLight;
                const isHovered = hoveredTier === t.tier;
                const isOtherHovered = hoveredTier !== null && !isHovered;

                return (
                  <div
                    key={t.tier}
                    onMouseEnter={() => onHoverTier(t.tier)}
                    onMouseLeave={() => onHoverTier(null)}
                    className={`flex cursor-pointer items-center justify-between rounded-lg px-2 py-1 text-xs transition ${
                      isHovered
                        ? 'bg-accent/80 font-semibold shadow-sm ring-1 ring-border'
                        : isOtherHovered
                          ? 'opacity-40 hover:opacity-100'
                          : 'hover:bg-muted/60'
                    }`}
                  >
                    <div className='flex items-center gap-2'>
                      <span
                        style={{ backgroundColor: color }}
                        className='size-3.5 shrink-0 rounded border border-black/15 shadow-sm'
                      />
                      <span className='text-[11px] text-foreground'>{t.label}</span>
                    </div>

                    <span className='rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground'>
                      {t.count} prov
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Min and Max National Highlights */}
            <div className='mt-3 space-y-1.5 border-t border-border/60 pt-2.5 text-[11px]'>
              <div className='flex items-center justify-between text-muted-foreground'>
                <span className='flex items-center gap-1 text-emerald-600 dark:text-emerald-400'>
                  <TrendingUp className='size-3' /> Tertinggi:
                </span>
                <span
                  className='truncate font-medium text-foreground'
                  title={config.maxProvince.name}
                >
                  {config.maxProvince.name} ({formatNumber(config.maxProvince.value)})
                </span>
              </div>

              <div className='flex items-center justify-between text-muted-foreground'>
                <span className='flex items-center gap-1 text-amber-600 dark:text-amber-400'>
                  <TrendingDown className='size-3' /> Terendah:
                </span>
                <span
                  className='truncate font-medium text-foreground'
                  title={config.minProvince.name}
                >
                  {config.minProvince.name} ({formatNumber(config.minProvince.value)})
                </span>
              </div>
            </div>

            {/* Official Data Source Attribution */}
            <div className='mt-3 border-t border-border/60 pt-2 text-[10px] text-muted-foreground'>
              <span className='font-semibold text-foreground/80'>Sumber Data:</span>{' '}
              {config.source}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}
