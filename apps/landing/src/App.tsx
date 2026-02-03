import { useState, useEffect } from 'react';
import './index.css';
import Icons from './Icons';

function App() {
    const [activeStep, setActiveStep] = useState(1);
    const [typingText, setTypingText] = useState('');
    const [showCartBadge, setShowCartBadge] = useState(false);
    const [isButtonPressed, setIsButtonPressed] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const addressText = '123 Nguyễn Huệ, Q.1, TP.HCM';

    // Typing animation for step 2
    useEffect(() => {
        if (activeStep === 2) {
            setTypingText('');
            let index = 0;
            const interval = setInterval(() => {
                if (index < addressText.length) {
                    setTypingText(addressText.slice(0, index + 1));
                    index++;
                } else {
                    clearInterval(interval);
                }
            }, 80);
            return () => clearInterval(interval);
        }
    }, [activeStep]);

    // Cart animation for step 4
    useEffect(() => {
        if (activeStep === 4) {
            setShowCartBadge(false);
            const timeout = setTimeout(() => setShowCartBadge(true), 500);
            return () => clearTimeout(timeout);
        }
    }, [activeStep]);

    // Button press animation for step 6
    useEffect(() => {
        if (activeStep === 6) {
            setIsButtonPressed(false);
            const timeout = setTimeout(() => {
                setIsButtonPressed(true);
                setTimeout(() => setIsButtonPressed(false), 200);
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [activeStep]);

    // Confetti for step 7
    useEffect(() => {
        if (activeStep === 7) {
            setShowConfetti(true);
            const timeout = setTimeout(() => setShowConfetti(false), 3000);
            return () => clearTimeout(timeout);
        }
    }, [activeStep]);

    const renderPhoneScreen = () => {
        switch (activeStep) {
            case 1:
                return (
                    <>
                        {/* App Header */}
                        <div className="app-header">
                            <div className="app-logo">
                                <span className="app-logo-fast">Fast</span>
                                <span className="app-logo-bite">Bite</span>
                            </div>
                            <div className="app-location">
                                <span className="location-icon">{Icons.location}</span>
                                <span>Quận 1, TP.HCM</span>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="app-search">
                            <span className="search-icon">{Icons.search}</span>
                            <span className="search-text">Tìm món ăn, nhà hàng...</span>
                        </div>

                        {/* Categories - Highlight "Đồ ăn" with pulse */}
                        <div className="app-categories">
                            <div className="category-item active pulsing">
                                <img className="cat-img" src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&h=100&fit=crop" alt="Đồ ăn" />
                                <span className="cat-name">Đồ ăn</span>
                                <div className="tap-indicator">{Icons.tap}</div>
                            </div>
                            <div className="category-item">
                                <img className="cat-img" src="https://images.unsplash.com/photo-1558857563-b371033873b8?w=100&h=100&fit=crop" alt="Trà sữa" />
                                <span className="cat-name">Trà sữa</span>
                            </div>
                            <div className="category-item">
                                <img className="cat-img" src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=100&h=100&fit=crop" alt="Cà phê" />
                                <span className="cat-name">Cà phê</span>
                            </div>
                        </div>

                        {/* Restaurant Cards */}
                        <div className="app-restaurants">
                            <div className="rest-card">
                                <img className="rest-img-real" src="https://images.unsplash.com/photo-1503764654157-72d979d9af2f?w=120&h=120&fit=crop" alt="Phở Bò Kho" />
                                <div className="rest-info">
                                    <span className="rest-name">Phở Bò Kho</span>
                                    <span className="rest-rating"><span className="star-icon">{Icons.star}</span> 4.8</span>
                                </div>
                            </div>
                            <div className="rest-card">
                                <img className="rest-img-real" src="https://images.unsplash.com/photo-1600688640154-9619e002df30?w=120&h=120&fit=crop" alt="Bánh Mì Sài Gòn" />
                                <div className="rest-info">
                                    <span className="rest-name">Bánh Mì Sài Gòn</span>
                                    <span className="rest-rating"><span className="star-icon">{Icons.star}</span> 4.9</span>
                                </div>
                            </div>
                            <div className="rest-card">
                                <img className="rest-img-real" src="https://images.unsplash.com/photo-1512058564366-18510be2db19?w=120&h=120&fit=crop" alt="Cơm Tấm 24h" />
                                <div className="rest-info">
                                    <span className="rest-name">Cơm Tấm 24h</span>
                                    <span className="rest-rating"><span className="star-icon">{Icons.star}</span> 4.7</span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Nav */}
                        <div className="app-nav">
                            <div className="nav-item active">
                                <span className="nav-icon">{Icons.home}</span>
                                <span>Trang chủ</span>
                            </div>
                            <div className="nav-item">
                                <span className="nav-icon">{Icons.search}</span>
                                <span>Tìm kiếm</span>
                            </div>
                            <div className="nav-item">
                                <span className="nav-icon">{Icons.orders}</span>
                                <span>Đơn hàng</span>
                            </div>
                            <div className="nav-item">
                                <span className="nav-icon">{Icons.user}</span>
                                <span>Tài khoản</span>
                            </div>
                        </div>
                    </>
                );

            case 2:
                return (
                    <>
                        {/* Header with back button */}
                        <div className="app-header">
                            <span className="back-btn">{Icons.back}</span>
                            <span className="header-title">Địa chỉ giao hàng</span>
                            <span></span>
                        </div>

                        {/* Address Input with typing animation */}
                        <div className="address-screen">
                            <div className="address-input-container">
                                <span className="address-icon">{Icons.location}</span>
                                <div className="address-input">
                                    <span className="typing-text">{typingText}</span>
                                    <span className="cursor-blink">|</span>
                                </div>
                            </div>

                            <div className="address-suggestions">
                                <div className="suggestion-item">
                                    <span className="suggestion-icon">{Icons.home}</span>
                                    <div className="suggestion-text">
                                        <span className="suggestion-title">Nhà</span>
                                        <span className="suggestion-addr">123 Nguyễn Huệ, Quận 1</span>
                                    </div>
                                </div>
                                <div className="suggestion-item">
                                    <span className="suggestion-icon">{Icons.building}</span>
                                    <div className="suggestion-text">
                                        <span className="suggestion-title">Công ty</span>
                                        <span className="suggestion-addr">456 Lê Lợi, Quận 1</span>
                                    </div>
                                </div>
                            </div>

                            <button className="confirm-address-btn pulsing">Xác nhận địa chỉ</button>
                        </div>

                        {/* Bottom Nav */}
                        <div className="app-nav">
                            <div className="nav-item active">
                                <span className="nav-icon">{Icons.home}</span>
                                <span>Trang chủ</span>
                            </div>
                            <div className="nav-item">
                                <span className="nav-icon">{Icons.search}</span>
                                <span>Tìm kiếm</span>
                            </div>
                            <div className="nav-item">
                                <span className="nav-icon">{Icons.orders}</span>
                                <span>Đơn hàng</span>
                            </div>
                            <div className="nav-item">
                                <span className="nav-icon">{Icons.user}</span>
                                <span>Tài khoản</span>
                            </div>
                        </div>
                    </>
                );

            case 3:
                return (
                    <>
                        {/* App Header */}
                        <div className="app-header">
                            <div className="app-logo">
                                <span className="app-logo-fast">Fast</span>
                                <span className="app-logo-bite">Bite</span>
                            </div>
                            <div className="app-location">
                                <span className="location-icon">{Icons.location}</span>
                                <span>123 Nguyễn Huệ</span>
                            </div>
                        </div>

                        {/* Title */}
                        <div className="section-header">
                            <span>Nhà hàng gần bạn</span>
                        </div>

                        {/* Restaurant Cards - one highlighted */}
                        <div className="app-restaurants">
                            <div className="rest-card selected pulsing">
                                <div className="rest-img-wrapper">
                                    <img className="rest-img-real" src="https://images.unsplash.com/photo-1503764654157-72d979d9af2f?w=120&h=120&fit=crop" alt="Phở Bò Kho" />
                                    <div className="selected-badge">{Icons.check}</div>
                                </div>
                                <div className="rest-info">
                                    <span className="rest-name">Phở Bò Kho</span>
                                    <span className="rest-rating"><span className="star-icon">{Icons.star}</span> 4.8 • 15 phút</span>
                                </div>
                                <div className="tap-indicator">{Icons.tap}</div>
                            </div>
                            <div className="rest-card">
                                <img className="rest-img-real" src="https://images.unsplash.com/photo-1600688640154-9619e002df30?w=120&h=120&fit=crop" alt="Bánh Mì Sài Gòn" />
                                <div className="rest-info">
                                    <span className="rest-name">Bánh Mì Sài Gòn</span>
                                    <span className="rest-rating"><span className="star-icon">{Icons.star}</span> 4.9 • 20 phút</span>
                                </div>
                            </div>
                            <div className="rest-card">
                                <img className="rest-img-real" src="https://images.unsplash.com/photo-1512058564366-18510be2db19?w=120&h=120&fit=crop" alt="Cơm Tấm 24h" />
                                <div className="rest-info">
                                    <span className="rest-name">Cơm Tấm 24h</span>
                                    <span className="rest-rating"><span className="star-icon">{Icons.star}</span> 4.7 • 10 phút</span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Nav */}
                        <div className="app-nav">
                            <div className="nav-item active">
                                <span className="nav-icon">{Icons.home}</span>
                                <span>Trang chủ</span>
                            </div>
                            <div className="nav-item">
                                <span className="nav-icon">{Icons.search}</span>
                                <span>Tìm kiếm</span>
                            </div>
                            <div className="nav-item">
                                <span className="nav-icon">{Icons.orders}</span>
                                <span>Đơn hàng</span>
                            </div>
                            <div className="nav-item">
                                <span className="nav-icon">{Icons.user}</span>
                                <span>Tài khoản</span>
                            </div>
                        </div>
                    </>
                );

            case 4:
                return (
                    <>
                        {/* Header with restaurant name */}
                        <div className="app-header restaurant-header">
                            <span className="back-btn">{Icons.back}</span>
                            <span className="header-title">Phở Bò Kho</span>
                            <div className="cart-icon-wrapper">
                                <span className="cart-icon-svg">{Icons.cart}</span>
                                {showCartBadge && <span className="cart-badge bounce-in">1</span>}
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="menu-screen">
                            <div className="menu-category">Món phổ biến</div>

                            <div className="menu-item adding">
                                <img className="menu-img-real" src="https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=120&h=120&fit=crop" alt="Phở Bò Tái" />
                                <div className="menu-info">
                                    <span className="menu-name">Phở Bò Tái</span>
                                    <span className="menu-desc">Phở với thịt bò tái chín</span>
                                    <span className="menu-price">55.000đ</span>
                                </div>
                                <button className={`add-btn ${showCartBadge ? 'added' : 'pulsing'}`}>
                                    {showCartBadge ? <span className="btn-check">{Icons.check}</span> : <span className="btn-plus">{Icons.plus}</span>}
                                </button>
                            </div>

                            <div className="menu-item">
                                <img className="menu-img-real" src="https://images.unsplash.com/photo-1503764654157-72d979d9af2f?w=120&h=120&fit=crop" alt="Phở Bò Kho" />
                                <div className="menu-info">
                                    <span className="menu-name">Phở Bò Kho</span>
                                    <span className="menu-desc">Phở với bò kho đặc biệt</span>
                                    <span className="menu-price">65.000đ</span>
                                </div>
                                <button className="add-btn"><span className="btn-plus">{Icons.plus}</span></button>
                            </div>

                            <div className="menu-item">
                                <img className="menu-img-real" src="https://images.unsplash.com/photo-1555126634-323283e090fa?w=120&h=120&fit=crop" alt="Phở Gà" />
                                <div className="menu-info">
                                    <span className="menu-name">Phở Gà</span>
                                    <span className="menu-desc">Phở với thịt gà ta</span>
                                    <span className="menu-price">50.000đ</span>
                                </div>
                                <button className="add-btn"><span className="btn-plus">{Icons.plus}</span></button>
                            </div>
                        </div>

                        {/* Bottom Nav */}
                        <div className="app-nav">
                            <div className="nav-item active">
                                <span className="nav-icon">{Icons.home}</span>
                                <span>Trang chủ</span>
                            </div>
                            <div className="nav-item">
                                <span className="nav-icon">{Icons.search}</span>
                                <span>Tìm kiếm</span>
                            </div>
                            <div className="nav-item">
                                <span className="nav-icon">{Icons.orders}</span>
                                <span>Đơn hàng</span>
                            </div>
                            <div className="nav-item">
                                <span className="nav-icon">{Icons.user}</span>
                                <span>Tài khoản</span>
                            </div>
                        </div>
                    </>
                );

            case 5:
                return (
                    <>
                        {/* Header */}
                        <div className="app-header">
                            <span className="back-btn">{Icons.back}</span>
                            <span className="header-title">Xác nhận đơn</span>
                            <span></span>
                        </div>

                        {/* Checkout Screen */}
                        <div className="checkout-screen">
                            <div className="checkout-section">
                                <div className="section-label">Ghi chú cho tài xế</div>
                                <div className="note-input pulsing">
                                    <span className="note-placeholder">Gọi khi đến, để ở cổng...</span>
                                </div>
                            </div>

                            <div className="checkout-section">
                                <div className="section-label">Mã khuyến mãi</div>
                                <div className="promo-input">
                                    <span className="promo-code">FAST50K</span>
                                    <span className="promo-applied">-50.000đ <span className="promo-check">{Icons.check}</span></span>
                                </div>
                            </div>

                            <div className="order-summary">
                                <div className="summary-row">
                                    <span>Phở Bò Tái x1</span>
                                    <span>55.000đ</span>
                                </div>
                                <div className="summary-row">
                                    <span>Phí giao hàng</span>
                                    <span>15.000đ</span>
                                </div>
                                <div className="summary-row discount">
                                    <span>Khuyến mãi</span>
                                    <span>-50.000đ</span>
                                </div>
                                <div className="summary-row total">
                                    <span>Tổng cộng</span>
                                    <span>20.000đ</span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Nav */}
                        <div className="app-nav">
                            <div className="nav-item active">
                                <span className="nav-icon">{Icons.home}</span>
                                <span>Trang chủ</span>
                            </div>
                            <div className="nav-item">
                                <span className="nav-icon">{Icons.search}</span>
                                <span>Tìm kiếm</span>
                            </div>
                            <div className="nav-item">
                                <span className="nav-icon">{Icons.orders}</span>
                                <span>Đơn hàng</span>
                            </div>
                            <div className="nav-item">
                                <span className="nav-icon">{Icons.user}</span>
                                <span>Tài khoản</span>
                            </div>
                        </div>
                    </>
                );

            case 6:
                return (
                    <>
                        {/* Header */}
                        <div className="app-header">
                            <span className="back-btn">{Icons.back}</span>
                            <span className="header-title">Thanh toán</span>
                            <span></span>
                        </div>

                        {/* Payment Screen */}
                        <div className="payment-screen">
                            <div className="payment-method">
                                <span className="payment-icon">{Icons.card}</span>
                                <div className="payment-info">
                                    <span className="payment-title">Tiền mặt</span>
                                    <span className="payment-desc">Thanh toán khi nhận hàng</span>
                                </div>
                                <span className="check-mark">{Icons.check}</span>
                            </div>

                            <div className="order-total-box">
                                <span className="total-label">Tổng thanh toán</span>
                                <span className="total-amount">20.000đ</span>
                            </div>

                            <button className={`order-btn ${isButtonPressed ? 'pressed' : 'pulsing'}`}>
                                <span className="btn-text"><span className="btn-bike">{Icons.bike}</span> Đặt hàng ngay</span>
                                <div className="tap-indicator">{Icons.tap}</div>
                            </button>
                        </div>

                        {/* Bottom Nav */}
                        <div className="app-nav">
                            <div className="nav-item active">
                                <span className="nav-icon">{Icons.home}</span>
                                <span>Trang chủ</span>
                            </div>
                            <div className="nav-item">
                                <span className="nav-icon">{Icons.search}</span>
                                <span>Tìm kiếm</span>
                            </div>
                            <div className="nav-item">
                                <span className="nav-icon">{Icons.orders}</span>
                                <span>Đơn hàng</span>
                            </div>
                            <div className="nav-item">
                                <span className="nav-icon">{Icons.user}</span>
                                <span>Tài khoản</span>
                            </div>
                        </div>
                    </>
                );

            case 7:
                return (
                    <>
                        {/* Success Screen */}
                        <div className="success-screen">
                            {showConfetti && (
                                <div className="confetti-container">
                                    {[...Array(20)].map((_, i) => (
                                        <div key={i} className={`confetti confetti-${i % 5}`} style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 0.5}s` }}></div>
                                    ))}
                                </div>
                            )}

                            <div className="success-icon-wrapper">
                                <div className="success-icon">{Icons.check}</div>
                            </div>

                            <h2 className="success-title">Đặt hàng thành công!</h2>
                            <p className="success-subtitle">Đơn hàng #FB12345</p>

                            <div className="delivery-info">
                                <div className="delivery-row">
                                    <span className="delivery-icon">{Icons.bike}</span>
                                    <span>Dự kiến giao trong 25-30 phút</span>
                                </div>
                                <div className="delivery-row">
                                    <span className="delivery-icon">{Icons.location}</span>
                                    <span>123 Nguyễn Huệ, Q.1</span>
                                </div>
                            </div>

                            <button className="track-order-btn">Theo dõi đơn hàng</button>
                        </div>

                        {/* Bottom Nav */}
                        <div className="app-nav">
                            <div className="nav-item">
                                <span className="nav-icon">{Icons.home}</span>
                                <span>Trang chủ</span>
                            </div>
                            <div className="nav-item">
                                <span className="nav-icon">{Icons.search}</span>
                                <span>Tìm kiếm</span>
                            </div>
                            <div className="nav-item active">
                                <span className="nav-icon">{Icons.orders}</span>
                                <span>Đơn hàng</span>
                            </div>
                            <div className="nav-item">
                                <span className="nav-icon">{Icons.user}</span>
                                <span>Tài khoản</span>
                            </div>
                        </div>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <div className="landing-page">
            {/* Header */}
            <header className="header">
                <div className="header-container">
                    <div className="header-left">
                        <a href="/" className="header-logo">
                            <span className="logo-fast">Fast</span>
                            <span className="logo-bite">Bite</span>
                        </a>
                    </div>

                    <div className="header-right">
                        <a href="http://localhost:3003/login" className="header-link">
                            Trở thành Đối tác của Fast Bite ▾
                        </a>
                        <a href="#" className="header-link">Trung tâm Hỗ trợ</a>
                        <span className="header-lang">Tiếng Việt ▾</span>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-text">
                    <h1 className="hero-title">Fast Bite</h1>
                    <p className="hero-subtitle">Thèm món gì - Đặt ngay món đó!</p>

                    <a href="http://localhost:3001" className="btn-order">
                        Đặt hàng ngay
                    </a>

                    <p className="hero-partner">
                        Trở thành Đối tác Nhà hàng của Fast Bite ngay!{' '}
                        <a href="http://localhost:3003/login">Ấn vào đây.</a>
                    </p>
                </div>
            </section>

            {/* Floating Partner Button */}
            <a href="http://localhost:3003/login" className="floating-btn">
                <div className="floating-icon-wrapper">
                    <svg className="floating-person-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="7" r="4" />
                        <path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2" />
                    </svg>
                    <span className="floating-badge">Fast<br />Bite</span>
                </div>
                <span className="floating-text">Trở Thành<br />Nhà Hàng<br />Đối Tác</span>
            </a>

            {/* Intro Section */}
            <section className="intro">
                <div className="intro-container">
                    <h2 className="intro-title">Mang đến cho bạn món ăn ưa thích, nóng hổi và ngon lành</h2>
                    <p className="intro-text">
                        Đặt đồ ăn giao hàng tận nhà nhanh chóng lấp đầy chiếc bụng đói của bạn với những món ngon yêu thích
                        và dịch vụ giao hàng "thần tốc". Fast Bite hiện đang có mặt tại nhiều tỉnh thành ở Việt Nam:
                        Thành phố Hồ Chí Minh, Hà Nội, Đà Nẵng, Vũng Tàu, Bình Dương, Đồng Nai, Cần Thơ, Đà Lạt,...
                    </p>
                    <p className="intro-subtext">
                        Chúng tôi đang dần mở rộng thêm nhiều khu vực trong thời gian tới!
                    </p>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <div className="features-container">
                    <div className="feature">
                        <h3>Đặt đồ ăn online chỉ sau vài cú chạm.</h3>
                        <p>Fast Bite giao hàng nhanh thần tốc, đảm bảo mang cho bạn bữa ăn nóng hổi và ngon lành, dù bạn đang ở đâu.</p>
                    </div>
                    <div className="feature">
                        <h3>Đa dạng lựa chọn.</h3>
                        <p>Danh sách đa dạng các món ăn của chúng tôi có thể phục vụ cho mọi nhu cầu ăn uống của bạn.</p>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="how-it-works">
                <div className="how-container">
                    <h2>Sẵn sàng đặt món ăn cùng Fast Bite</h2>

                    <div className="how-content">
                        {/* 3D iPhone 17 Pro Max Mockup */}
                        <div className="phone-3d-container">
                            <div className="phone-3d">
                                {/* Back face */}
                                <div className="phone-back"></div>

                                {/* Main phone frame */}
                                <div className="phone-frame">
                                    {/* Top edge */}
                                    <div className="phone-top-edge"></div>
                                    {/* Bottom edge */}
                                    <div className="phone-bottom-edge"></div>
                                    {/* Power button */}
                                    <div className="phone-power-btn"></div>
                                    {/* Volume buttons */}
                                    <div className="phone-volume-btns"></div>

                                    {/* Dynamic Island */}
                                    <div className="phone-notch"></div>

                                    {/* Screen */}
                                    <div className="phone-screen">
                                        {renderPhoneScreen()}
                                    </div>
                                </div>

                                {/* Phone Shadow */}
                                <div className="phone-shadow"></div>
                            </div>
                        </div>

                        {/* Steps - Now clickable */}
                        <div className="steps">
                            <div className={`step ${activeStep === 1 ? 'active' : ''}`} onClick={() => setActiveStep(1)}>
                                <div className={`step-num ${activeStep === 1 ? 'active' : ''}`}>1</div>
                                <div className="step-content">
                                    <p>Truy cập ứng dụng Fast Bite, chọn "Giao thức ăn".</p>
                                    <a href="http://localhost:3001" className="step-link">Đặt ngay</a>
                                </div>
                            </div>
                            <div className={`step ${activeStep === 2 ? 'active' : ''}`} onClick={() => setActiveStep(2)}>
                                <div className={`step-num ${activeStep === 2 ? 'active' : ''}`}>2</div>
                                <div className="step-content">
                                    <p>Điền địa chỉ giao thức ăn của bạn.</p>
                                </div>
                            </div>
                            <div className={`step ${activeStep === 3 ? 'active' : ''}`} onClick={() => setActiveStep(3)}>
                                <div className={`step-num ${activeStep === 3 ? 'active' : ''}`}>3</div>
                                <div className="step-content">
                                    <p>Lựa chọn nhà hàng yêu thích.</p>
                                </div>
                            </div>
                            <div className={`step ${activeStep === 4 ? 'active' : ''}`} onClick={() => setActiveStep(4)}>
                                <div className={`step-num ${activeStep === 4 ? 'active' : ''}`}>4</div>
                                <div className="step-content">
                                    <p>Lựa chọn món ăn từ nhà hàng.</p>
                                </div>
                            </div>
                            <div className={`step ${activeStep === 5 ? 'active' : ''}`} onClick={() => setActiveStep(5)}>
                                <div className={`step-num ${activeStep === 5 ? 'active' : ''}`}>5</div>
                                <div className="step-content">
                                    <p>Nhập ghi chú cho tài xế nếu cần và nhập mã khuyến mãi (nếu có).</p>
                                </div>
                            </div>
                            <div className={`step ${activeStep === 6 ? 'active' : ''}`} onClick={() => setActiveStep(6)}>
                                <div className={`step-num ${activeStep === 6 ? 'active' : ''}`}>6</div>
                                <div className="step-content">
                                    <p>Hoàn tất đơn đặt hàng.</p>
                                </div>
                            </div>
                            <div className={`step ${activeStep === 7 ? 'active' : ''}`} onClick={() => setActiveStep(7)}>
                                <div className={`step-num ${activeStep === 7 ? 'active' : ''}`}>7</div>
                                <div className="step-content">
                                    <p>Chuẩn bị tận hưởng bữa ăn nào!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-container">
                    <div className="footer-grid">
                        <div className="footer-col">
                            <a href="/" className="footer-logo">
                                <span className="logo-fast">Fast</span>
                                <span className="logo-bite">Bite</span>
                            </a>
                            <p>Ứng dụng đặt đồ ăn hàng đầu Việt Nam.</p>
                        </div>
                        <div className="footer-col">
                            <h4>Công ty</h4>
                            <a href="#">Về chúng tôi</a>
                            <a href="#">Trung tâm trợ giúp</a>
                            <a href="#">Điều khoản sử dụng</a>
                        </div>
                        <div className="footer-col">
                            <h4>Đối tác</h4>
                            <a href="http://localhost:3003">Đăng ký nhà hàng</a>
                            <a href="#">Tài xế</a>
                        </div>
                        <div className="footer-col">
                            <h4>Liên hệ</h4>
                            <a href="mailto:support@fastbite.vn">support@fastbite.vn</a>
                            <p>Hotline: 1900 xxxx</p>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>© 2026 Fast Bite. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default App;
