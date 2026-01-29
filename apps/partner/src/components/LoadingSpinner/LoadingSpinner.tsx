
import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
    message?: string;
    size?: 'small' | 'medium' | 'large';
    fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    message = 'Đang tải...',
    size = 'medium',
    fullScreen = false
}) => {
    return (
        <div className={`loading-container ${fullScreen ? 'fullscreen' : ''}`}>
            <div className={`loading-spinner-wrapper ${size}`}>
                <div className="loading-spinner">
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring delay-1"></div>
                    <div className="spinner-ring delay-2"></div>
                </div>
                {message && <p className="loading-message">{message}</p>}
            </div>
        </div>
    );
};

export default LoadingSpinner;
