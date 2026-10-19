import { motion } from 'framer-motion';
import { useCallback, useState } from 'react';

import { useMapPanZoom } from '../hooks/use-map-pan-zoom';
import { ChoroplethConfig } from '../interfaces/choropleth';
import { ProvinceRegenciesData, Regency } from '../interfaces/regency';
import { getRegencyPathStyle } from '../utils/regency-styles';
import RegencyTooltip, { HoveredRegencyState } from './regency-tooltip';
import ZoomControls from './zoom-controls';

interface RegencySVGElementProps {
  provinceData: ProvinceRegenciesData;
  highlightedRegencyId?: string | null;
  externalHoveredRegencyId?: string | null;
  selectedRegencyType?: 'all' | 'kabupaten' | 'kota';
  isDark?: boolean;
  choroplethConfig?: ChoroplethConfig | null;
  hoveredTier?: number | null;
  onRegencyClick: (regency: Regency) => void;
}

export default function RegencySVGElement({
  provinceData,
  highlightedRegencyId,
  externalHoveredRegencyId,
  selectedRegencyType = 'all',
  isDark = false,
  choroplethConfig,
  hoveredTier,
  onRegencyClick,
}: RegencySVGElementProps) {
  const [hovered, setHovered] = useState<HoveredRegencyState | null>(null);

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

  const { viewBox, regencies } = provinceData;

  return (
    <div
      ref={containerRef}
      onMouseLeave={() => setHovered(null)}
      className={`relative size-full select-none overflow-hidden ${
        isDragging ? 'cursor-grabbing' : scale > 1 ? 'cursor-grab' : 'cursor-default'
      }`}
    >
      {/* Zoomable & Pannable Transform Container */}
      <div
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.25s ease-out',
        }}
        className='flex size-full items-center justify-center will-change-transform'
      >
        <svg
          viewBox={viewBox}
          preserveAspectRatio='xMidYMid meet'
          className='size-full max-h-full max-w-full drop-shadow-md'
        >
          {regencies.map((regency, index) => {
            const { id, name, d } = regency;
            const isHighlighted = highlightedRegencyId === id;
            const isHovered =
              hovered?.regency.id === id || externalHoveredRegencyId === id;

            const { fill, stroke, strokeWidth, opacity } = getRegencyPathStyle({
              regency,
              isHighlighted,
              isHovered,
              choroplethConfig,
              hoveredTier,
              isDark,
              selectedType: selectedRegencyType,
            });

            return (
              <motion.path
                key={id}
                id={id}
                d={d}
                strokeWidth={strokeWidth}
                aria-label={name}
                role='button'
                tabIndex={0}
                onClick={() => {
                  if (hasDraggedRef.current) return;
                  setHovered(null);
                  onRegencyClick(regency);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onRegencyClick(regency);
                  }
                }}
                onMouseEnter={(e) => {
                  if (isDragging) return;
                  setHovered({
                    regency,
                    x: e.clientX,
                    y: e.clientY,
                  });
                }}
                onMouseMove={(e) => {
                  if (isDragging) return;
                  setHovered((prev) =>
                    prev
                      ? { ...prev, x: e.clientX, y: e.clientY }
                      : { regency, x: e.clientX, y: e.clientY },
                  );
                }}
                onMouseLeave={() => setHovered(null)}
                className='cursor-pointer outline-none transition-colors duration-150 focus-visible:stroke-black focus-visible:stroke-[3] dark:focus-visible:stroke-white'
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity, scale: 1, fill, stroke }}
                transition={{
                  delay: index * 0.02,
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

      {/* Floating Regency Hover Tooltip */}
      <RegencyTooltip
        hovered={hovered}
        isDragging={isDragging}
        isDark={isDark}
        choroplethConfig={choroplethConfig}
      />
    </div>
  );
}
