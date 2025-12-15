import React, { useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
    };

    return (
        <div className={`toast toast-${type}`}>
            <span className="toast-icon">{icons[type]}</span>
            <p className="toast-message">{message}</p>
            <button className="toast-close" onClick={onClose}>×</button>
        </div>
    );
};

export default Toast;
