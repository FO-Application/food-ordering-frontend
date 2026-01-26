import './HowItWorks.css';

// Simple outline SVG icons
const icons = {
    // Mobile phone icon
    phone: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
    ),
    // Location pin icon
    location: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    ),
    // Credit card icon
    card: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
    ),
    // Fork and knife / dining icon
    dining: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
            <path d="M7 2v20" />
            <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
        </svg>
    ),
    // Arrow right icon
    arrow: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
        </svg>
    ),
};

interface Step {
    id: number;
    icon: React.ReactNode;
    title: string;
    description: string;
}

const HowItWorks = () => {
    const steps: Step[] = [
        {
            id: 1,
            icon: icons.phone,
            title: 'Chọn món ăn',
            description: 'Duyệt qua hàng ngàn món ăn từ các nhà hàng yêu thích của bạn',
        },
        {
            id: 2,
            icon: icons.location,
            title: 'Nhập địa chỉ',
            description: 'Điền địa chỉ giao hàng để chúng tôi tìm nhà hàng gần bạn nhất',
        },
        {
            id: 3,
            icon: icons.card,
            title: 'Thanh toán',
            description: 'Thanh toán an toàn với nhiều phương thức: tiền mặt, thẻ, ví điện tử',
        },
        {
            id: 4,
            icon: icons.dining,
            title: 'Thưởng thức',
            description: 'Nhận món ăn nóng hổi tại nhà và tận hưởng bữa ăn ngon',
        },
    ];

    return (
        <section className="how-it-works" id="how-it-works">
            <div className="how-it-works-container">
                <div className="how-it-works-header">
                    <h2 className="how-it-works-title">
                        <span className="how-it-works-title-icon">{icons.arrow}</span>
                        Đặt món dễ dàng
                    </h2>
                    <p className="how-it-works-subtitle">
                        Chỉ với 4 bước đơn giản, bạn đã có thể thưởng thức món ăn yêu thích
                    </p>
                </div>

                <div className="how-it-works-steps">
                    {steps.map((step) => (
                        <div key={step.id} className="step-card">
                            <div className="step-number">{step.id}</div>
                            <div className="step-content">
                                <div className="step-icon">{step.icon}</div>
                                <h3 className="step-title">{step.title}</h3>
                                <p className="step-description">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="how-it-works-cta">
                    <div className="how-it-works-cta-content">
                        <h3 className="how-it-works-cta-title">
                            Sẵn sàng đặt món đầu tiên?
                        </h3>
                        <p className="how-it-works-cta-text">
                            Đăng ký ngay để nhận ưu đãi 50% cho đơn hàng đầu tiên
                        </p>
                        <button className="how-it-works-cta-btn">
                            Đặt món ngay
                            <span>→</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
