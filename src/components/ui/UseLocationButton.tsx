"use client";

import { useState } from 'react';
import { MapPin, Loader2, Navigation } from 'lucide-react';
import styles from './UseLocationButton.module.css';
import { locationService, DetectedAddress } from '@/services/locationService';

interface UseLocationButtonProps {
  onLocationDetected: (address: DetectedAddress) => void;
  className?: string;
}

export function UseLocationButton({ onLocationDetected, className = '' }: UseLocationButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDetectLocation = async () => {
    setLoading(true);
    try {
      const addressData = await locationService.getCurrentLocationAddress();
      onLocationDetected(addressData);
    } catch (err: any) {
      alert(err.message || 'Could not fetch location. Please enter manually.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDetectLocation}
      disabled={loading}
      className={`${styles.locationBtn} ${className}`}
    >
      {loading ? (
        <>
          <Loader2 size={18} className={styles.spinner} />
          <span>Detecting location...</span>
        </>
      ) : (
        <>
          <Navigation size={18} color="#f97316" fill="rgba(249, 115, 22, 0.2)" />
          <span>Use Current Location</span>
        </>
      )}
    </button>
  );
}
