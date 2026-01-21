import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './InfoSection.css';

const InfoSection = () => {
    const { t } = useTranslation();
    const sectionRef = useRef<HTMLDivElement>(null);
    const [isExpanded, setIsExpanded] = useState(false);

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
    }, [isExpanded]); // Re-observe when expanded changes to animate new content

    const benefits = [
        { title: t('info.quickest'), desc: t('info.quickestDesc') },
        { title: t('info.easiest'), desc: t('info.easiestDesc') },
        { title: t('info.variety'), desc: t('info.varietyDesc') },
        { title: t('info.payment'), desc: t('info.paymentDesc') },
        { title: t('info.rewards'), desc: t('info.rewardsDesc') },
    ];

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <section className="info-section" ref={sectionRef}>
            <div className="info-container">
                {/* Why Fast Bite */}
                <div className="info-block animate-on-scroll">
                    <h2 className="info-title">{t('info.whyTitle')}</h2>
                    <ul className="benefit-list">
                        {benefits.map((benefit, index) => (
                            <li key={index} className="benefit-item">
                                <span className="benefit-icon">✓</span>
                                <p className="benefit-content">
                                    <span className="benefit-title">{benefit.title}</span>
                                    {benefit.desc}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* FAQ Summary */}
                <div className="info-block animate-on-scroll delay-200">
                    <h2 className="info-title">{t('info.faqTitle')}</h2>

                    {/* Intro FAQ */}
                    <div className="faq-item">
                        <h3 className="faq-title">{t('info.whatIs')}</h3>
                        <p className="faq-content">{t('info.whatIsDesc')}</p>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                        <div className="faq-expanded">
                            <div className="faq-item animate-on-scroll">
                                <h3 className="faq-title">{t('info.howToOrder')}</h3>
                                <p className="faq-content">{t('info.howToOrderDesc')}</p>
                                <ul className="faq-steps">
                                    <li>{t('info.step1')}</li>
                                    <li>{t('info.step2')}</li>
                                    <li>{t('info.step3')}</li>
                                </ul>
                            </div>

                            <div className="faq-item animate-on-scroll">
                                <h3 className="faq-title">{t('info.247Service')}</h3>
                                <p className="faq-content">{t('info.247ServiceDesc')}</p>
                            </div>

                            <div className="faq-item animate-on-scroll">
                                <h3 className="faq-title">{t('info.cashPayment')}</h3>
                                <p className="faq-content">{t('info.cashPaymentDesc')}</p>
                            </div>

                            <div className="faq-item animate-on-scroll">
                                <h3 className="faq-title">{t('info.onlinePayment')}</h3>
                                <p className="faq-content">{t('info.onlinePaymentDesc')}</p>
                            </div>

                            <div className="faq-item animate-on-scroll">
                                <h3 className="faq-title">{t('info.orderForOthers')}</h3>
                                <p className="faq-content">{t('info.orderForOthersDesc')}</p>
                            </div>

                            <div className="faq-item animate-on-scroll">
                                <h3 className="faq-title">{t('info.deliveryFee')}</h3>
                                <p className="faq-content">{t('info.deliveryFeeDesc')}</p>
                            </div>

                            <div className="faq-item animate-on-scroll">
                                <h3 className="faq-title">{t('info.restaurants')}</h3>
                                <p className="faq-content">{t('info.restaurantsDesc')}</p>
                            </div>

                            <div className="faq-item animate-on-scroll">
                                <h3 className="faq-title">{t('info.minOrder')}</h3>
                                <p className="faq-content">{t('info.minOrderDesc')}</p>
                            </div>
                        </div>
                    )}

                    <button className="btn-read-more" onClick={toggleExpand}>
                        {isExpanded ? t('info.readLess') : t('info.readMore')}
                    </button>
                </div>
            </div>
        </section>
    );
};

export default InfoSection;
