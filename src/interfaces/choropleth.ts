export type ChoroplethMetric = 'none' | 'population' | 'density' | 'area';

export interface ChoroplethTier {
  tier: number; // 1 to 5
  label: string; // e.g. "< 1,4 jt"
  min: number;
  max: number;
  colorLight: string;
  colorDark: string;
  count: number;
}

export interface ProvinceChoroplethData {
  id: string;
  value: number;
  tier: number; // 1 to 5
  rank: number; // 1 (highest) to 38 (lowest)
  percentOfTotal: number;
  formattedValue: string;
  fillLight: string;
  fillDark: string;
}

export interface ChoroplethConfig {
  id: ChoroplethMetric;
  name: string;
  shortName: string;
  unit: string;
  description: string;
  source: string;
  totalNational: number;
  minProvince: { name: string; value: number };
  maxProvince: { name: string; value: number };
  tiers: ChoroplethTier[];
  provincesData: Record<string, ProvinceChoroplethData>;
}
