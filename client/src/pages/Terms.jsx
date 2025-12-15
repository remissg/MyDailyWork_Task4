import React from 'react';
import './SupportPages.css';

const Terms = () => {
    return (
        <div className="support-container">
            <div className="support-header">
                <h1>Terms of Service</h1>
                <p>Please read these terms carefully before using our services.</p>
            </div>

            <div className="support-content">
                <div className="text-block">
                    <h3>1. Acceptance of Terms</h3>
                    <p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>
                </div>

                <div className="text-block">
                    <h3>2. Use of License</h3>
                    <p>Permission is granted to temporarily download one copy of the materials (information or software) on E-Shop's website for personal, non-commercial transitory viewing only.</p>
                </div>

                <div className="text-block">
                    <h3>3. Disclaimer</h3>
                    <p>The materials on E-Shop's website are provided "as is". E-Shop makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties.</p>
                </div>

                <div className="text-block">
                    <h3>4. Limitations</h3>
                    <p>In no event shall E-Shop or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on E-Shop's website.</p>
                </div>
            </div>
        </div>
    );
};

export default Terms;
