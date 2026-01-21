import './HowItWorks.css';

interface Step {
    id: number;
    icon: string;
    title: string;
    description: string;
}

const HowItWorks = () => {
    const steps: Step[] = [
        {
            id: 1,
            icon: '📱',
            title: 'Chọn món ăn',
            description: 'Duyệt qua hàng ngàn món ăn từ các nhà hàng yêu thích của bạn',
        },
        {
            id: 2,
            icon: '📍',
            title: 'Nhập địa chỉ',
            description: 'Điền địa chỉ giao hàng để chúng tôi tìm nhà hàng gần bạn nhất',
        },
        {
            id: 3,
            icon: '💳',
            title: 'Thanh toán',
            description: 'Thanh toán an toàn với nhiều phương thức: tiền mặt, thẻ, ví điện tử',
        },
        {
            id: 4,
            icon: '🍽️',
            title: 'Thưởng thức',
            description: 'Nhận món ăn nóng hổi tại nhà và tận hưởng bữa ăn ngon',
        },
    ];

    return (
        <section className="how-it-works" id="how-it-works">
            <div className="how-it-works-container">
                <div className="how-it-works-header">
                    <h2 className="how-it-works-title">
                        <span className="how-it-works-title-icon">🚀</span>
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
