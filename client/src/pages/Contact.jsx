import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import './SupportPages.css';

const Contact = () => {
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate API call
        setTimeout(() => {
            showToast('Message sent successfully! We will get back to you soon.', 'success');
            setFormData({ name: '', email: '', subject: '', message: '' });
        }, 800);
    };

    return (
        <div className="support-container">
            <div className="support-header">
                <h1>Contact Us</h1>
                <p>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
            </div>

            <div className="contact-grid">
                <div className="contact-info-card">
                    <div className="info-item">
                        <h4>📍 Address</h4>
                        <p>123, Tech Park, Sector 5,<br />Koramangala, Bangalore 560034</p>
                    </div>
                    <div className="info-item">
                        <h4>📧 Email</h4>
                        <p>support@eshop.in</p>
                    </div>
                    <div className="info-item">
                        <h4>📞 Phone</h4>
                        <p>+91 98765 43210</p>
                    </div>
                    <div className="info-item">
                        <h4>🕒 Hours</h4>
                        <p>Mon-Sat: 9am - 8pm IST</p>
                    </div>
                </div>

                <form className="contact-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            name="name"
                            required
                            placeholder="Your Name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            required
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Subject</label>
                        <input
                            type="text"
                            name="subject"
                            required
                            placeholder="How can we help?"
                            value={formData.subject}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Message</label>
                        <textarea
                            name="message"
                            rows="5"
                            required
                            placeholder="Tell us more about your inquiry..."
                            value={formData.message}
                            onChange={handleChange}
                        ></textarea>
                    </div>
                    <button type="submit" className="btn-submit">Send Message</button>
                </form>
            </div>
        </div>
    );
};

export default Contact;
