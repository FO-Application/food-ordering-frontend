import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';
import reviewService, { type ReviewResponse } from '../../services/reviewService';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './ReviewManagement.css';

const ReviewManagementPage: React.FC = () => {
    const [reviews, setReviews] = useState<ReviewResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [restaurantId, setRestaurantId] = useState<number>(0);
    const [stats, setStats] = useState({ avgRating: 0, total: 0, distribution: [0, 0, 0, 0, 0] });
    const [filterRating, setFilterRating] = useState<number | null>(null);

    useEffect(() => {
        const storedId = localStorage.getItem('currentRestaurantId');
        if (storedId) {
            setRestaurantId(Number(storedId));
        } else {
            setIsLoading(false);
        }
    }, []);

    const loadReviews = useCallback(async () => {
        if (!restaurantId) return;
        setIsLoading(true);
        try {
            const res = await reviewService.getReviewsByMerchant(restaurantId, page, 10);
            if (res.result) {
                let reviewList = res.result.content || [];

                // Filter by rating if set
                if (filterRating !== null) {
                    reviewList = reviewList.filter((r: ReviewResponse) => Math.floor(r.rating) === filterRating);
                }

                setReviews(reviewList);
                setTotalPages(res.result.totalPages || 0);
                setTotalElements(res.result.totalElements || 0);

                // Calculate stats from all reviews
                const allReviews = res.result.content || [];
                if (allReviews.length > 0) {
                    const avg = allReviews.reduce((sum: number, r: ReviewResponse) => sum + r.rating, 0) / allReviews.length;
                    const dist = [0, 0, 0, 0, 0];
                    allReviews.forEach((r: ReviewResponse) => {
                        const star = Math.min(5, Math.max(1, Math.floor(r.rating)));
                        dist[star - 1]++;
                    });
                    setStats({ avgRating: avg, total: allReviews.length, distribution: dist });
                }
            }
        } catch (error) {
            console.error('Failed to load reviews:', error);
        } finally {
            setIsLoading(false);
        }
    }, [restaurantId, page, filterRating]);

    useEffect(() => {
        if (restaurantId) {
            loadReviews();
        }
    }, [loadReviews, restaurantId]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalf = rating - fullStars >= 0.5;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<span key={i} className="star filled">★</span>);
            } else if (i === fullStars && hasHalf) {
                stars.push(<span key={i} className="star half">★</span>);
            } else {
                stars.push(<span key={i} className="star empty">★</span>);
            }
        }
        return stars;
    };

    if (!restaurantId && !isLoading) {
        return (
            <DashboardLayout pageTitle="Đánh giá">
                <div className="empty-state">
                    <h4>Chưa chọn nhà hàng</h4>
                    <p>Vui lòng chọn nhà hàng để xem đánh giá.</p>
                </div>
            </DashboardLayout>
        );
    }

    if (isLoading && reviews.length === 0) {
        return (
            <DashboardLayout pageTitle="Đánh giá">
                <LoadingSpinner message="Đang tải đánh giá..." size="medium" />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout pageTitle="Đánh giá">
            <div className="review-management-page">
                <div className="management-header">
                    <h3 className="management-title">Đánh giá từ khách hàng</h3>
                </div>

                {/* Stats Overview */}
                <div className="review-stats">
                    <div className="stat-main">
                        <div className="stat-rating">{stats.avgRating.toFixed(1)}</div>
                        <div className="stat-stars">{renderStars(stats.avgRating)}</div>
                        <div className="stat-total">{stats.total} đánh giá</div>
                    </div>
                    <div className="stat-distribution">
                        {[5, 4, 3, 2, 1].map(star => {
                            const count = stats.distribution[star - 1];
                            const percent = stats.total > 0 ? (count / stats.total) * 100 : 0;
                            return (
                                <div
                                    key={star}
                                    className={`dist-row ${filterRating === star ? 'active' : ''}`}
                                    onClick={() => setFilterRating(filterRating === star ? null : star)}
                                >
                                    <span className="dist-star">{star} ★</span>
                                    <div className="dist-bar">
                                        <div className="dist-fill" style={{ width: `${percent}%` }}></div>
                                    </div>
                                    <span className="dist-count">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Filter indicator */}
                {filterRating !== null && (
                    <div className="filter-indicator">
                        <span>Đang lọc: {filterRating} sao</span>
                        <button onClick={() => setFilterRating(null)}>Xóa bộ lọc</button>
                    </div>
                )}

                {/* Reviews List */}
                {reviews.length === 0 ? (
                    <div className="empty-state">
                        <h4>Chưa có đánh giá</h4>
                        <p>{filterRating !== null ? `Không có đánh giá ${filterRating} sao nào.` : 'Nhà hàng chưa nhận được đánh giá nào.'}</p>
                    </div>
                ) : (
                    <div className="reviews-list">
                        {reviews.map(review => (
                            <div key={review.id} className="review-card">
                                <div className="review-header">
                                    <div className="reviewer-info">
                                        <div className="reviewer-avatar">
                                            {(review.userName || 'K').charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="reviewer-name">{review.userName || `Khách hàng #${review.userId}`}</div>
                                            <div className="review-date">{formatDate(review.createdAt)}</div>
                                        </div>
                                    </div>
                                    <div className="review-rating">
                                        {renderStars(review.rating)}
                                        <span className="rating-number">{review.rating.toFixed(1)}</span>
                                    </div>
                                </div>
                                {review.comment && (
                                    <div className="review-content">
                                        {review.comment}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            className="btn-secondary"
                            disabled={page === 0}
                            onClick={() => setPage(p => p - 1)}
                        >
                            Trước
                        </button>
                        <span>Trang {page + 1} / {totalPages}</span>
                        <button
                            className="btn-secondary"
                            disabled={page >= totalPages - 1}
                            onClick={() => setPage(p => p + 1)}
                        >
                            Sau
                        </button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ReviewManagementPage;
