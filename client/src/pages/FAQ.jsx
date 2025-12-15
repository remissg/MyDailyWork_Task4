import React, { useState } from 'react';
import './SupportPages.css';

const FAQ = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const toggleAccordion = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    const faqs = [
        {
            question: "How do I track my order?",
            answer: "Once your order has shipped, you will receive an email with a tracking number and a link to track your package on the carrier's website."
        },
        {
            question: "What is your return policy?",
            answer: "We offer a 10-day return policy for unused items in their original packaging. Please visit our Returns & Refunds page for more details on how to initiate a return."
        },
        {
            question: "Do you ship internationally?",
            answer: "Yes, we ship to select international destinations. Shipping costs and delivery times vary by location and are calculated at checkout."
        },
        {
            question: "Can I change or cancel my order?",
            answer: "We process orders quickly, but if you need to make a change, please contact our support team immediately. If the order hasn't shipped, we will do our best to accommodate your request."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept detailed credit/debit cards (Visa, MasterCard, Amex) and PayPal. All transactions are secure and encrypted."
        },
        {
            question: "How do I contact customer support?",
            answer: "You can reach our customer support team via the Contact Us page, or by emailing support@buyhive.com. We typically respond within 24 hours."
        }
    ];

    return (
        <div className="support-container">
            <div className="support-header">
                <h1>Help Center</h1>
                <p>Find answers to common questions about our products and services.</p>
            </div>

            <div className="faq-list">
                {faqs.map((faq, index) => (
                    <div
                        key={index}
                        className={`faq-item ${activeIndex === index ? 'active' : ''}`}
                    >
                        <button
                            className="faq-question"
                            onClick={() => toggleAccordion(index)}
                        >
                            {faq.question}
                            <span className="icon-plus">+</span>
                        </button>
                        <div className="faq-answer">
                            <p>{faq.answer}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FAQ;
