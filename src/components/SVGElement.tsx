import { AnimatePresence, motion } from 'framer-motion';
import { Award, MapPin, Users } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { IChoroplethConfig } from '../interfaces/IChoropleth';
import { IProvince } from '../interfaces/IProvince';
import ZoomControls from './ZoomControls';

interface SVGElementProps {
  shapes: IProvince[];
  selectedIsland?: string | null;
  highlightedId?: string | null;
  isDark?: boolean;
  choroplethConfig?: IChoroplethConfig | null;
  hoveredTier?: number | null;
  onPathClick: (id: string) => void;
}

interface HoveredState {
  province: IProvince;
  x: number;
  y: number;
}

const clamp = (val: number, min: number, max: number) =>
  Math.min(Math.max(val, min), max);

export default function SVGElement({
  shapes,
  selectedIsland,
  highlightedId,
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

  // Tooltip position boundary
  const tooltipX = hovered
    ? Math.min(
        hovered.x + 16,
        typeof window !== 'undefined' ? window.innerWidth - 240 : 0,
      )
    : 0;
  const tooltipY = hovered
    ? Math.min(
        hovered.y + 16,
        typeof window !== 'undefined' ? window.innerHeight - 170 : 0,
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

            if (choroplethConfig) {
              const choroData = choroplethConfig.provincesData[id];
              const tierColor = isDark ? choroData?.fillDark : choroData?.fillLight;
              const themeBorderColor =
                choroplethConfig.id === 'population'
                  ? isDark
                    ? '#60a5fa'
                    : '#2563eb'
                  : choroplethConfig.id === 'density'
                    ? isDark
                      ? '#fb923c'
                      : '#ea580c'
                    : isDark
                      ? '#34d399'
                      : '#059669';

              if (isHighlighted) {
                // When clicked/selected: preserve authentic tier data color, highlight with bold border
                fill = tierColor || '#94a3b8';
                stroke = isDark ? '#ffffff' : '#0f172a';
                strokeWidth = '2';
                opacity = 1;
              } else if (!isMatchIsland) {
                fill = isDark ? '#334155' : '#94a3b8';
                stroke = isDark ? '#475569' : '#cbd5e1';
                strokeWidth = '0.5';
                opacity = 0.2;
              } else if (isHovered) {
                // When hovered: border adopts the mode's signature theme color instead of red
                fill = isDark ? '#ffffff' : '#f8fafc';
                stroke = themeBorderColor;
                strokeWidth = '1.5';
                opacity = 1;
              } else if (hoveredTier !== null && choroData) {
                fill = tierColor || '#94a3b8';
                if (hoveredTier === choroData.tier) {
                  stroke = isDark ? '#ffffff' : '#0f172a';
                  strokeWidth = '1';
                  opacity = 1;
                } else {
                  stroke = isDark ? '#0f172a' : '#ffffff';
                  strokeWidth = '0.5';
                  opacity = 0.25;
                }
              } else {
                fill = tierColor || '#94a3b8';
                stroke = isDark ? '#0f172a' : '#ffffff';
                strokeWidth = '0.5';
                opacity = 1;
              }
            } else {
              // Default standard map colors
              if (isHighlighted) {
                // When clicked: preserve red map fill with bold high-contrast outline
                fill = '#ef4444';
                stroke = isDark ? '#ffffff' : '#0f172a';
                strokeWidth = '2';
                opacity = 1;
              } else if (!isMatchIsland) {
                fill = isDark ? '#334155' : '#94a3b8';
                stroke = isDark ? '#475569' : '#cbd5e1';
                strokeWidth = '0.5';
                opacity = 0.22;
              } else if (isHovered) {
                fill = '#ffffff';
                stroke = '#ef4444';
                strokeWidth = '1.5';
                opacity = 1;
              } else {
                fill = '#ef4444';
                stroke = '#ffffff';
                strokeWidth = '0.5';
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
                  delay: index * 0.015,
                  duration: 0.35,
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

      {/* Floating Hover Tooltip */}
      <AnimatePresence>
        {hovered && !isDragging && (
          <motion.div
            key={hovered.province.id}
            initial={{ opacity: 0, scale: 0.92, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 4 }}
            transition={{ duration: 0.12 }}
            style={{ left: tooltipX, top: tooltipY }}
            className='pointer-events-none fixed z-50 min-w-48 rounded-xl border border-border/80 bg-background/95 p-3 shadow-xl backdrop-blur-md'
          >
            {/* Header: Name and Island badge */}
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

            {/* Thematic Choropleth Metrics Highlight */}
            {choroplethConfig && hoveredChoroData ? (
              <div className='mt-2 space-y-1.5 rounded-lg border border-border/70 bg-accent/30 p-2 text-xs'>
                <div className='flex items-center justify-between'>
                  <span className='font-semibold text-foreground'>
                    {choroplethConfig.shortName}:
                  </span>
                  <span className='font-bold text-foreground'>
                    {hoveredChoroData.formattedValue}
                  </span>
                </div>

                <div className='flex items-center justify-between text-[11px] text-muted-foreground'>
                  <span className='flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400'>
                    <Award className='size-3' />
                    Peringkat #{hoveredChoroData.rank} dari 38
                  </span>
                  {hoveredChoroData.percentOfTotal > 0 && (
                    <span className='font-medium text-foreground'>
                      {hoveredChoroData.percentOfTotal}% nasional
                    </span>
                  )}
                </div>

                <div className='flex items-center justify-between text-[10px] text-muted-foreground'>
                  <div className='flex items-center gap-1.5'>
                    <span
                      style={{
                        backgroundColor: isDark
                          ? hoveredChoroData.fillDark
                          : hoveredChoroData.fillLight,
                      }}
                      className='size-2.5 rounded-full border border-black/20'
                    />
                    <span>
                      Tingkat {hoveredChoroData.tier}/5 (
                      {choroplethConfig.tiers[hoveredChoroData.tier - 1]?.label})
                    </span>
                  </div>
                  <span className='text-[9px] opacity-80'>BPS & Kemendagri</span>
                </div>
              </div>
            ) : null}

            {/* Standard Details */}
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
              {(!choroplethConfig || choroplethConfig.id !== 'population') &&
                hovered.province.population && (
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
              Klik untuk melihat profil lengkap →
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
