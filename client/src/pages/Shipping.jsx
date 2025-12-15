import React from 'react';
import './SupportPages.css';

const Shipping = () => {
    return (
        <div className="support-container">
            <div className="support-header">
                <h1>Shipping & Delivery</h1>
                <p>Everything you need to know about getting your order.</p>
            </div>

            <div className="support-content">
                <div className="text-block">
                    <h3>Delivery Timelines</h3>
                    <p>We process all orders within 1-2 business days. Once shipped, here are the estimated delivery times:</p>
                    <ul>
                        <li><strong>Standard Shipping:</strong> 5-7 business days</li>
                        <li><strong>Express Shipping:</strong> 2-3 business days</li>
                        <li><strong>International:</strong> 10-15 business days</li>
                    </ul>
                </div>

                <div className="text-block">
                    <h3>Shipping Costs</h3>
                    <p>Shipping costs are calculated based on the weight of your order and the delivery location. Free shipping applies to all orders over ₹999.</p>
                </div>

                <div className="text-block">
                    <h3>Tracking Your Order</h3>
                    <p>Once your order has been shipped, you will receive a confirmation email with a tracking number. You can track your package directly through the carrier's website.</p>
                </div>
            </div>
        </div>
    );
};

export default Shipping;
