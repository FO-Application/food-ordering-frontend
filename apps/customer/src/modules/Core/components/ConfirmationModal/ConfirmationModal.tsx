import React from 'react';
import './ConfirmationModal.css';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    isDangerous?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    isDangerous = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="confirm-overlay">
            <div className="confirm-modal">
                <div className="confirm-header">
                    <h3>{title}</h3>
                </div>
                <div className="confirm-body">
                    <p>{message}</p>
                </div>
                <div className="confirm-footer">
                    <button className="confirm-btn cancel" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button
                        className={`confirm-btn submit ${isDangerous ? 'danger' : ''}`}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
