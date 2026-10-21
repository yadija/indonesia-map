import { motion } from 'framer-motion';
import { useCallback, useState } from 'react';

import { useMapPanZoom } from '../hooks/use-map-pan-zoom';
import { ChoroplethConfig } from '../interfaces/choropleth';
import { Province } from '../interfaces/province';
import { getProvincePathStyle } from '../utils/map-styles';
import MapTooltip, { HoveredProvinceState } from './map-tooltip';
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

export default function SVGElement({
  shapes,
  selectedIsland,
  highlightedId,
  comparedIds = [],
  isDark = false,
  choroplethConfig,
  hoveredTier,
  onPathClick,
}: SVGElementProps) {
  const [hovered, setHovered] = useState<HoveredProvinceState | null>(null);

  const handleDragMove = useCallback(() => {
    setHovered(null);
  }, []);

  const {
    containerRef,
    scale,
    position,
    isDragging,
    hasDraggedRef,
    handleZoomIn,
    handleZoomOut,
    handleReset,
  } = useMapPanZoom({ onDragMove: handleDragMove });

  return (
    <div
      ref={containerRef}
      onMouseLeave={() => setHovered(null)}
      className={`relative size-full select-none overflow-hidden ${
        isDragging ? 'cursor-grabbing' : scale > 1 ? 'cursor-grab' : 'cursor-default'
      }`}
    >
      {/* zoomable and pannable container */}
      <div
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
          transformOrigin: 'center center',
          transition: isDragging
            ? 'none'
            : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className='flex size-full items-center justify-center will-change-transform'
      >
        <svg
          viewBox='0 0 800 350'
          preserveAspectRatio='xMidYMid meet'
          className='size-full max-h-full max-w-full'
        >
          {shapes.map((shape, index) => {
            const { id, name, d, island } = shape;
            const isMatchIsland = !selectedIsland || island === selectedIsland;
            const isHighlighted = highlightedId === id;
            const isHovered = hovered?.province.id === id;
            const compareIndex = comparedIds.indexOf(id);
            const isCompared = compareIndex !== -1;

            const { fill, stroke, strokeWidth, opacity } = getProvincePathStyle({
              province: shape,
              isMatchIsland,
              isHighlighted,
              isCompared,
              compareIndex,
              isHovered,
              choroplethConfig,
              hoveredTier,
              isDark,
            });

            return (
              <motion.path
                key={id}
                id={id}
                d={d}
                strokeWidth={strokeWidth}
                aria-label={`${name}${island ? `, Wilayah ${island}` : ''}`}
                role='button'
                tabIndex={0}
                onClick={() => {
                  if (hasDraggedRef.current) return;
                  setHovered(null);
                  onPathClick(id);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onPathClick(id);
                  }
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
                className='cursor-pointer outline-none transition-colors duration-150 focus-visible:stroke-black focus-visible:stroke-[3] dark:focus-visible:stroke-white'
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

      {/* zoom controls */}
      <ZoomControls
        scale={scale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
      />

      {/* hover tooltip */}
      <MapTooltip
        hovered={hovered}
        isDragging={isDragging}
        isDark={isDark}
        choroplethConfig={choroplethConfig}
        comparedIds={comparedIds}
      />
    </div>
  );
}
