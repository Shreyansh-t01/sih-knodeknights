import React from 'react';
import { GovEmblem } from '../common/GovEmblem';
import { ShieldCheck, Lock, Database } from 'lucide-react';

export function Footer() {
  return (
    <footer className="gov-footer" style={{ borderTop: '3px solid #f97316' }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', maxWidth: '680px' }}>
          <GovEmblem size={40} light={true} />
          <div>
            <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '13px' }}>
              MahaSetu • State Government Interoperability & Automated Orchestration Hub
            </div>
            <div style={{ color: '#94a3b8', fontSize: '11.5px', marginTop: '3px', lineHeight: 1.5 }}>
              Smart India Hackathon 2026 (SIH26129) Prototype. Enforcing standard OIDC/OAuth 2.0 Unified Identity, Role-Based Access Control, and dynamic citizen consent.
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          background: 'rgba(255, 255, 255, 0.06)',
          padding: '10px 16px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '11px',
          color: '#cbd5e1'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Database size={13} color="#38bdf8" />
            <span>Data Minimization Enforced</span>
          </div>
          <span style={{ color: '#475569' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lock size={13} color="#34d399" />
            <span>Zero Citizen PII Stored</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
