import React from 'react';
import './SupportPages.css';

const Privacy = () => {
    return (
        <div className="support-container">
            <div className="support-header">
                <h1>Privacy Policy</h1>
                <p>We value your privacy and are committed to protecting your personal data.</p>
            </div>

            <div className="support-content">
                <div className="text-block">
                    <h3>Information We Collect</h3>
                    <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact customer support. This may include your name, email address, shipping address, and payment information.</p>
                </div>

                <div className="text-block">
                    <h3>How We Use Your Information</h3>
                    <p>We use the information we collect to process your orders, communicate with you, and improve our services. We do not sell or share your personal information with third parties for marketing purposes.</p>
                </div>

                <div className="text-block">
                    <h3>Security</h3>
                    <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</p>
                </div>

                <div className="text-block">
                    <h3>Cookies</h3>
                    <p>We use cookies to enhance your shopping experience and analyze site traffic. You can choose to disable cookies through your browser settings.</p>
                </div>
            </div>
        </div>
    );
};

export default Privacy;
