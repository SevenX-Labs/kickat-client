"use client";

import { useState, useEffect } from 'react';
import { 
  PublicSettings, 
  PublicDeliverySettings, 
  PublicTaxSettings,
  PublicPaymentSettings,
  PublicGeneralSettings,
  PublicManufacturingSettings,
  getPublicSettings 
} from '@/services/settingsService';

export function usePublicSettings() {
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    getPublicSettings()
      .then((data) => {
        if (isMounted) {
          setSettings(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching public settings:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const delivery: PublicDeliverySettings | null = settings?.delivery ?? null;
  const tax: PublicTaxSettings | null = settings?.tax ?? null;
  const payment: PublicPaymentSettings | null = settings?.payment ?? null;
  const general: PublicGeneralSettings | null = settings?.general ?? null;
  const manufacturing: PublicManufacturingSettings | null = settings?.manufacturing ?? null;

  return {
    settings,
    delivery,
    tax,
    payment,
    general,
    manufacturing,
    loading,
    freeDeliveryThreshold: delivery?.freeDeliveryThreshold,
    deliveryFee: delivery?.deliveryFee,
    deliveryFeeEnabled: delivery?.deliveryFeeEnabled,
  };
}
