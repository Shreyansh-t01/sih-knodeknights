import React from 'react';
import ScrollReveal from './ScrollReveal';

export default function ProcessSteps() {
  const steps = [
    {
      num: '01',
      title: 'Digital Student Registration',
      subtitle: 'Create your permanent unified scholar identity',
      desc: 'Register using your active mobile number and Aadhaar e-KYC. The portal automatically provisions your unique Application Reference Number (UARN) for lifelong educational tracking.',
      badge: 'Step 1 • Identity Setup',
      tags: ['Aadhaar e-KYC', 'Instant Mobile OTP', 'Auto UARN Generation', 'Zero Registration Fee'],
      accentColor: 'linear-gradient(135deg, #0D3D71, #1B5A9C)',
      icon: '🆔'
    },
    {
      num: '02',
      title: 'Complete Academic & Bank Profile',
      subtitle: 'One-time centralized demographic entry',
      desc: 'Provide your enrolled institution, branch/course details, previous academic marks, and verified savings bank account information mapped to NPCI for Direct Benefit Transfer.',
      badge: 'Step 2 • Profile Verification',
      tags: ['Course & Branch Mapping', 'Marksheet Verification', 'NPCI Aadhaar-Seeded Bank', 'Category & Domicile Check'],
      accentColor: 'linear-gradient(135deg, #114B85, #2563eb)',
      icon: '🎓'
    },
    {
      num: '03',
      title: 'Secure Document Vault Upload',
      subtitle: 'Upload self-attested academic & welfare certificates',
      desc: 'Upload qualifying marksheets, income certificate issued by the competent revenue authority, domicile certificate, and college bonafide. Scans are encrypted and digitally watermarked.',
      badge: 'Step 3 • Documentation',
      tags: ['Encrypted Cloud Storage', 'PDF / JPEG Format', 'Real-time Size Validation', 'Digital Watermarking'],
      accentColor: 'linear-gradient(135deg, #1B5A9C, #0284c7)',
      icon: '📂'
    },
    {
      num: '04',
      title: 'Scheme Scrutiny & Final Submission',
      subtitle: 'Automated eligibility filter & confirmation',
      desc: 'Review all populated parameters. The portal system checks your eligibility across multiple central and state scholarship schemes simultaneously before locking your application.',
      badge: 'Step 4 • Final Lock',
      tags: ['Automated Rule Matching', 'Application PDF Summary', 'Institute Auto-Forwarding', 'Instant SMS Acknowledgment'],
      accentColor: 'linear-gradient(135deg, #D9700F, #F4862A)',
      icon: '📝'
    },
    {
      num: '05',
      title: 'Institute Scrutiny & DBT Disbursement',
      subtitle: 'Transparent direct benefit transfer to bank',
      desc: 'Track nodal verification, state welfare department approval, and fund sanction. Scholarship amounts are transferred straight to your bank account with zero middleman deductions.',
      badge: 'Step 5 • Fund Release',
      tags: ['Multi-Stage Live Audit', 'Nodal Officer Approval', 'PFMS Direct Transfer', 'SMS Credit Alerts'],
      accentColor: 'linear-gradient(135deg, #158041, #1F9D4C)',
      icon: '💳'
    }
  ];

  return (
    <section className="section" id="process">
      <div className="container">
        <ScrollReveal animation="fade-up">
          <div className="section-head">
            <span className="eyebrow">Interactive Process Guide</span>
            <h2>How to Apply — Step by Step</h2>
            <p>
              Experience a streamlined, paperless application flow with our progressive 5-stage verification roadmap.
            </p>
          </div>
        </ScrollReveal>

        {/* Quick horizontal steps indicator */}
        <ScrollReveal animation="fade-up" delay={100}>
          <div className="steps mb-48">
            {steps.map((step, idx) => (
              <div key={step.num} className="step">
                <span className="step-num">{idx + 1}</span>
                <h4>{step.title.split(' ')[0]} {step.title.split(' ')[1]}</h4>
                <p>{step.subtitle}</p>
                {idx < steps.length - 1 && <span className="step-line"></span>}
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Stacked Cards Scroll Trigger Section */}
        <div className="stacked-cards-wrapper">
          <div className="stacked-cards-container">
            {steps.map((step, idx) => (
              <div
                key={step.num}
                className="stacked-card"
                style={{
                  '--card-index': idx,
                  '--card-total': steps.length
                }}
              >
                <div className="stacked-card-inner">
                  <div className="stacked-card-header">
                    <span className="stacked-badge">{step.badge}</span>
                    <span className="stacked-num">{step.num}</span>
                  </div>

                  <div className="stacked-card-body">
                    <div className="stacked-card-main">
                      <div className="stacked-card-title-wrap">
                        <span className="stacked-card-icon">{step.icon}</span>
                        <div>
                          <h3>{step.title}</h3>
                          <p className="stacked-subtitle">{step.subtitle}</p>
                        </div>
                      </div>
                      <p className="stacked-desc">{step.desc}</p>
                    </div>

                    <div className="stacked-card-side">
                      <span className="stacked-side-label">Key Deliverables</span>
                      <ul className="stacked-tags-list">
                        {step.tags.map((tag, tIdx) => (
                          <li key={tIdx}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                            <span>{tag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="stacked-card-progress">
                    <div
                      className="stacked-card-bar"
                      style={{ width: `${((idx + 1) / steps.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
