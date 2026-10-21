import {
  ChoroplethConfig,
  ChoroplethMetric,
  ChoroplethTier,
  ProvinceChoroplethData,
} from '../interfaces/choropleth';
import { Province } from '../interfaces/province';

export const CHOROPLETH_METRICS: {
  id: ChoroplethMetric;
  label: string;
  iconName: string;
  description: string;
}[] = [
  {
    id: 'none',
    label: 'Standar',
    iconName: 'Map',
    description: 'Tampilan peta normal pulau dan provinsi',
  },
  {
    id: 'population',
    label: 'Populasi',
    iconName: 'Users',
    description: 'Jumlah estimasi total penduduk per provinsi (Jiwa)',
  },
  {
    id: 'density',
    label: 'Kepadatan',
    iconName: 'Building2',
    description: 'Rasio kepadatan penduduk rata-rata (Jiwa/km²)',
  },
  {
    id: 'area',
    label: 'Luas Wilayah',
    iconName: 'Maximize2',
    description: 'Total luas wilayah daratan per provinsi (km²)',
  },
];

interface PaletteConfig {
  light: [string, string, string, string, string];
  dark: [string, string, string, string, string];
}

const PALETTES: Record<Exclude<ChoroplethMetric, 'none'>, PaletteConfig> = {
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

export const formatNumber = (val: number): string =>
  new Intl.NumberFormat('id-ID').format(val);

export const formatCompact = (val: number, metric: ChoroplethMetric): string => {
  if (metric === 'population') {
    if (val >= 1_000_000) {
      return `${(val / 1_000_000).toLocaleString('id-ID', {
        maximumFractionDigits: 1,
      })} Jt`;
    }
    if (val >= 1_000) {
      return `${(val / 1_000).toLocaleString('id-ID', {
        maximumFractionDigits: 0,
      })} Rb`;
    }
    return `${val}`;
  }

  if (metric === 'density') {
    return `${formatNumber(val)}`;
  }

  if (metric === 'area') {
    if (val >= 1_000) {
      return `${formatNumber(Math.round(val))}`;
    }
    return `${val}`;
  }

  return formatNumber(val);
};

export const getProvinceMetricValue = (
  province: Province,
  metric: ChoroplethMetric,
): number => {
  if (metric === 'population') {
    return province.population || 0;
  }
  if (metric === 'density') {
    if (!province.population || !province.areaKm2) return 0;
    return Math.round(province.population / province.areaKm2);
  }
  if (metric === 'area') {
    return province.areaKm2 || 0;
  }
  return 0;
};

export function computeChoropleth(
  metric: ChoroplethMetric,
  provinces: Province[],
): ChoroplethConfig | null {
  if (metric === 'none' || provinces.length === 0) return null;

  const metricMeta = {
    population: {
      name: 'Populasi Penduduk',
      shortName: 'Populasi',
      unit: 'Jiwa',
      description: 'Distribusi jumlah penduduk di 38 provinsi Indonesia',
    },
    density: {
      name: 'Kepadatan Penduduk',
      shortName: 'Kepadatan',
      unit: 'Jiwa/km²',
      description: 'Konsentrasi jumlah penduduk per kilometer persegi',
    },
    area: {
      name: 'Luas Wilayah',
      shortName: 'Luas Wilayah',
      unit: 'km²',
      description: 'Luas daratan geografis per provinsi',
    },
  }[metric];

  // extract and sort values ascending for quantiles
  const rawList = provinces.map((p) => ({
    id: p.id,
    name: p.name,
    value: getProvinceMetricValue(p, metric),
  }));

  const sortedAsc = [...rawList].sort((a, b) => a.value - b.value);
  const sortedDesc = [...rawList].sort((a, b) => b.value - a.value);

  // compute national sum
  const totalNational = sortedAsc.reduce((sum, item) => sum + item.value, 0);

  // 5 quantile split points (20%, 40%, 60%, 80%)
  const n = sortedAsc.length;
  const q1 = sortedAsc[Math.floor(n * 0.2)].value;
  const q2 = sortedAsc[Math.floor(n * 0.4)].value;
  const q3 = sortedAsc[Math.floor(n * 0.6)].value;
  const q4 = sortedAsc[Math.floor(n * 0.8)].value;

  const minVal = sortedAsc[0].value;
  const maxVal = sortedAsc[n - 1].value;

  const palette = PALETTES[metric];

  // build 5 tiers
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

  // determine tier (1 to 5)
  const getTier = (val: number): number => {
    if (val <= q1) return 1;
    if (val <= q2) return 2;
    if (val <= q3) return 3;
    if (val <= q4) return 4;
    return 5;
  };

  const provincesData: Record<string, ProvinceChoroplethData> = {};

  sortedAsc.forEach((item) => {
    const tier = getTier(item.value);
    tiers[tier - 1].count += 1;

    // rank 1 is highest value
    const rank = sortedDesc.findIndex((p) => p.id === item.id) + 1;
    const percentOfTotal =
      totalNational > 0 && metric !== 'density'
        ? Number(((item.value / totalNational) * 100).toFixed(1))
        : 0;

    provincesData[item.id] = {
      id: item.id,
      value: item.value,
      tier,
      rank,
      percentOfTotal,
      formattedValue: `${formatNumber(item.value)} ${metricMeta.unit}`,
      fillLight: palette.light[tier - 1],
      fillDark: palette.dark[tier - 1],
    };
  });

  return {
    id: metric,
    name: metricMeta.name,
    shortName: metricMeta.shortName,
    unit: metricMeta.unit,
    description: metricMeta.description,
    source: 'BPS RI (Proyeksi 2023) & Kemendagri RI (Kepmen No. 100.1.1-6117 Tahun 2022)',
    totalNational,
    minProvince: { name: sortedAsc[0].name, value: minVal },
    maxProvince: { name: sortedAsc[n - 1].name, value: maxVal },
    tiers,
    provincesData,
  };
}
