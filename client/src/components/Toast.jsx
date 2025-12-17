import React, { useEffect, useState } from 'react';
import './Toast.css';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
    const [isPaused, setIsPaused] = useState(false);
    const [progress, setProgress] = useState(100);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        let timer;
        let startTime = Date.now();
        let remainingTime = duration;

        const startTimer = () => {
            startTime = Date.now();
            timer = setTimeout(() => {
                handleClose();
            }, remainingTime);
        };

        const pauseTimer = () => {
            clearTimeout(timer);
            remainingTime -= Date.now() - startTime;
        };

        if (!isPaused) {
            startTimer();
        } else {
            pauseTimer();
        }

        return () => clearTimeout(timer);
    }, [isPaused, duration]);

    // Progress bar animation
    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            setProgress((prev) => {
                const nextProgress = prev - (100 / (duration / 50));
                return nextProgress > 0 ? nextProgress : 0;
            });
        }, 50);

        return () => clearInterval(interval);
    }, [isPaused, duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            onClose();
        }, 300); // Match animation duration
    };

    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠',
    };

    const ariaLabels = {
        success: 'Success notification',
        error: 'Error notification',
        info: 'Information notification',
        warning: 'Warning notification',
    };

    return (
        <div
            className={`toast toast-${type} ${isExiting ? 'exiting' : ''}`}
            role="alert"
            aria-live={type === 'error' ? 'assertive' : 'polite'}
            aria-label={ariaLabels[type]}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <span className="toast-icon" aria-hidden="true">{icons[type]}</span>
            <p className="toast-message">{message}</p>
            <button
                className="toast-close"
                onClick={handleClose}
                aria-label="Close notification"
            >
                ×
            </button>
            <div className="toast-progress-bar" style={{ width: `${progress}%` }} />
        </div>
    );
};

export default Toast;
