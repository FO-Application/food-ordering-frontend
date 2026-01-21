import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import geocodingService, { type AddressSuggestion } from '../../../../services/geocodingService';
import { useLocation } from '../../../../contexts/LocationContext';
import './Hero.css';

const Hero = () => {
    const { t } = useTranslation();
    const { setLocation } = useLocation();
    const [address, setAddress] = useState('');
    const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoadingGPS, setIsLoadingGPS] = useState(false);
    const searchTimeoutRef = useRef<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const stats = [
        { value: '10K+', label: t('hero.restaurants') },
        { value: '500K+', label: t('hero.customers') },
        { value: '1M+', label: t('hero.orders') },
    ];

    // Handle address input change with debounced search
    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAddress(value);

        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Debounce search (wait 500ms after user stops typing)
        if (value.length >= 3) {
            searchTimeoutRef.current = setTimeout(async () => {
                const results = await geocodingService.searchAddress(value);
                setSuggestions(results);
                setShowSuggestions(true);
            }, 500);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    // Handle suggestion selection
    const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
        setAddress(suggestion.address);
        setShowSuggestions(false);
        setSuggestions([]);
        // Save location to context
        setLocation({
            lat: suggestion.lat,
            lon: suggestion.lon,
            address: suggestion.address
        });
    };

    // Handle GPS location
    const handleGetGPSLocation = async () => {
        setIsLoadingGPS(true);
        try {
            const { lat, lon } = await geocodingService.getCurrentLocation();
            const addressName = await geocodingService.reverseGeocode(lat, lon);

            if (addressName) {
                setAddress(addressName);
                setShowSuggestions(false);
                setSuggestions([]);
                // Save location to context
                setLocation({
                    lat,
                    lon,
                    address: addressName
                });
            }
        } catch (error: any) {
            console.error('[Hero] GPS location failed:', error);
            alert(error.message || 'Không thể lấy vị trí của bạn');
        } finally {
            setIsLoadingGPS(false);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    return (
        <section className="hero" id="home">
            {/* Background */}
            <div className="hero-background"></div>

            {/* Content */}
            <div className="hero-content">
                <div className="hero-badge">
                    <span>{t('hero.badge')}</span>
                </div>

                <h1 className="hero-title">
                    {t('hero.title')}{' '}
                    <span className="hero-title-highlight">{t('hero.titleHighlight')}</span>
                </h1>

                <p className="hero-description">
                    {t('hero.subtitle')}
                </p>

                {/* Search Box */}
                <div className="hero-search" ref={dropdownRef}>
                    <input
                        type="text"
                        className="hero-search-input"
                        placeholder={t('hero.searchPlaceholder')}
                        value={address}
                        onChange={handleAddressChange}
                        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    />
                    <button
                        className="hero-gps-btn"
                        onClick={handleGetGPSLocation}
                        disabled={isLoadingGPS}
                        title="Lấy vị trí hiện tại"
                    >
                        {isLoadingGPS ? (
                            <span className="gps-loading"></span>
                        ) : (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="4" />
                                <line x1="12" y1="2" x2="12" y2="6" />
                                <line x1="12" y1="18" x2="12" y2="22" />
                                <line x1="2" y1="12" x2="6" y2="12" />
                                <line x1="18" y1="12" x2="22" y2="12" />
                            </svg>
                        )}
                    </button>

                    {/* Autocomplete Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="hero-search-dropdown">
                            {suggestions.map((suggestion) => (
                                <div
                                    key={suggestion.id}
                                    className="hero-search-dropdown-item"
                                    onClick={() => handleSelectSuggestion(suggestion)}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                    </svg>
                                    <span>{suggestion.displayName}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="hero-stats">
                    {stats.map((stat, index) => (
                        <div key={index} className="hero-stat">
                            <div className="hero-stat-value">{stat.value}</div>
                            <div className="hero-stat-label">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="hero-scroll">
                <span className="hero-scroll-text">{t('hero.scrollDown')}</span>
                <div className="hero-scroll-icon">
                    <div className="hero-scroll-dot"></div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
