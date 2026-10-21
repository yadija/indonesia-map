import { ProvinceRegenciesData, Regency } from '../../interfaces/regency';
import baliData from './IDBA.json';
import jawaBaratData from './IDJB.json';
import kalimantanTimurData from './IDKI.json';
import malukuData from './IDMA.json';
import papuaData from './IDPA.json';
import sumateraBaratData from './IDSB.json';
import sulawesiSelatanData from './IDSN.json';

// representative provinces for the 7 island regions
export const PROVINCE_REGENCIES_MAP: Record<string, ProvinceRegenciesData> = {
  IDSB: sumateraBaratData as ProvinceRegenciesData,
  IDJB: jawaBaratData as ProvinceRegenciesData,
  IDBA: baliData as ProvinceRegenciesData,
  IDKI: kalimantanTimurData as ProvinceRegenciesData,
  IDSN: sulawesiSelatanData as ProvinceRegenciesData,
  IDMA: malukuData as ProvinceRegenciesData,
  IDPA: papuaData as ProvinceRegenciesData,
};

export const PROVINCE_SLUG_MAP: Record<string, string> = {
  'sumatera-barat': 'IDSB',
  sumbar: 'IDSB',
  idsb: 'IDSB',

  'jawa-barat': 'IDJB',
  jabar: 'IDJB',
  idjb: 'IDJB',

  bali: 'IDBA',
  idba: 'IDBA',

  'kalimantan-timur': 'IDKI',
  kaltim: 'IDKI',
  idki: 'IDKI',

  'sulawesi-selatan': 'IDSN',
  sulsel: 'IDSN',
  idsn: 'IDSN',

  maluku: 'IDMA',
  idma: 'IDMA',

  papua: 'IDPA',
  idpa: 'IDPA',
};

export const hasRegenciesData = (provinceId?: string | null): boolean => {
  if (!provinceId) return false;
  return provinceId in PROVINCE_REGENCIES_MAP;
};

export const getRegenciesByProvinceId = (
  provinceId?: string | null,
): ProvinceRegenciesData | null => {
  if (!provinceId) return null;
  return PROVINCE_REGENCIES_MAP[provinceId] || null;
};

export const getProvinceIdFromSlug = (slug?: string | null): string | null => {
  if (!slug) return null;
  const clean = slug
    .toLowerCase()
    .trim()
    .replace(/^\/+|\/+$/g, '');
  if (PROVINCE_SLUG_MAP[clean]) {
    return PROVINCE_SLUG_MAP[clean];
  }
  const upper = clean.toUpperCase();
  if (PROVINCE_REGENCIES_MAP[upper]) {
    return upper;
  }
  return null;
};

export const getSlugFromProvinceId = (provinceId: string): string => {
  const upper = provinceId.toUpperCase();
  for (const [slug, id] of Object.entries(PROVINCE_SLUG_MAP)) {
    if (id === upper && !slug.startsWith('id')) {
      return slug;
    }
  }
  return upper.toLowerCase();
};

export const getAllAvailableRegencies = (): Regency[] => {
  return Object.values(PROVINCE_REGENCIES_MAP).flatMap((p) => p.regencies);
};
