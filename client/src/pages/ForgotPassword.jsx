import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import './Login.css'; // Reusing auth styles

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/api/auth/forgotpassword', { email });
            showToast('Reset link sent! Check your email (or server console)', 'success');
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to send email', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <h2 className="auth-title">Forgot Password?</h2>
                    <p className="auth-subtitle">Enter your email to reset it</p>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Enter your email"
                            />
                        </div>

                        <button type="submit" className="btn-auth" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>

                    <p className="auth-switch">
                        Remembered? <Link to="/login">Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
