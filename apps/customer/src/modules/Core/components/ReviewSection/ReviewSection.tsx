import { useState } from 'react';
import { createReview, type ReviewResponse } from '../../../../services/reviewService';
import './ReviewSection.css';

interface ReviewSectionProps {
    orderId: number;
    existingReview: ReviewResponse | null;
    onReviewSubmitted: () => void;
}

const StarIcon = ({ filled, hovered }: { filled: boolean; hovered: boolean }) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill={filled || hovered ? '#f59e0b' : 'none'} stroke={filled || hovered ? '#f59e0b' : '#d1d5db'} strokeWidth="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

const ReviewSection = ({ orderId, existingReview, onReviewSubmitted }: ReviewSectionProps) => {
    const [rating, setRating] = useState(0);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [justSubmitted, setJustSubmitted] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) return;

        setIsSubmitting(true);
        try {
            await createReview({ orderId, rating, comment: comment.trim() || undefined });
            setJustSubmitted(true);
            setTimeout(() => {
                onReviewSubmitted();
            }, 1500);
        } catch (err: any) {
            console.error('Failed to submit review:', err);
            alert(err.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Read-only: show existing review
    if (existingReview) {
        return (
            <div className="review-section">
                <h4 className="review-section-title">
                    Đánh giá của bạn
                </h4>
                <div className="existing-review">
                    <div className="star-display">
                        {[1, 2, 3, 4, 5].map(star => (
                            <StarIcon key={star} filled={star <= existingReview.rating} hovered={false} />
                        ))}
                        <span className="rating-value">{existingReview.rating}/5</span>
                    </div>
                    {existingReview.comment && (
                        <p className="review-comment-text">"{existingReview.comment}"</p>
                    )}
                    <span className="review-date">
                        {new Date(existingReview.createdAt).toLocaleDateString('vi-VN', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                        })}
                    </span>
                </div>
            </div>
        );
    }

    // Success state
    if (justSubmitted) {
        return (
            <div className="review-section">
                <div className="review-success">
                    <span className="success-icon">🎉</span>
                    <p>Cảm ơn bạn đã đánh giá!</p>
                </div>
            </div>
        );
    }

    // Form: write new review
    return (
        <div className="review-section">
            <h4 className="review-section-title">
                Đánh giá đơn hàng
            </h4>

            {/* Star Rating */}
            <div className="star-rating">
                {[1, 2, 3, 4, 5].map(star => (
                    <button
                        key={star}
                        className="star-btn"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                        type="button"
                        aria-label={`${star} sao`}
                    >
                        <StarIcon
                            filled={star <= rating}
                            hovered={star <= hoveredStar && star > rating}
                        />
                    </button>
                ))}

            </div>

            {/* Comment */}
            <textarea
                className="review-comment"
                placeholder="Chia sẻ trải nghiệm của bạn (không bắt buộc)..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                maxLength={500}
            />

            {/* Submit */}
            <button
                className="review-submit-btn"
                onClick={handleSubmit}
                disabled={rating === 0 || isSubmitting}
            >
                {isSubmitting ? (
                    <>
                        <span className="review-spinner" />
                        Đang gửi...
                    </>
                ) : (
                    'Gửi đánh giá'
                )}
            </button>
        </div>
    );
};

export default ReviewSection;
