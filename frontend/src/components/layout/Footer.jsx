import React from 'react';
import { GovEmblem } from '../common/GovEmblem';
import { Shield, ExternalLink, Globe, Lock, CheckCircle2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="gov-footer">
      {/* 4-Column Directory Grid (Signature india.gov.in Style) */}
      <div className="gov-footer-directory">
        <div>
          <h4 className="gov-footer-col-title">Topics & Sectors</h4>
          <ul className="gov-footer-col-links">
            <li><a href="#id">Identity & Civil Registration</a></li>
            <li><a href="#rev">Revenue & Land Administration</a></li>
            <li><a href="#civic">Municipal & Urban Governance</a></li>
            <li><a href="#trans">Transport & Vehicle Systems</a></li>
            <li><a href="#edu">Education, Scholarships & Skill</a></li>
            <li><a href="#welfare">Social Welfare & Entitlements</a></li>
          </ul>
        </div>

        <div>
          <h4 className="gov-footer-col-title">Citizen Services</h4>
          <ul className="gov-footer-col-links">
            <li><a href="#track">Track Application Status</a></li>
            <li><a href="#consent">Manage Active Data Consent</a></li>
            <li><a href="#verify">Aadhaar & DigiLocker Linkage</a></li>
            <li><a href="#history">Cross-Department Audit History</a></li>
            <li><a href="#grievance">Citizen Grievance Redressal</a></li>
            <li><a href="#forms">Common Form Intelligence</a></li>
          </ul>
        </div>

        <div>
          <h4 className="gov-footer-col-title">About the Portal</h4>
          <ul className="gov-footer-col-links">
            <li><a href="#about">About MahaSetu Platform</a></li>
            <li><a href="#sih">Smart India Hackathon 2026</a></li>
            <li><a href="#problem">Problem Statement SIH26129</a></li>
            <li><a href="#connectors">Connector Registry (API & RPA)</a></li>
            <li><a href="#helpdesk">National Helpdesk & FAQs</a></li>
            <li><a href="#feedback">Citizen Feedback & Suggestions</a></li>
          </ul>
        </div>

        <div>
          <h4 className="gov-footer-col-title">Policies & Standards</h4>
          <ul className="gov-footer-col-links">
            <li><a href="#terms">Terms & Conditions of Use</a></li>
            <li><a href="#privacy">Digital Personal Data Privacy</a></li>
            <li><a href="#hyperlink">Hyperlinking & API Policy</a></li>
            <li><a href="#copyright">Copyright & Open Data Terms</a></li>
            <li><a href="#access">Accessibility Statement</a></li>
            <li><a href="#gigw">GIGW 3.0 Compliance Certificate</a></li>
          </ul>
        </div>
      </div>

      {/* Official Bottom Bar */}
      <div className="gov-footer-bottom">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', maxWidth: '720px' }}>
          <GovEmblem size={36} light={true} />
          <div>
            <p style={{ color: '#ffffff', fontWeight: 700, fontSize: '12px' }}>
              Portal Content Managed by Government of Maharashtra / Government of India
            </p>
            <p style={{ color: '#9ca3af', fontSize: '11px', marginTop: '2px' }}>
              Developed under <strong>Smart India Hackathon 2026</strong> for Interoperability across Government Digital Systems (SIH26129). Powered by MahaSetu Middleware.
            </p>
          </div>
        </div>

        <div className="gov-footer-nic-badge">
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '11px' }}>
              GIGW 3.0 Certified
            </div>
            <div style={{ color: '#9ca3af', fontSize: '10px' }}>
              Guidelines for Indian Gov Websites
            </div>
          </div>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '2px',
              background: '#f37021',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '10px',
            }}
          >
            GOV
          </div>
        </div>
      </div>
    </footer>
  );
}
