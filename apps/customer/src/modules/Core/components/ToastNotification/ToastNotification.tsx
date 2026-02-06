import React, { useEffect, useState } from 'react';
import './ToastNotification.css';

interface ToastNotificationProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    duration?: number;
    onClose: () => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
    message,
    type = 'success',
    duration = 3000,
    onClose
}) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for fade out animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    if (!message) return null;

    return (
        <div className={`toast-notification ${type} ${isVisible ? 'show' : 'hide'}`}>
            {/* Icon removed as requested */}
            <div className="toast-message" style={{ paddingLeft: 0 }}>{message}</div>
        </div>
    );
};

export default ToastNotification;
