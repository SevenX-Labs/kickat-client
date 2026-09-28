import { api } from './api';

export interface PublicDeliverySettings {
  deliveryFeeEnabled: boolean;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  estimatedDays: number;
  courierDefault: string;
  extraFeeEnabled?: boolean;
  extraFeeName?: string | null;
  extraFeeAmount?: number;
  isExtraFeeCompulsory?: boolean;
}

export interface PublicGeneralSettings {
  storeName: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    twitter?: string;
    linkedin?: string;
  };
  supportEmail: string;
  supportPhone: string;
  maintenanceMode: boolean;
}

export interface PublicTaxSettings {
  gstEnabled: boolean;
  gstPercentage: number;
  gstNumber?: string | null;
  gstAppliesToDelivery: boolean;
  taxInclusive: boolean;
}

export interface PublicPaymentSettings {
  razorpay?: { enabled: boolean };
  cod?: {
    enabled: boolean;
    minOrderAmount: number;
    maxOrderAmount: number;
    extraFeeEnabled: boolean;
    extraFee: number;
  };
  upi?: { enabled: boolean };
  card?: { enabled: boolean };
  wallet?: { enabled: boolean };
  netbanking?: { enabled: boolean };
}

export interface PublicSettings {
  general: PublicGeneralSettings;
  delivery: PublicDeliverySettings;
  tax: PublicTaxSettings;
  payment: PublicPaymentSettings;
}

let cachedSettings: PublicSettings | null = null;
let fetchPromise: Promise<PublicSettings | null> | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 30 * 1000; // 30 seconds fresh cache

export async function getPublicSettings(forceRefresh = false): Promise<PublicSettings | null> {
  const now = Date.now();
  if (!forceRefresh && cachedSettings && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedSettings;
  }

  if (fetchPromise && !forceRefresh) {
    return fetchPromise;
  }

  fetchPromise = (async () => {
    try {
      const response = await api<{ success: boolean; data: PublicSettings }>('/settings/public');
      if (response?.data) {
        cachedSettings = response.data;
        lastFetchTime = Date.now();
        return response.data;
      }
      return cachedSettings;
    } catch (err) {
      console.error('[settingsService] Failed to load server settings:', err);
      return cachedSettings;
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

export async function getDeliverySettings(): Promise<PublicDeliverySettings | null> {
  const settings = await getPublicSettings();
  return settings ? settings.delivery : null;
}
