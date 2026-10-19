export interface Regency {
  id: string;
  provinceId: string;
  name: string;
  type: 'Kabupaten' | 'Kota';
  capital?: string;
  d: string;
  population?: number;
  areaKm2?: number;
  description?: string;
}

export interface ProvinceRegenciesData {
  provinceId: string;
  provinceName: string;
  viewBox: string;
  regencies: Regency[];
}
