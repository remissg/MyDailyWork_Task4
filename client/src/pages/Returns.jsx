import React from 'react';
import './SupportPages.css';

const Returns = () => {
    return (
        <div className="support-container">
            <div className="support-header">
                <h1>Returns & Refunds</h1>
                <p>Hassle-free returns for your peace of mind.</p>
            </div>

            <div className="support-content">
                <div className="text-block">
                    <h3>Our Return Policy</h3>
                    <p>If you're not completely satisfied with your purchase, we accept returns within 30 days of delivery. Items must be unused, in original packaging, and with all tags attached.</p>
                </div>

                <div className="text-block">
                    <h3>How to Initiate a Return</h3>
                    <p>To start a return, please contact our support team with your order ID. We will provide you with a return shipping label and instructions on how to send back your package.</p>
                </div>

                <div className="text-block">
                    <h3>Refund Process</h3>
                    <p>Once we receive your return, we will inspect the item and notify you of the approval or rejection of your refund. If approved, your refund will be processed to your original method of payment within 5-7 business days.</p>
                </div>
            </div>
        </div>
    );
};

export default Returns;
