// Geocoding service using Nominatim (OpenStreetMap)
// Free API, no key required

interface NominatimPlace {
    place_id: number;
    licence: string;
    display_name: string;
    lat: string;
    lon: string;
    address: {
        house_number?: string;
        road?: string;
        suburb?: string;
        city?: string;
        state?: string;
        country?: string;
        postcode?: string;
    };
}

interface AddressSuggestion {
    id: number;
    displayName: string;
    address: string;
    lat: number;
    lon: number;
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

// User-Agent header is required by Nominatim
const headers = {
    'User-Agent': 'FastBite-Food-Ordering-App'
};

const geocodingService = {
    /**
     * Search for addresses based on query
     * @param query - Search query (e.g., "123 Main Street")
     * @param countryCode - Optional country code (e.g., "vn" for Vietnam)
     */
    searchAddress: async (query: string, countryCode: string = 'vn'): Promise<AddressSuggestion[]> => {
        if (!query || query.length < 3) {
            return [];
        }

        try {
            const params = new URLSearchParams({
                q: query,
                format: 'json',
                addressdetails: '1',
                limit: '5',
                countrycodes: countryCode
            });

            const response = await fetch(
                `${NOMINATIM_BASE_URL}/search?${params.toString()}`,
                { headers }
            );

            if (!response.ok) {
                throw new Error(`Nominatim API error: ${response.status}`);
            }

            const data: NominatimPlace[] = await response.json();

            return data.map(place => ({
                id: place.place_id,
                displayName: place.display_name,
                address: place.display_name,
                lat: parseFloat(place.lat),
                lon: parseFloat(place.lon)
            }));
        } catch (error) {
            console.error('[GeocodingService] Search address failed:', error);
            return [];
        }
    },

    /**
     * Reverse geocode coordinates to address
     * @param lat - Latitude
     * @param lon - Longitude
     */
    reverseGeocode: async (lat: number, lon: number): Promise<string | null> => {
        try {
            const params = new URLSearchParams({
                lat: lat.toString(),
                lon: lon.toString(),
                format: 'json',
                addressdetails: '1'
            });

            const response = await fetch(
                `${NOMINATIM_BASE_URL}/reverse?${params.toString()}`,
                { headers }
            );

            if (!response.ok) {
                throw new Error(`Nominatim API error: ${response.status}`);
            }

            const data: NominatimPlace = await response.json();
            return data.display_name;
        } catch (error) {
            console.error('[GeocodingService] Reverse geocode failed:', error);
            return null;
        }
    },

    /**
     * Get user's current location using browser Geolocation API
     */
    getCurrentLocation: (): Promise<{ lat: number; lon: number }> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                },
                (error) => {
                    let errorMessage = 'Unable to get location';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location permission denied';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information unavailable';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out';
                            break;
                    }
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    }
};

export default geocodingService;
export type { AddressSuggestion };
