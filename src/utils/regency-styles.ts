import { ChoroplethConfig } from '../interfaces/choropleth';
import { Regency } from '../interfaces/regency';

export interface RegencyPathStyle {
  fill: string;
  stroke: string;
  strokeWidth: string;
  opacity: number;
}

export interface GetRegencyPathStyleParams {
  regency: Regency;
  isHighlighted: boolean;
  isHovered: boolean;
  choroplethConfig?: ChoroplethConfig | null;
  hoveredTier?: number | null;
  isDark?: boolean;
  selectedType?: 'all' | 'kabupaten' | 'kota';
}

export function getRegencyPathStyle({
  regency,
  isHighlighted,
  isHovered,
  choroplethConfig,
  hoveredTier,
  isDark = false,
  selectedType = 'all',
}: GetRegencyPathStyleParams): RegencyPathStyle {
  const { id } = regency;
  const isTypeMatched =
    !selectedType ||
    selectedType === 'all' ||
    (selectedType === 'kabupaten' && regency.type.toLowerCase() === 'kabupaten') ||
    (selectedType === 'kota' && regency.type.toLowerCase().includes('kota'));

  const typeDimOpacity = isDark ? 0.2 : 0.25;

  if (choroplethConfig) {
    const choroData = choroplethConfig.provincesData[id];
    const tierColor = (isDark ? choroData?.fillDark : choroData?.fillLight) || '#94a3b8';

    if (isHighlighted) {
      return {
        fill: tierColor,
        stroke: isDark ? '#ffffff' : '#000000',
        strokeWidth: '2.5',
        opacity: 1,
      };
    }

    if (isHovered) {
      return {
        fill: isDark ? '#ffffff' : '#fef08a',
        stroke: '#000000',
        strokeWidth: '2.5',
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
            ? '#27272a'
            : '#cbd5e1',
        strokeWidth: isTierMatched ? '1.5' : '0.5',
        opacity: isTierMatched ? (isTypeMatched ? 1 : typeDimOpacity) : 0.3,
      };
    }

    return {
      fill: tierColor,
      stroke: isTypeMatched
        ? isDark
          ? '#18181b'
          : '#000000'
        : isDark
          ? '#27272a'
          : '#cbd5e1',
      strokeWidth: isTypeMatched ? '0.75' : '0.5',
      opacity: isTypeMatched ? 1 : typeDimOpacity,
    };
  }

  // standard red mode
  if (isHighlighted) {
    return {
      fill: '#dc2626',
      stroke: isDark ? '#ffffff' : '#000000',
      strokeWidth: '3',
      opacity: 1,
    };
  }

  if (isHovered) {
    return {
      fill: '#fef08a',
      stroke: isDark ? '#ffffff' : '#000000',
      strokeWidth: '2.5',
      opacity: 1,
    };
  }

  return {
    fill: isTypeMatched
      ? isDark
        ? '#ef4444'
        : '#f87171'
      : isDark
        ? '#27272a'
        : '#e2e8f0',
    stroke: isTypeMatched
      ? isDark
        ? '#ffffff'
        : '#000000'
      : isDark
        ? '#3f3f46'
        : '#cbd5e1',
    strokeWidth: isTypeMatched ? '1' : '0.5',
    opacity: isTypeMatched ? 1 : typeDimOpacity,
  };
}
