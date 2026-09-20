export interface DetectedAddress {
  pincode: string;
  city: string;
  state: string;
  street: string;
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
            reject(new Error('Location access denied. Please enter address manually.'));
          } else if (err.code === err.TIMEOUT) {
            reject(new Error('Could not fetch location. Please enter manually.'));
          } else {
            reject(new Error('Could not fetch location. Please enter manually.'));
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });

    const { latitude: lat, longitude: lng } = position.coords;

    // 2. Call API 1 (Primary): BigDataCloud Free Reverse Geocode API
    try {
      const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
      const res = await fetch(bdcUrl);
      if (res.ok) {
        const data = await res.json();
        const pincode = data.postcode || data.localityInfo?.postalCode || '';
        const city = data.city || data.locality || data.localityInfo?.informative?.find((i: any) => i.description === 'city' || i.order === 4)?.name || '';
        const state = data.principalSubdivision || '';
        
        let streetParts: string[] = [];
        if (data.localityInfo?.informative) {
          data.localityInfo.informative.forEach((item: any) => {
            if (item.name && !['India', state, city].includes(item.name)) {
              streetParts.push(item.name);
            }
          });
        }
        if (streetParts.length === 0 && data.locality) {
          streetParts.push(data.locality);
        }
        const street = streetParts.slice(0, 2).join(', ');

        if (pincode || city || state) {
          return {
            pincode,
            city,
            state,
            street: street || data.locality || '',
            rawAddress: [street, city, state, pincode].filter(Boolean).join(', ')
          };
        }
      }
    } catch (e) {
      console.warn('BigDataCloud reverse geocode failed, falling back to Nominatim:', e);
    }

    // 3. Call API 2 (Fallback): OpenStreetMap Nominatim
    try {
      const nomUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
      const res = await fetch(nomUrl, {
        headers: {
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const pincode = addr.postcode || '';
        const city = addr.city || addr.town || addr.village || addr.suburb || addr.county || '';
        const state = addr.state || addr.state_district || '';
        const street = addr.road || addr.suburb || addr.neighbourhood || addr.amenity || '';

        return {
          pincode,
          city,
          state,
          street,
          rawAddress: data.display_name || ''
        };
      }
    } catch (e) {
      console.error('Nominatim reverse geocode failed:', e);
    }

    throw new Error('Could not fetch location. Please enter manually.');
  }
};
