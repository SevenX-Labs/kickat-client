export interface DetectedAddress {
  latitude: number;
  longitude: number;
  pincode: string;
  city: string;
  state: string;
  street: string;
  landmark: string;
  houseFlat?: string;
  rawAddress?: string;
}

export const locationService = {
  async getCurrentLocationAddress(): Promise<DetectedAddress> {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      throw new Error('Geolocation is not supported by your browser.');
    }

    // 1. Get position via browser Geolocation API
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            reject(new Error('Location access was denied. Please allow location access in your browser or enter address manually.'));
          } else if (err.code === err.TIMEOUT) {
            reject(new Error('Location request timed out. Please enter address manually.'));
          } else {
            reject(new Error('Could not fetch location coordinates. Please enter manually.'));
          }
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    });

    const { latitude: lat, longitude: lng } = position.coords;

    // 2. Primary Geocoder: OpenStreetMap Nominatim with reverse geocoding
    try {
      const nomUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
      const res = await fetch(nomUrl, {
        headers: {
          'Accept-Language': 'en-IN,en;q=0.9',
          'User-Agent': 'KickAt-ECommerce/1.0',
        },
      });

      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};

        const rawPostcode = (addr.postcode || '').replace(/\D/g, '').slice(0, 6);
        const city = addr.city || addr.town || addr.village || addr.city_district || addr.state_district || '';
        const state = addr.state || '';
        const street = addr.road || addr.residential || addr.street || '';
        const landmark = addr.neighbourhood || addr.suburb || addr.amenity || addr.building || '';

        return {
          latitude: lat,
          longitude: lng,
          pincode: rawPostcode,
          city: city,
          state: state || 'Maharashtra',
          street: street,
          landmark: landmark,
          rawAddress: data.display_name || '',
        };
      }
    } catch (e) {
      console.warn('Nominatim reverse geocode failed, falling back to Photon:', e);
    }

    // 3. Fallback Geocoder: Photon (Komoot OSM Geocoder)
    try {
      const photonUrl = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`;
      const res = await fetch(photonUrl);
      if (res.ok) {
        const data = await res.json();
        const prop = data.features?.[0]?.properties || {};

        const rawPostcode = (prop.postcode || '').replace(/\D/g, '').slice(0, 6);
        const city = prop.city || prop.district || prop.county || '';
        const state = prop.state || '';
        const street = prop.name || prop.street || '';
        const landmark = prop.locality || prop.district || '';

        return {
          latitude: lat,
          longitude: lng,
          pincode: rawPostcode,
          city: city,
          state: state || 'Maharashtra',
          street: street,
          landmark: landmark,
          rawAddress: [street, landmark, city, state, rawPostcode].filter(Boolean).join(', '),
        };
      }
    } catch (e) {
      console.warn('Photon reverse geocode failed:', e);
    }

    // Fallback coordinates
    return {
      latitude: lat,
      longitude: lng,
      pincode: '',
      city: '',
      state: 'Maharashtra',
      street: '',
      landmark: '',
      rawAddress: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    };
  },
};
