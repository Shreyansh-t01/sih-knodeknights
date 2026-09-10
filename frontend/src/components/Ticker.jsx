import React from 'react';

export default function Ticker() {
  const notices = [
    'Applications for the 2026–27 academic session are now open',
    'Complete Aadhaar and bank verification before final submission',
    'Students should regularly check their application status',
    'Scholarship payments are transferred to verified bank accounts only'
  ];

  return (
    <div className="ticker-wrapper" aria-label="Important portal announcements">
      <div className="ticker-inner">
        <span className="ticker-badge">Important</span>
        <div className="ticker-track" id="tickerTrack">
          {notices.map((text, idx) => (
            <span key={`a-${idx}`} className={idx > 0 ? 'dot' : ''}>
              {text}
            </span>
          ))}
          {/* duplicate for continuous marquee loop */}
          {notices.map((text, idx) => (
            <span key={`b-${idx}`} className={idx > 0 ? 'dot' : ''}>
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
