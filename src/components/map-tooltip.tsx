import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Award, MapPin, Scale, Users } from 'lucide-react';

import { ChoroplethConfig } from '../interfaces/choropleth';
import { Province } from '../interfaces/province';

export interface HoveredProvinceState {
  province: Province;
  x: number;
  y: number;
}

interface MapTooltipProps {
  hovered: HoveredProvinceState | null;
  isDragging: boolean;
  isDark?: boolean;
  choroplethConfig?: ChoroplethConfig | null;
  comparedIds?: string[];
}

export default function MapTooltip({
  hovered,
  isDragging,
  isDark,
  choroplethConfig,
  comparedIds,
}: MapTooltipProps) {
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
    ? choroplethConfig.provincesData[hovered.province.id]
    : null;

  const compareIndex = comparedIds ? comparedIds.indexOf(hovered.province.id) : -1;
  const isCompared = compareIndex !== -1;

  return (
    <AnimatePresence>
      <motion.div
        key={hovered.province.id}
        initial={{ opacity: 0, scale: 0.9, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 8 }}
        transition={{ type: 'spring', stiffness: 450, damping: 28 }}
        style={{ left: tooltipX, top: tooltipY }}
        className='pointer-events-none fixed z-50 min-w-48 max-w-[calc(100vw-24px)] rounded-xl border-2 border-black bg-background p-3 shadow-brutal-lg dark:border-white dark:bg-zinc-950 dark:shadow-brutal-white-lg'
      >
        {/* Header: Name and Island badge */}
        <div className='flex items-center justify-between gap-2 border-b-2 border-black pb-2 dark:border-white'>
          <span className='font-mono text-sm font-black uppercase text-foreground'>
            {hovered.province.name}
          </span>
          {hovered.province.island && (
            <span className='rounded border border-black bg-amber-300 px-1.5 py-0.5 font-mono text-[10px] font-black text-black shadow-[1px_1px_0px_#000]'>
              {hovered.province.island}
            </span>
          )}
        </div>

        {/* Thematic Choropleth Metrics Highlight */}
        {choroplethConfig && hoveredChoroData ? (
          <div className='mt-2 space-y-1.5 rounded-lg border-2 border-black bg-card p-2 text-xs shadow-brutal-sm dark:border-white dark:bg-zinc-900'>
            <div className='flex items-center justify-between font-mono'>
              <span className='font-bold uppercase text-foreground'>
                [{choroplethConfig.shortName}]:
              </span>
              <span className='font-black text-foreground'>
                {hoveredChoroData.formattedValue}
              </span>
            </div>

            <div className='flex items-center justify-between font-mono text-[11px] text-muted-foreground'>
              <span className='flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400'>
                <Award className='size-3 stroke-[2.5]' />
                RANK #{hoveredChoroData.rank}/38
              </span>
              {hoveredChoroData.percentOfTotal > 0 && (
                <span className='font-bold text-foreground'>
                  {hoveredChoroData.percentOfTotal}% NAT
                </span>
              )}
            </div>

            <div className='flex items-center justify-between border-t border-dashed border-black/30 pt-1 font-mono text-[10px] text-muted-foreground dark:border-white/30'>
              <div className='flex items-center gap-1.5'>
                <span
                  style={{
                    backgroundColor: isDark
                      ? hoveredChoroData.fillDark
                      : hoveredChoroData.fillLight,
                  }}
                  className='size-2.5 border border-black shadow-[1px_1px_0px_#000]'
                />
                <span>
                  TK {hoveredChoroData.tier}/5 (
                  {choroplethConfig.tiers[hoveredChoroData.tier - 1]?.label})
                </span>
              </div>
              <span className='text-[9px] font-bold'>BPS RI</span>
            </div>
          </div>
        ) : null}

        {/* Standard Details */}
        <div className='mt-2 space-y-1 font-mono text-xs text-muted-foreground'>
          {hovered.province.capital && (
            <div className='flex items-center gap-1.5'>
              <MapPin className='size-3 shrink-0 stroke-[2.5] text-red-600' />
              <span className='leading-none'>
                IBU KOTA:{' '}
                <strong className='font-bold text-foreground'>
                  {hovered.province.capital}
                </strong>
              </span>
            </div>
          )}
          {(!choroplethConfig || choroplethConfig.id !== 'population') &&
            hovered.province.population && (
              <div className='flex items-center gap-1.5'>
                <Users className='size-3 shrink-0 stroke-[2.5] text-blue-600' />
                <span className='leading-none'>
                  POP:{' '}
                  <strong className='font-bold text-foreground'>
                    {new Intl.NumberFormat('id-ID').format(hovered.province.population)}
                  </strong>
                </span>
              </div>
            )}
        </div>

        {/* Compare Status in Tooltip */}
        {isCompared && (
          <div className='mt-2 flex items-center justify-between rounded border-2 border-black bg-cyan-400 p-1.5 font-mono text-xs font-black text-black shadow-brutal-sm dark:border-white'>
            <span className='flex items-center gap-1.5'>
              <Scale className='size-3 shrink-0 stroke-[2.5]' />
              <span className='leading-none'>KOMPARASI #{compareIndex + 1}</span>
            </span>
            <span className='rounded border border-black bg-black px-1 text-[9px] text-white'>
              TERPILIH
            </span>
          </div>
        )}

        <div className='mt-2 flex items-center justify-between border-t border-dashed border-black/30 pt-1.5 font-mono text-[10px] font-bold text-red-600 dark:border-white/30 dark:text-red-400'>
          <span className='leading-none'>[KLIK UNTUK PROFIL LENGKAP]</span>
          <ArrowRight className='-mt-0.5 size-3 shrink-0 stroke-[2.5]' />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
