import { ChoroplethConfig } from '../interfaces/choropleth';
import { Province } from '../interfaces/province';

export const COMPARE_COLORS = ['#2563eb', '#f59e0b', '#10b981'] as const;

export interface ProvincePathStyle {
  fill: string;
  stroke: string;
  strokeWidth: string;
  opacity: number;
}

export interface GetProvincePathStyleParams {
  province: Province;
  isMatchIsland: boolean;
  isHighlighted: boolean;
  isCompared: boolean;
  compareIndex: number;
  isHovered: boolean;
  choroplethConfig?: ChoroplethConfig | null;
  hoveredTier?: number | null;
  isDark?: boolean;
}

export function getProvincePathStyle({
  province,
  isMatchIsland,
  isHighlighted,
  isCompared,
  compareIndex,
  isHovered,
  choroplethConfig,
  hoveredTier,
  isDark = false,
}: GetProvincePathStyleParams): ProvincePathStyle {
  const { id } = province;
  const compareStroke =
    compareIndex >= 0
      ? COMPARE_COLORS[compareIndex % COMPARE_COLORS.length]
      : COMPARE_COLORS[0];

  if (choroplethConfig) {
    const choroData = choroplethConfig.provincesData[id];
    const tierColor = (isDark ? choroData?.fillDark : choroData?.fillLight) || '#94a3b8';

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
      return {
        fill: tierColor,
        stroke: compareStroke,
        strokeWidth: '3',
        opacity: 1,
      };
    }

    if (isHighlighted) {
      return {
        fill: tierColor,
        stroke: isDark ? '#ffffff' : '#000000',
        strokeWidth: '2.5',
        opacity: 1,
      };
    }

    if (!isMatchIsland) {
      return {
        fill: isDark ? '#27272a' : '#d4d4d8',
        stroke: isDark ? '#3f3f46' : '#a1a1aa',
        strokeWidth: '0.5',
        opacity: 0.25,
      };
    }

    if (isHovered) {
      return {
        fill: isDark ? '#ffffff' : '#fef08a',
        stroke: themeBorderColor,
        strokeWidth: '2',
        opacity: 1,
      };
    }

    if (hoveredTier !== null && hoveredTier !== undefined && choroData) {
      const isTierMatched = hoveredTier === choroData.tier;
      return {
        fill: tierColor,
        stroke: isTierMatched
          ? isDark
            ? '#ffffff'
            : '#000000'
          : isDark
            ? '#18181b'
            : '#000000',
        strokeWidth: isTierMatched ? '1.5' : '0.5',
        opacity: isTierMatched ? 1 : 0.25,
      };
    }

    return {
      fill: tierColor,
      stroke: '#000000',
      strokeWidth: '0.75',
      opacity: 1,
    };
  }

  // standard national red mode
  if (isCompared) {
    return {
      fill: '#ef4444',
      stroke: compareStroke,
      strokeWidth: '3',
      opacity: 1,
    };
  }

  if (isHighlighted) {
    return {
      fill: '#dc2626',
      stroke: isDark ? '#ffffff' : '#000000',
      strokeWidth: '2.5',
      opacity: 1,
    };
  }

  if (!isMatchIsland) {
    return {
      fill: isDark ? '#27272a' : '#d4d4d8',
      stroke: isDark ? '#3f3f46' : '#a1a1aa',
      strokeWidth: '0.5',
      opacity: 0.25,
    };
  }

  if (isHovered) {
    return {
      fill: '#fef08a',
      stroke: '#000000',
      strokeWidth: '2',
      opacity: 1,
    };
  }

  return {
    fill: '#ef4444',
    stroke: isDark ? '#ffffff' : '#000000',
    strokeWidth: '0.75',
    opacity: 1,
  };
}
