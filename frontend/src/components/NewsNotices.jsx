import React from 'react';
import ScrollReveal from './ScrollReveal';

export default function NewsNotices({ onShowToast }) {
  const news = [
    {
      date: '06 Sep 2026',
      title: 'Scholarship Application Portal Active',
      isNew: true,
      text: 'Students should complete registration and verify all entered academic and bank information before final submission.'
    },
    {
      date: '03 Sep 2026',
      title: 'Bank Account Aadhaar-Seeding Advisory',
      isNew: false,
      text: 'Ensure that your savings bank account is mapped to your active Aadhaar number for seamless Direct Benefit Transfer (DBT) credit.'
    },
    {
      date: '28 Aug 2026',
      title: 'Document Upload Guidelines Updated',
      isNew: false,
      text: 'Upload clearly readable PDF/JPEG files under 500 KB and ensure seal and signatures of issuing authorities are visible.'
    },
    {
      date: '22 Aug 2026',
      title: 'Real-Time Application Tracking Feature Available',
      isNew: false,
      text: 'Students may monitor institute nodal verification, state approval, and treasury clearance status directly online.'
    }
  ];

  const quickLinks = [
    'Required Document Specification List',
    'Institute Verification & Scrutiny Process',
    'Aadhaar Bank Seeding Instructions',
    'Scholarship Payment & DBT Guidelines',
    'Student Portal User Navigation Manual'
  ];

  const handleLinkClick = (e, title) => {
    e.preventDefault();
    onShowToast(`Opening circular / manual: "${title}"`, 'info');
  };

  return (
    <section className="section alt" id="news">
      <div className="container">
        <ScrollReveal animation="fade-up">
          <div className="section-head">
            <span className="eyebrow">Latest Updates</span>
            <h2>News &amp; Notices</h2>
            <p>Official announcements and administrative circulars from the scholarship directorate.</p>
          </div>
        </ScrollReveal>

        <div className="news-grid">
          <ScrollReveal animation="fade-up" delay={80}>
            <div className="news-list">
              {news.map((item, idx) => (
                <div key={idx} className="news-item">
                  <span className="news-date">{item.date}</span>
                  <h4>
                    {item.title} {item.isNew && <span className="new-tag">NEW</span>}
                  </h4>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={160}>
            <div className="side-card">
              <h4>Important Resources</h4>
              <ul className="quick-link-list">
                {quickLinks.map((linkText, idx) => (
                  <li key={idx}>
                    <a href="#" onClick={(e) => handleLinkClick(e, linkText)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2a5 5 0 0 0-5 5c0 5-3 6-3 6h16s-3-1-3-6a5 5 0 0 0-5-5Z" />
                      </svg>
                      {linkText}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
