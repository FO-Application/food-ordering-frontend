import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './AppPromo.css';

const AppPromo = () => {
    const { t } = useTranslation();
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                    }
                });
            },
            { threshold: 0.1 }
        );

        const elements = sectionRef.current?.querySelectorAll('.animate-on-scroll');
        elements?.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return (
        <section className="app-promo" ref={sectionRef}>
            <div className="promo-container">
                <div className="promo-grid">
                    {/* Curated Restaurants */}
                    <div className="promo-card animate-on-scroll">
                        <div className="promo-image-wrapper">
                            {/* Food illustration using reliable image */}
                            <img
                                src="https://food.grab.com/static/page-home/bottom-food-options.svg"
                                alt="Curated restaurants"
                                className="promo-image"
                                onError={(e) => {
                                    // Fallback to a placeholder if SVG fails
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=200&fit=crop';
                                }}
                            />
                        </div>
                        <h3 className="promo-card-title">{t('appPromo.curatedTitle')}</h3>
                        <p className="promo-card-desc">
                            {t('appPromo.curatedDesc')}
                        </p>
                    </div>

                    {/* App Features */}
                    <div className="promo-card animate-on-scroll delay-200">
                        <div className="promo-image-wrapper">
                            {/* App illustration using reliable image */}
                            <img
                                src="https://food.grab.com/static/images/ilus-cool-features-app.svg"
                                alt="App features"
                                className="promo-image"
                                onError={(e) => {
                                    // Fallback to a placeholder if SVG fails
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300&h=200&fit=crop';
                                }}
                            />
                        </div>
                        <h3 className="promo-card-title">{t('appPromo.appTitle')}</h3>
                        <p className="promo-card-desc">
                            {t('appPromo.appDesc')}
                        </p>
                        <div className="promo-store-btns">
                            <a href="#">
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                                    alt="App Store"
                                    className="store-btn-img"
                                />
                            </a>
                            <a href="#">
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                                    alt="Google Play"
                                    className="store-btn-img"
                                />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AppPromo;
