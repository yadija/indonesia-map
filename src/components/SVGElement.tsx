import { AnimatePresence, motion } from 'framer-motion';
import { MapPin, Users } from 'lucide-react';
import { useState } from 'react';

import { IProvince } from '../interfaces/IProvince';

interface SVGElementProps {
  shapes: IProvince[];
  onPathClick: (id: string) => void;
}

interface HoveredState {
  province: IProvince;
  x: number;
  y: number;
}

export default function SVGElement({ shapes, onPathClick }: SVGElementProps) {
  const [hovered, setHovered] = useState<HoveredState | null>(null);

  const tooltipX = hovered
    ? Math.min(
        hovered.x + 16,
        typeof window !== 'undefined' ? window.innerWidth - 220 : 0,
      )
    : 0;
  const tooltipY = hovered
    ? Math.min(
        hovered.y + 16,
        typeof window !== 'undefined' ? window.innerHeight - 130 : 0,
      )
    : 0;

  return (
    <div className='relative size-full' onMouseLeave={() => setHovered(null)}>
      <svg viewBox='0 0 800 350' className='size-full'>
        {shapes.map((shape, index) => {
          const { id, name, d } = shape;
          return (
            <motion.path
              key={id}
              id={id}
              d={d}
              strokeWidth='.5'
              aria-label={name}
              role='button'
              onClick={() => {
                setHovered(null);
                onPathClick(id);
              }}
              onMouseEnter={(e) => {
                setHovered({
                  province: shape,
                  x: e.clientX,
                  y: e.clientY,
                });
              }}
              onMouseMove={(e) => {
                setHovered((prev) =>
                  prev
                    ? { ...prev, x: e.clientX, y: e.clientY }
                    : { province: shape, x: e.clientX, y: e.clientY },
                );
              }}
              onMouseLeave={() => {
                setHovered(null);
              }}
              className='cursor-pointer outline-none transition hover:fill-white hover:stroke-[#f00] focus:outline-none focus-visible:outline-none'
              initial={{ opacity: 0, pathLength: 0, fill: '#f00', stroke: '#fff' }}
              animate={{ opacity: 1, pathLength: 1 }}
              transition={{
                delay: index * 0.03,
                duration: 0.4,
                type: 'spring',
                stiffness: 300,
              }}
            />
          );
        })}
      </svg>

      {/* Floating Hover Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            key={hovered.province.id}
            initial={{ opacity: 0, scale: 0.92, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 4 }}
            transition={{ duration: 0.12 }}
            style={{ left: tooltipX, top: tooltipY }}
            className='pointer-events-none fixed z-50 min-w-44 rounded-lg border border-border/80 bg-background/95 p-2.5 shadow-xl backdrop-blur-md'
          >
            <div className='flex items-center justify-between gap-2 border-b border-border/60 pb-1.5'>
              <span className='text-sm font-bold text-foreground'>
                {hovered.province.name}
              </span>
              {hovered.province.island && (
                <span className='rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-950/80 dark:text-red-300'>
                  {hovered.province.island}
                </span>
              )}
            </div>

            <div className='mt-2 space-y-1 text-xs text-muted-foreground'>
              {hovered.province.capital && (
                <div className='flex items-center gap-1.5'>
                  <MapPin className='size-3 text-red-500' />
                  <span>
                    Ibu Kota:{' '}
                    <strong className='text-foreground'>
                      {hovered.province.capital}
                    </strong>
                  </span>
                </div>
              )}
              {hovered.province.population && (
                <div className='flex items-center gap-1.5'>
                  <Users className='size-3 text-blue-500' />
                  <span>
                    Populasi:{' '}
                    {new Intl.NumberFormat('id-ID').format(hovered.province.population)}
                  </span>
                </div>
              )}
            </div>

            <div className='mt-2 text-[10px] italic text-muted-foreground/75'>
              Klik untuk melihat detail →
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
