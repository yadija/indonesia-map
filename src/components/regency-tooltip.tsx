import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, MapPin, Maximize2, Users } from 'lucide-react';

import { ChoroplethConfig } from '../interfaces/choropleth';
import { Regency } from '../interfaces/regency';
import { formatNumber } from '../utils/choropleth';

export interface HoveredRegencyState {
  regency: Regency;
  x: number;
  y: number;
}

interface RegencyTooltipProps {
  hovered: HoveredRegencyState | null;
  isDragging: boolean;
  isDark?: boolean;
  choroplethConfig?: ChoroplethConfig | null;
}

export default function RegencyTooltip({
  hovered,
  isDragging,
  isDark,
  choroplethConfig,
}: RegencyTooltipProps) {
  if (!hovered || isDragging) return null;

  const tooltipX = Math.max(
    12,
    Math.min(hovered.x + 16, typeof window !== 'undefined' ? window.innerWidth - 240 : 0),
  );

  const tooltipY = Math.max(
    12,
    Math.min(
      hovered.y + 16,
      typeof window !== 'undefined' ? window.innerHeight - 200 : 0,
    ),
  );

  const hoveredChoroData = choroplethConfig
    ? choroplethConfig.provincesData[hovered.regency.id]
    : null;

  return (
    <AnimatePresence>
      <motion.div
        key={hovered.regency.id}
        initial={{ opacity: 0, scale: 0.9, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 8 }}
        transition={{ type: 'spring', stiffness: 450, damping: 28 }}
        style={{ left: tooltipX, top: tooltipY }}
        className='pointer-events-none fixed z-50 min-w-48 max-w-[calc(100vw-24px)] rounded-xl border-2 border-black bg-background p-3 shadow-brutal-lg dark:border-white dark:bg-zinc-950 dark:shadow-brutal-white-lg'
      >
        {/* Regency Type Badge & Title */}
        <div className='flex items-center gap-1.5'>
          <span
            className={`rounded border border-black px-1.5 py-0.5 font-mono text-[9px] font-black uppercase shadow-brutal-sm dark:border-white ${
              hovered.regency.type === 'Kota'
                ? 'bg-cyan-300 text-black'
                : 'bg-emerald-300 text-black'
            }`}
          >
            {hovered.regency.type}
          </span>
          <span className='font-mono text-[10px] font-bold text-muted-foreground'>
            KODE {hovered.regency.id}
          </span>
        </div>

        <div className='mt-1 font-mono text-sm font-black uppercase tracking-tight text-foreground'>
          {hovered.regency.name}
        </div>

        {/* Capital */}
        {hovered.regency.capital && (
          <div className='mt-1 flex items-center gap-1 text-[11px] text-muted-foreground'>
            <MapPin className='size-3 shrink-0 stroke-[2.5] text-red-500' />
            <span className='font-mono'>Ibu Kota: {hovered.regency.capital}</span>
          </div>
        )}

        {/* Choropleth Active Banner */}
        {hoveredChoroData && (
          <div className='mt-2 flex items-center justify-between gap-2 rounded-lg border border-black bg-muted/60 px-2 py-1 dark:border-white/50'>
            <span className='font-mono text-[10px] font-bold text-muted-foreground'>
              {choroplethConfig?.name}
            </span>
            <span
              className='font-mono text-xs font-black'
              style={{
                color: isDark ? hoveredChoroData.fillDark : hoveredChoroData.fillLight,
              }}
            >
              {hoveredChoroData.formattedValue}
            </span>
          </div>
        )}

        {/* Demographics Summary */}
        <div className='mt-2 grid grid-cols-2 gap-1.5 border-t border-black/10 pt-2 font-mono text-[10px] dark:border-white/10'>
          {hovered.regency.population && (
            <div className='flex items-center gap-1 text-muted-foreground'>
              <Users className='size-3 shrink-0 stroke-[2]' />
              <span>{formatNumber(hovered.regency.population)} Jiwa</span>
            </div>
          )}
          {hovered.regency.areaKm2 && (
            <div className='flex items-center gap-1 text-muted-foreground'>
              <Maximize2 className='size-3 shrink-0 stroke-[2]' />
              <span>{formatNumber(Math.round(hovered.regency.areaKm2))} km²</span>
            </div>
          )}
        </div>

        <div className='mt-2 flex items-center justify-end gap-1 font-mono text-[9px] font-bold text-muted-foreground'>
          <span>Klik untuk detail lengkap</span>
          <ArrowRight className='size-2.5' />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
