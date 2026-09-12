import React from 'react';

/**
 * State Emblem of India (Lion Capital of Ashoka with Satyameva Jayate)
 * Crisp vector SVG representation for official government portal aesthetic.
 */
export function GovEmblem({ size = 48, showText = false, light = false }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
      <svg
        width={size}
        height={size * 1.25}
        viewBox="0 0 60 75"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="State Emblem of India"
      >
        {/* Ashoka Stambh / Lion Capital Representation */}
        <g stroke={light ? '#ffffff' : '#0b2545'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Top Lion Crowns */}
          <path d="M18 10C18 5 24 3 30 3C36 3 42 5 42 10C42 15 36 18 30 18C24 18 18 15 18 10Z" fill={light ? '#f8fafc' : '#0b2545'} fillOpacity="0.15" />
          <path d="M12 18C10 22 10 26 13 30C16 34 22 34 26 31C28 29 29 25 29 22" />
          <path d="M48 18C50 22 50 26 47 30C44 34 38 34 34 31C32 29 31 25 31 22" />
          <path d="M22 17C22 24 25 28 30 28C35 28 38 24 38 17" />
          {/* Center Mane details */}
          <path d="M26 10C28 12 32 12 34 10" />
          <path d="M24 20L30 25L36 20" />
          {/* Base Pedestal (Abacus) */}
          <rect x="10" y="38" width="40" height="9" rx="2" fill={light ? '#f8fafc' : '#0b2545'} fillOpacity="0.2" />
          {/* Center Ashoka Chakra on Abacus */}
          <circle cx="30" cy="42.5" r="3.5" stroke={light ? '#f58220' : '#000080'} strokeWidth="1.5" />
          {/* Galloping Horse (Left) and Bull (Right) reliefs */}
          <path d="M14 43C16 41 18 43 19 44" strokeWidth="1.5" />
          <path d="M41 44C42 43 44 41 46 43" strokeWidth="1.5" />
          {/* Bell Shaped Lotus Base */}
          <path d="M14 47C16 53 22 57 30 57C38 57 44 53 46 47" />
          <path d="M18 51C22 54 26 55 30 55C34 55 38 54 42 51" strokeWidth="1" />
          {/* Bottom Stand */}
          <rect x="18" y="58" width="24" height="3" rx="1" fill={light ? '#ffffff' : '#0b2545'} />
        </g>
        {/* Satyameva Jayate (सत्यमेव जयते) in Devanagari */}
        <text
          x="30"
          y="69"
          textAnchor="middle"
          fontSize="5.5"
          fontFamily="'Noto Sans Devanagari', sans-serif"
          fontWeight="700"
          letterSpacing="0.4"
          fill={light ? '#f1f5f9' : '#0b2545'}
        >
          सत्यमेव जयते
        </text>
      </svg>

      {showText && (
        <div style={{ textAlign: 'left', lineHeight: 1.15 }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: light ? '#f8fafc' : '#0b2545', letterSpacing: '0.2px' }}>
            भारत सरकार
          </div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: light ? '#cbd5e1' : '#475569', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
            Government of India
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Ashoka Chakra 24-Spoke Wheel vector icon
 */
export function AshokaChakra({ size = 24, color = '#000080' }) {
  const spokes = Array.from({ length: 24 });
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" stroke={color} strokeWidth="5" />
      <circle cx="50" cy="50" r="10" fill={color} />
      <circle cx="50" cy="50" r="4" fill="#ffffff" />
      {spokes.map((_, i) => (
        <line
          key={i}
          x1="50"
          y1="50"
          x2={50 + 44 * Math.cos((i * 15 * Math.PI) / 180)}
          y2={50 + 44 * Math.sin((i * 15 * Math.PI) / 180)}
          stroke={color}
          strokeWidth="2.5"
        />
      ))}
    </svg>
  );
}

/**
 * Official Tricolor Strip with central Ashoka Chakra badge
 */
export function GovTricolorBar() {
  return (
    <div className="gov-tricolor-banner">
      <div className="gov-tricolor-line saffron" />
      <div className="gov-tricolor-line white">
        <AshokaChakra size={16} color="#000080" />
      </div>
      <div className="gov-tricolor-line green" />
    </div>
  );
}
