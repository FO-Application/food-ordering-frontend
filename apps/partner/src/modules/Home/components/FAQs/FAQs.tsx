import { useState } from 'react';
import './FAQs.css';

interface FAQ {
    id: number;
    question: string;
    answer: string;
}

const FAQs = () => {
    const [activeId, setActiveId] = useState<number | null>(1);

    const faqs: FAQ[] = [
        {
            id: 1,
            question: 'Fast Bite hoạt động như thế nào?',
            answer: 'Fast Bite kết nối bạn với hàng ngàn nhà hàng trong khu vực. Bạn chỉ cần chọn món ăn, nhập địa chỉ giao hàng và thanh toán. Đội ngũ giao hàng của chúng tôi sẽ mang món ăn nóng hổi đến tận cửa nhà bạn trong thời gian nhanh nhất.',
        },
        {
            id: 2,
            question: 'Thời gian giao hàng là bao lâu?',
            answer: 'Thời gian giao hàng trung bình từ 25-45 phút tùy thuộc vào khoảng cách và thời điểm đặt hàng. Bạn có thể theo dõi trạng thái đơn hàng trong thời gian thực trên ứng dụng.',
        },
        {
            id: 3,
            question: 'Tôi có thể thanh toán bằng những phương thức nào?',
            answer: 'Fast Bite hỗ trợ nhiều phương thức thanh toán: tiền mặt khi nhận hàng, thẻ tín dụng/ghi nợ, ví điện tử (MoMo, ZaloPay, VNPay), và chuyển khoản ngân hàng.',
        },
        {
            id: 4,
            question: 'Làm sao để trở thành nhà hàng đối tác?',
            answer: 'Nếu bạn là chủ nhà hàng và muốn hợp tác với Fast Bite, vui lòng liên hệ với chúng tôi qua email partnership@fastbite.vn hoặc đăng ký trực tiếp trên trang web trong mục "Đối tác nhà hàng".',
        },
        {
            id: 5,
            question: 'Chính sách hoàn tiền như thế nào?',
            answer: 'Nếu đơn hàng gặp vấn đề (sai món, thiếu món, chất lượng không đảm bảo), bạn có thể yêu cầu hoàn tiền trong vòng 24 giờ. Chúng tôi sẽ xử lý và hoàn tiền trong 3-5 ngày làm việc.',
        },
    ];

    const toggleFaq = (id: number) => {
        setActiveId(activeId === id ? null : id);
    };

    return (
        <section className="faqs" id="faqs">
            <div className="faqs-container">
                <div className="faqs-header">
                    <h2 className="faqs-title">
                        <span className="faqs-title-icon">❓</span>
                        Câu hỏi thường gặp
                    </h2>
                    <p className="faqs-subtitle">
                        Tìm câu trả lời cho những thắc mắc phổ biến nhất
                    </p>
                </div>

                <div className="faqs-list">
                    {faqs.map((faq) => (
                        <div
                            key={faq.id}
                            className={`faq-item ${activeId === faq.id ? 'active' : ''}`}
                        >
                            <button
                                className="faq-question"
                                onClick={() => toggleFaq(faq.id)}
                                aria-expanded={activeId === faq.id}
                            >
                                <span className="faq-question-text">{faq.question}</span>
                                <span className="faq-question-icon">+</span>
                            </button>
                            <div className="faq-answer">
                                <div className="faq-answer-content">
                                    <p className="faq-answer-text">{faq.answer}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="faqs-contact">
                    <p className="faqs-contact-text">
                        Bạn có câu hỏi khác? Liên hệ với chúng tôi!
                    </p>
                    <button className="faqs-contact-btn">
                        <span>📧</span>
                        Liên hệ hỗ trợ
                    </button>
                </div>
            </div>
        </section>
    );
};

export default FAQs;
