import React from 'react';
import ScrollReveal from './ScrollReveal';

export default function ImportantDates() {
  const dates = [
    {
      icon: '📝',
      title: 'Registration Opens',
      desc: 'Online student registration and fresh scheme submission begins.',
      milestone: 'Academic Session 2026–27',
      status: 'Portal Active'
    },
    {
      icon: '📄',
      title: 'Document Verification',
      desc: 'Complete institute, caste, and income credential verifications.',
      milestone: 'As per portal notification',
      status: 'Check dashboard regularly'
    },
    {
      icon: '✅',
      title: 'Application Approval',
      desc: 'Eligible and scrutinised applications move to departmental sanction.',
      milestone: 'Verification Based',
      status: 'Status visible online'
    },
    {
      icon: '💳',
      title: 'Scholarship Credit',
      desc: 'Approved benefit transferred directly via Aadhaar-linked DBT.',
      milestone: 'Direct Benefit Transfer',
      status: 'Track payment status'
    }
  ];

  return (
    <section className="section" id="dates">
      <div className="container">
        <ScrollReveal animation="fade-up">
          <div className="section-head">
            <span className="eyebrow">Stay Updated</span>
            <h2>Important Dates</h2>
            <p>Monitor important scholarship registration, verification and payment milestones.</p>
          </div>
        </ScrollReveal>

        <div className="dates-grid">
          {dates.map((item, idx) => (
            <ScrollReveal key={idx} animation="fade-up" delay={idx * 100}>
              <div className="date-card">
                <span className="date-icon">{item.icon}</span>
                <h4>{item.title}</h4>
                <p className="desc">{item.desc}</p>
                <p className="milestone">{item.milestone}</p>
                <p className="status">{item.status}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
