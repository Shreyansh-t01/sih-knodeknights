import React, { useState, useMemo } from 'react';
import ScrollReveal from './ScrollReveal';

export default function HelpFaq() {
  const [faqSearch, setFaqSearch] = useState('');
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'How do I create my scholarship account?',
      a: 'Click "Create an Account" on the login card or top menu, provide your basic academic and contact details, verify your mobile number via OTP, and activate your student login credentials.'
    },
    {
      q: 'How can I check my application status in real-time?',
      a: 'Use the Track Application section with your Application ID or UARN to view real-time verification status across student registration, institute scrutiny, department sanction, and DBT payment transfer.'
    },
    {
      q: 'Can I edit my application after final submission?',
      a: 'Applications can be edited freely before final submission. Once submitted for verification, corrections can only be made if the institute nodal officer returns the form with query remarks.'
    },
    {
      q: 'How is scholarship money disbursed to students?',
      a: 'Approved scholarship amounts are transferred directly to the student verified Aadhaar-seeded bank account through the Public Financial Management System (PFMS) Direct Benefit Transfer (DBT).'
    },
    {
      q: 'What happens if an uploaded document is rejected?',
      a: 'You will receive an SMS and dashboard notification specifying the reason for rejection (e.g. illegible scan). A temporary grievance window is provided to re-upload the valid document.'
    },
    {
      q: 'Who is eligible to apply for technical and engineering scholarships?',
      a: 'Students enrolled in AICTE/UGC recognized engineering, technology, polytechnic, or technical degree courses who meet the minimum class 12 score and family income threshold are eligible.'
    }
  ];

  const filteredFaqs = useMemo(() => {
    const q = faqSearch.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter(
      (item) =>
        item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
    );
  }, [faqSearch]);

  const toggleFaq = (idx) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className="section" id="help">
      <div className="container">
        <ScrollReveal animation="fade-up">
          <div className="section-head">
            <span className="eyebrow">Student Support</span>
            <h2>Help Centre &amp; FAQs</h2>
            <p>Find answers to common questions, or reach the scholarship help desk directly.</p>
          </div>
        </ScrollReveal>

        <div className="help-grid">
          <ScrollReveal animation="fade-up" delay={80}>
            <div className="help-card">
              <h3>Need Help?</h3>
              <p>
                Contact the dedicated scholarship student help desk for registration, application, document verification or DBT payment assistance.
              </p>

              <div className="help-contact">
                <span className="ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2Z" />
                  </svg>
                </span>
                <div>
                  <strong>Toll-Free Helpline</strong>
                  <span>1800-000-0000</span>
                </div>
              </div>

              <div className="help-contact">
                <span className="ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m2 7 10 6 10-6" />
                  </svg>
                </span>
                <div>
                  <strong>Email Support</strong>
                  <span>scholarship-help@example.gov.in</span>
                </div>
              </div>

              <div className="help-contact">
                <span className="ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </span>
                <div>
                  <strong>Help Desk Hours</strong>
                  <span>10:00 AM – 6:00 PM (Working Days)</span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={160}>
            <div>
              <input
                type="text"
                className="faq-search"
                id="faqSearch"
                placeholder="Search frequently asked questions..."
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
              />

              <div id="faqList">
                {filteredFaqs.map((faq, idx) => {
                  const isOpen = openIndex === idx;
                  return (
                    <div key={idx} className={`faq-item ${isOpen ? 'open' : ''}`}>
                      <button
                        type="button"
                        className="faq-q"
                        onClick={() => toggleFaq(idx)}
                        aria-expanded={isOpen}
                      >
                        {faq.q}
                        <span className="plus">+</span>
                      </button>
                      <div className="faq-a">
                        <p>{faq.a}</p>
                      </div>
                    </div>
                  );
                })}

                {filteredFaqs.length === 0 && (
                  <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: '24px' }}>
                    No matching questions found. Please call our toll-free help desk for custom inquiries.
                  </p>
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
