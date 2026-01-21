import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface UserLocation {
    lat: number;
    lon: number;
    address: string;
}

interface LocationContextType {
    location: UserLocation | null;
    setLocation: (location: UserLocation) => void;
    clearLocation: () => void;
    isLocationSet: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const LOCATION_STORAGE_KEY = 'fastbite_user_location';

export const LocationProvider = ({ children }: { children: ReactNode }) => {
    const [location, setLocationState] = useState<UserLocation | null>(() => {
        // Initialize from sessionStorage if available
        try {
            const stored = sessionStorage.getItem(LOCATION_STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('[LocationContext] Failed to parse stored location:', error);
        }
        return null;
    });

    // Save to sessionStorage whenever location changes
    useEffect(() => {
        if (location) {
            sessionStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
        } else {
            sessionStorage.removeItem(LOCATION_STORAGE_KEY);
        }
    }, [location]);

    const setLocation = (newLocation: UserLocation) => {
        setLocationState(newLocation);
        console.log('[LocationContext] Location set:', newLocation);
    };

    const clearLocation = () => {
        setLocationState(null);
        sessionStorage.removeItem(LOCATION_STORAGE_KEY);
        console.log('[LocationContext] Location cleared');
    };

    return (
        <LocationContext.Provider
            value={{
                location,
                setLocation,
                clearLocation,
                isLocationSet: location !== null
            }}
        >
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = (): LocationContextType => {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};

export type { UserLocation };
