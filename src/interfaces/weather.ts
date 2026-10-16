export type WeatherIconType =
  | 'Sun'
  | 'CloudSun'
  | 'Cloud'
  | 'CloudFog'
  | 'CloudDrizzle'
  | 'CloudRain'
  | 'CloudLightning';

export interface WeatherData {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  label: string;
  iconName: WeatherIconType;
  time: string;
  capital: string;
}

export interface WeatherCoordinates {
  lat: number;
  lng: number;
  capital: string;
}
