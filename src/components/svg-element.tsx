import { AnimatePresence, motion } from 'framer-motion';
import { Award, MapPin, Scale, Users } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ChoroplethConfig } from '../interfaces/choropleth';
import { Province } from '../interfaces/province';
import ZoomControls from './zoom-controls';

interface SVGElementProps {
  shapes: Province[];
  selectedIsland?: string | null;
  highlightedId?: string | null;
  comparedIds?: string[];
  isDark?: boolean;
  choroplethConfig?: ChoroplethConfig | null;
  hoveredTier?: number | null;
  onPathClick: (id: string) => void;
}

interface HoveredState {
  province: Province;
  x: number;
  y: number;
}

const clamp = (val: number, min: number, max: number) =>
  Math.min(Math.max(val, min), max);

export default function SVGElement({
  shapes,
  selectedIsland,
  highlightedId,
  comparedIds,
  isDark,
  choroplethConfig,
  hoveredTier,
  onPathClick,
}: SVGElementProps) {
  const [hovered, setHovered] = useState<HoveredState | null>(null);

  // Zoom and Pan States: default 1 (100%), min 0.75 (75%), max 6 (600%)
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Refs for tracking drag coordinates and distinguishing drag from click
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0, startPosX: 0, startPosY: 0 });
  const hasDraggedRef = useRef(false);
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartScaleRef = useRef(1);

  // Calculate pan boundaries based on current scale and container size
  const getPanBounds = useCallback((currentScale: number) => {
    const container = containerRef.current;
    const w = container ? container.clientWidth : 800;
    const h = container ? container.clientHeight : 400;

    if (currentScale <= 1) {
      // Small leeway when at or below 100% zoom (snaps back on release)
      return {
        minX: -w * 0.15,
        maxX: w * 0.15,
        minY: -h * 0.15,
        maxY: h * 0.15,
      };
    }

    // Bounded pan: allow viewing edges plus a comfortable 15% margin
    const limitX = (w * currentScale - w) / 2 + w * 0.15;
    const limitY = (h * currentScale - h) / 2 + h * 0.15;

    return {
      minX: -limitX,
      maxX: limitX,
      minY: -limitY,
      maxY: limitY,
    };
  }, []);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setScale((prev) => {
      if (prev < 1) return 1; // From 75% step back to 100%
      return Math.min(6, Number((prev + 0.5).toFixed(2)));
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => {
      if (prev <= 1) {
        return Math.max(0.75, Number((prev - 0.25).toFixed(2))); // Step down to 75%
      }
      return Math.max(0.75, Number((prev - 0.5).toFixed(2)));
    });
  }, []);

  const handleReset = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Mouse wheel zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.25 : -0.25;
      setScale((prev) => {
        const next = Math.min(6, Math.max(0.75, Number((prev + delta).toFixed(2))));
        if (next <= 1) {
          setPosition({ x: 0, y: 0 });
        }
        return next;
      });
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, []);

  // Keyboard navigation (+, -, 0, r)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        handleZoomOut();
      } else if (e.key === '0' || e.key === 'r' || e.key === 'R') {
        handleReset();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleZoomIn, handleZoomOut, handleReset]);

  // Mouse drag event listeners with bounded pan and elastic resistance
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      setIsDragging(true);
      hasDraggedRef.current = false;
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        startPosX: position.x,
        startPosY: position.y,
      };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;

      if (Math.hypot(dx, dy) > 5) {
        hasDraggedRef.current = true;
        setHovered(null);
      }

      const bounds = getPanBounds(scale);
      let targetX = dragStartRef.current.startPosX + dx;
      let targetY = dragStartRef.current.startPosY + dy;

      // Apply soft elastic resistance if dragged beyond boundaries
      if (targetX < bounds.minX) {
        targetX = bounds.minX + (targetX - bounds.minX) * 0.25;
      } else if (targetX > bounds.maxX) {
        targetX = bounds.maxX + (targetX - bounds.maxX) * 0.25;
      }

      if (targetY < bounds.minY) {
        targetY = bounds.minY + (targetY - bounds.minY) * 0.25;
      } else if (targetY > bounds.maxY) {
        targetY = bounds.maxY + (targetY - bounds.maxY) * 0.25;
      }

      setPosition({ x: targetX, y: targetY });
    };

    const onMouseUp = () => {
      if (!isDragging) return;
      setIsDragging(false);

      // Snap back within boundaries or back to center if scale <= 1
      const bounds = getPanBounds(scale);
      if (scale <= 1) {
        setPosition({ x: 0, y: 0 });
      } else {
        setPosition((prev) => ({
          x: clamp(prev.x, bounds.minX, bounds.maxX),
          y: clamp(prev.y, bounds.minY, bounds.maxY),
        }));
      }
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, position.x, position.y, scale, getPanBounds]);

  // Touch drag and pinch-to-zoom event listeners with bounded pan
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        setIsDragging(true);
        hasDraggedRef.current = false;
        dragStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          startPosX: position.x,
          startPosY: position.y,
        };
      } else if (e.touches.length === 2) {
        setIsDragging(false);
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
        pinchStartDistRef.current = dist;
        pinchStartScaleRef.current = scale;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isDragging) {
        const dx = e.touches[0].clientX - dragStartRef.current.x;
        const dy = e.touches[0].clientY - dragStartRef.current.y;
        if (Math.hypot(dx, dy) > 5) {
          hasDraggedRef.current = true;
          setHovered(null);
        }

        const bounds = getPanBounds(scale);
        let targetX = dragStartRef.current.startPosX + dx;
        let targetY = dragStartRef.current.startPosY + dy;

        // Apply elastic resistance if dragged beyond boundaries
        if (targetX < bounds.minX) {
          targetX = bounds.minX + (targetX - bounds.minX) * 0.25;
        } else if (targetX > bounds.maxX) {
          targetX = bounds.maxX + (targetX - bounds.maxX) * 0.25;
        }

        if (targetY < bounds.minY) {
          targetY = bounds.minY + (targetY - bounds.minY) * 0.25;
        } else if (targetY > bounds.maxY) {
          targetY = bounds.maxY + (targetY - bounds.maxY) * 0.25;
        }

        setPosition({ x: targetX, y: targetY });
      } else if (e.touches.length === 2 && pinchStartDistRef.current) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
        const ratio = dist / pinchStartDistRef.current;
        const next = Math.min(
          6,
          Math.max(0.75, Number((pinchStartScaleRef.current * ratio).toFixed(2))),
        );
        setScale(next);
        if (next <= 1) {
          setPosition({ x: 0, y: 0 });
        }
      }
    };

    const onTouchEnd = () => {
      if (isDragging) {
        setIsDragging(false);
        const bounds = getPanBounds(scale);
        if (scale <= 1) {
          setPosition({ x: 0, y: 0 });
        } else {
          setPosition((prev) => ({
            x: clamp(prev.x, bounds.minX, bounds.maxX),
            y: clamp(prev.y, bounds.minY, bounds.maxY),
          }));
        }
      }
      pinchStartDistRef.current = null;
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, scale, position.x, position.y, getPanBounds]);

  // Tooltip position boundary with viewport clamping
  const tooltipX = hovered
    ? Math.max(
        12,
        Math.min(
          hovered.x + 16,
          typeof window !== 'undefined' ? window.innerWidth - 240 : 0,
        ),
      )
    : 0;
  const tooltipY = hovered
    ? Math.max(
        12,
        Math.min(
          hovered.y + 16,
          typeof window !== 'undefined' ? window.innerHeight - 200 : 0,
        ),
      )
    : 0;

  const hoveredChoroData =
    hovered && choroplethConfig
      ? choroplethConfig.provincesData[hovered.province.id]
      : null;

  return (
    <div
      ref={containerRef}
      onMouseLeave={() => setHovered(null)}
      className={`relative size-full select-none overflow-hidden ${
        isDragging ? 'cursor-grabbing' : scale > 1 ? 'cursor-grab' : 'cursor-default'
      }`}
    >
      {/* Zoomable & Pannable Transform Container with Bounded Clamping */}
      <div
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.25s ease-out',
        }}
        className='flex size-full items-center justify-center will-change-transform'
      >
        <svg viewBox='0 0 800 350' className='size-full'>
          {shapes.map((shape, index) => {
            const { id, name, d, island } = shape;
            const isMatchIsland = !selectedIsland || island === selectedIsland;
            const isHighlighted = highlightedId === id;

            let fill = '#ef4444';
            let stroke = '#ffffff';
            let strokeWidth = '0.5';
            let opacity = 1;

            const isHovered = hovered?.province.id === id;
            const compareIndex = comparedIds ? comparedIds.indexOf(id) : -1;
            const isCompared = compareIndex !== -1;
            const compareColors = ['#2563eb', '#f59e0b', '#10b981'];

            if (choroplethConfig) {
              const choroData = choroplethConfig.provincesData[id];
              const tierColor = isDark ? choroData?.fillDark : choroData?.fillLight;
              const themeBorderColor =
                choroplethConfig.id === 'population'
                  ? isDark
                    ? '#93c5fd'
                    : '#1d4ed8'
                  : choroplethConfig.id === 'density'
                    ? isDark
                      ? '#fdba74'
                      : '#c2410c'
                    : isDark
                      ? '#6ee7b7'
                      : '#047857';

              if (isCompared) {
                // When in comparison list: highlight with distinctive numbered color outline
                fill = tierColor || '#94a3b8';
                stroke = compareColors[compareIndex % compareColors.length];
                strokeWidth = '3';
                opacity = 1;
              } else if (isHighlighted) {
                // When clicked/selected: preserve authentic tier data color, highlight with bold brutalist border
                fill = tierColor || '#94a3b8';
                stroke = isDark ? '#ffffff' : '#000000';
                strokeWidth = '2.5';
                opacity = 1;
              } else if (!isMatchIsland) {
                fill = isDark ? '#27272a' : '#d4d4d8';
                stroke = isDark ? '#3f3f46' : '#a1a1aa';
                strokeWidth = '0.5';
                opacity = 0.25;
              } else if (isHovered) {
                // When hovered: pop with stark contrast fill and theme border
                fill = isDark ? '#ffffff' : '#fef08a';
                stroke = themeBorderColor;
                strokeWidth = '2';
                opacity = 1;
              } else if (hoveredTier !== null && choroData) {
                fill = tierColor || '#94a3b8';
                if (hoveredTier === choroData.tier) {
                  stroke = isDark ? '#ffffff' : '#000000';
                  strokeWidth = '1.5';
                  opacity = 1;
                } else {
                  stroke = isDark ? '#18181b' : '#000000';
                  strokeWidth = '0.5';
                  opacity = 0.25;
                }
              } else {
                fill = tierColor || '#94a3b8';
                stroke = isDark ? '#000000' : '#000000';
                strokeWidth = '0.75';
                opacity = 1;
              }
            } else {
              // Standard map mode: iconic Indonesian red preserved!
              if (isCompared) {
                fill = '#ef4444';
                stroke = compareColors[compareIndex % compareColors.length];
                strokeWidth = '3';
                opacity = 1;
              } else if (isHighlighted) {
                // When clicked: bold red with crisp high-contrast border
                fill = '#dc2626';
                stroke = isDark ? '#ffffff' : '#000000';
                strokeWidth = '2.5';
                opacity = 1;
              } else if (!isMatchIsland) {
                fill = isDark ? '#27272a' : '#d4d4d8';
                stroke = isDark ? '#3f3f46' : '#a1a1aa';
                strokeWidth = '0.5';
                opacity = 0.25;
              } else if (isHovered) {
                // Hovered: pop with electric yellow/white and bold black stroke
                fill = isDark ? '#fef08a' : '#fef08a';
                stroke = '#000000';
                strokeWidth = '2';
                opacity = 1;
              } else {
                fill = '#ef4444';
                stroke = isDark ? '#ffffff' : '#000000';
                strokeWidth = '0.75';
                opacity = 1;
              }
            }

            return (
              <motion.path
                key={id}
                id={id}
                d={d}
                strokeWidth={strokeWidth}
                aria-label={name}
                role='button'
                onClick={() => {
                  if (hasDraggedRef.current) return;
                  setHovered(null);
                  onPathClick(id);
                }}
                onMouseEnter={(e) => {
                  if (isDragging) return;
                  setHovered({
                    province: shape,
                    x: e.clientX,
                    y: e.clientY,
                  });
                }}
                onMouseMove={(e) => {
                  if (isDragging) return;
                  setHovered((prev) =>
                    prev
                      ? { ...prev, x: e.clientX, y: e.clientY }
                      : { province: shape, x: e.clientX, y: e.clientY },
                  );
                }}
                onMouseLeave={() => {
                  setHovered(null);
                }}
                className='cursor-pointer outline-none transition-colors duration-150 focus:outline-none focus-visible:outline-none'
                initial={{ opacity: 0, pathLength: 0, fill, stroke }}
                animate={{ opacity, pathLength: 1, fill, stroke }}
                transition={{
                  delay: index * 0.012,
                  duration: 0.3,
                }}
              />
            );
          })}
        </svg>
      </div>

      {/* Floating Zoom Controls Dock */}
      <ZoomControls
        scale={scale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
      />

      {/* Floating Hover Tooltip (Neobrutalist Data Card) */}
      <AnimatePresence>
        {hovered && !isDragging && (
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
                  <MapPin className='size-3 stroke-[2.5] text-red-600' />
                  <span>
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
                    <Users className='size-3 stroke-[2.5] text-blue-600' />
                    <span>
                      POP:{' '}
                      <strong className='font-bold text-foreground'>
                        {new Intl.NumberFormat('id-ID').format(
                          hovered.province.population,
                        )}
                      </strong>
                    </span>
                  </div>
                )}
            </div>

            {/* Compare Status in Tooltip */}
            {hovered && comparedIds && comparedIds.includes(hovered.province.id) && (
              <div className='mt-2 flex items-center justify-between rounded border-2 border-black bg-cyan-400 p-1.5 font-mono text-xs font-black text-black shadow-brutal-sm dark:border-white'>
                <span className='flex items-center gap-1.5'>
                  <Scale className='size-3 stroke-[2.5]' />
                  <span>KOMPARASI #{comparedIds.indexOf(hovered.province.id) + 1}</span>
                </span>
                <span className='rounded border border-black bg-black px-1 text-[9px] text-white'>
                  TERPILIH
                </span>
              </div>
            )}

            <div className='mt-2 border-t border-dashed border-black/30 pt-1.5 font-mono text-[10px] font-bold text-red-600 dark:border-white/30 dark:text-red-400'>
              [KLIK UNTUK PROFIL LENGKAP →]
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
