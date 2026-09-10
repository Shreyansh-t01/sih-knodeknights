import React from 'react';

export default function Footer({ onOpenRegister, onShowToast }) {
  const handleLegalClick = (e, name) => {
    e.preventDefault();
    onShowToast(`Displaying ${name}`, 'info');
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h5>Scholarship Portal</h5>
            <p>
              A digital citizen and student welfare interface designed to make student registration, application, verification and DBT benefit tracking transparent, streamlined, and accessible.
            </p>
          </div>
          <div>
            <h6>Scholarship</h6>
            <ul className="footer-links">
              <li><a href="#schemes">Available Schemes</a></li>
              <li><a href="#eligibility">Eligibility Criteria</a></li>
              <li><a href="#process">How to Apply</a></li>
              <li><a href="#dates">Important Dates</a></li>
            </ul>
          </div>
          <div>
            <h6>Student Services</h6>
            <ul className="footer-links">
              <li>
                <a
                  href="#home"
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenRegister();
                  }}
                >
                  New Registration
                </a>
              </li>
              <li><a href="#tracker">Track Application</a></li>
              <li><a href="#eligibility">Document Upload</a></li>
              <li><a href="#tracker">Payment Status</a></li>
            </ul>
          </div>
          <div>
            <h6>Support &amp; Legal</h6>
            <ul className="footer-links">
              <li><a href="#help">Help Desk</a></li>
              <li><a href="#help">Frequently Asked Questions</a></li>
              <li>
                <a href="#" onClick={(e) => handleLegalClick(e, 'Privacy Policy')}>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => handleLegalClick(e, 'Terms & Conditions')}>
                  Terms &amp; Conditions
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Scholarship &amp; Student Welfare Portal. All Rights Reserved.</span>
          <span>Official Design Portal for State Government Student-Welfare Services</span>
        </div>
      </div>
    </footer>
  );
}
