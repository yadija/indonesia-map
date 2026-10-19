import {
  ChoroplethConfig,
  ChoroplethMetric,
  ChoroplethTier,
  ProvinceChoroplethData,
} from '../interfaces/choropleth';
import { Regency } from '../interfaces/regency';
import { formatCompact, formatNumber } from './choropleth';

const PALETTES: Record<
  Exclude<ChoroplethMetric, 'none'>,
  {
    light: [string, string, string, string, string];
    dark: [string, string, string, string, string];
  }
> = {
  population: {
    light: ['#dbeafe', '#93c5fd', '#60a5fa', '#2563eb', '#1e3a8a'],
    dark: ['#1e3a8a', '#2563eb', '#3b82f6', '#60a5fa', '#bfdbfe'],
  },
  density: {
    light: ['#ffedd5', '#fdba74', '#f97316', '#ea580c', '#9a3412'],
    dark: ['#7c2d12', '#c2410c', '#ea580c', '#fb923c', '#fed7aa'],
  },
  area: {
    light: ['#d1fae5', '#6ee7b7', '#10b981', '#059669', '#064e3b'],
    dark: ['#064e3b', '#047857', '#059669', '#10b981', '#6ee7b7'],
  },
};

export const getRegencyMetricValue = (
  regency: Regency,
  metric: ChoroplethMetric,
): number => {
  if (metric === 'population') {
    return regency.population || 0;
  }
  if (metric === 'density') {
    if (!regency.population || !regency.areaKm2 || regency.areaKm2 === 0) return 0;
    return Math.round(regency.population / regency.areaKm2);
  }
  if (metric === 'area') {
    return regency.areaKm2 || 0;
  }
  return 0;
};

export function computeRegencyChoropleth(
  metric: ChoroplethMetric,
  regencies: Regency[],
): ChoroplethConfig | null {
  if (metric === 'none' || regencies.length === 0) {
    return null;
  }

  const items = regencies
    .map((r) => ({
      id: r.id,
      name: r.name,
      value: getRegencyMetricValue(r, metric),
    }))
    .filter((v) => v.value > 0);

  if (items.length === 0) {
    return null;
  }

  const sortedAsc = [...items].sort((a, b) => a.value - b.value);
  const sortedDesc = [...items].sort((a, b) => b.value - a.value);

  const n = sortedAsc.length;
  const minVal = sortedAsc[0].value;
  const maxVal = sortedAsc[n - 1].value;

  if (minVal === maxVal) {
    return null;
  }

  const palette = PALETTES[metric];
  const q1 = sortedAsc[Math.floor(n * 0.2)].value;
  const q2 = sortedAsc[Math.floor(n * 0.4)].value;
  const q3 = sortedAsc[Math.floor(n * 0.6)].value;
  const q4 = sortedAsc[Math.floor(n * 0.8)].value;

  const tiers: ChoroplethTier[] = [
    {
      tier: 1,
      min: minVal,
      max: q1,
      label: `< ${formatCompact(q1, metric)}`,
      colorLight: palette.light[0],
      colorDark: palette.dark[0],
      count: 0,
    },
    {
      tier: 2,
      min: q1,
      max: q2,
      label: `${formatCompact(q1, metric)} – ${formatCompact(q2, metric)}`,
      colorLight: palette.light[1],
      colorDark: palette.dark[1],
      count: 0,
    },
    {
      tier: 3,
      min: q2,
      max: q3,
      label: `${formatCompact(q2, metric)} – ${formatCompact(q3, metric)}`,
      colorLight: palette.light[2],
      colorDark: palette.dark[2],
      count: 0,
    },
    {
      tier: 4,
      min: q3,
      max: q4,
      label: `${formatCompact(q3, metric)} – ${formatCompact(q4, metric)}`,
      colorLight: palette.light[3],
      colorDark: palette.dark[3],
      count: 0,
    },
    {
      tier: 5,
      min: q4,
      max: maxVal,
      label: `> ${formatCompact(q4, metric)}`,
      colorLight: palette.light[4],
      colorDark: palette.dark[4],
      count: 0,
    },
  ];

  const getTier = (val: number): number => {
    if (val <= q1) return 1;
    if (val <= q2) return 2;
    if (val <= q3) return 3;
    if (val <= q4) return 4;
    return 5;
  };

  const total = items.reduce((sum, item) => sum + item.value, 0);
  const unit =
    metric === 'population' ? 'Jiwa' : metric === 'density' ? 'Jiwa/km²' : 'km²';
  const name =
    metric === 'population'
      ? 'Populasi Kab/Kota'
      : metric === 'density'
        ? 'Kepadatan Penduduk Kab/Kota'
        : 'Luas Wilayah Kab/Kota';
  const shortName =
    metric === 'population'
      ? 'Populasi'
      : metric === 'density'
        ? 'Kepadatan'
        : 'Luas Wilayah';

  const regenciesData: Record<string, ProvinceChoroplethData> = {};

  sortedAsc.forEach((item) => {
    const tier = getTier(item.value);
    tiers[tier - 1].count += 1;

    const rank = sortedDesc.findIndex((p) => p.id === item.id) + 1;
    const percentOfTotal =
      total > 0 && metric !== 'density'
        ? Number(((item.value / total) * 100).toFixed(1))
        : 0;

    regenciesData[item.id] = {
      id: item.id,
      value: item.value,
      tier,
      rank,
      percentOfTotal,
      formattedValue: `${formatNumber(item.value)} ${unit}`,
      fillLight: palette.light[tier - 1],
      fillDark: palette.dark[tier - 1],
    };
  });

  return {
    id: metric,
    name,
    shortName,
    unit,
    description: `Sebaran ${shortName.toLowerCase()} per kabupaten/kota`,
    source: 'BPS Daerah (Statistik Sensus & Proyeksi Penduduk)',
    totalNational: total,
    minProvince: { name: sortedAsc[0].name, value: minVal },
    maxProvince: { name: sortedAsc[n - 1].name, value: maxVal },
    tiers,
    provincesData: regenciesData,
  };
}
