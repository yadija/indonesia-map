export type AQICategoryLevel =
  | 'good'
  | 'moderate'
  | 'unhealthy-sensitive'
  | 'unhealthy'
  | 'very-unhealthy'
  | 'hazardous';

export interface AQICategory {
  level: AQICategoryLevel;
  label: string;
  badgeClass: string;
  barColor: string;
  textColor: string;
  recommendation: string;
}

export interface AirQualityData {
  aqi: number;
  category: AQICategory;
  pm2_5: number;
  pm10: number;
  ozone: number;
  time: string;
  timezone?: string;
  timezoneAbbreviation?: string;
  fetchedAt?: number;
  capital: string;
}
