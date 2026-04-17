import { persistedStore } from './persistedStore';

interface AppSettings {
  isLightMode: boolean;
  isNormal: boolean;
}

export interface CachedLocation {
  longitude: number;
  latitude: number;
  city: string;
  country: string;
  countryCode: string;
  lastUpdated: number;
}

export const settings = persistedStore<AppSettings>('user-settings', {
  isLightMode: false,
  isNormal: true
});

export const cachedLocation = persistedStore<CachedLocation | null>('cached-location', null);