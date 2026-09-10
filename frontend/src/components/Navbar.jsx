import React from 'react';

export default function Navbar({ isNavOpen, activeSection, onLinkClick, onOpenRegister }) {
  const navItems = [
    { href: '#home', label: 'Home' },
    { href: '#schemes', label: 'Scholarship Schemes' },
    { href: '#process', label: 'How to Apply' },
    { href: '#eligibility', label: 'Eligibility' },
    { href: '#dates', label: 'Important Dates' },
    { href: '#news', label: 'News & Notices' },
    { href: '#help', label: 'Help & FAQ' }
  ];

  return (
    <nav className={`navbar ${isNavOpen ? 'open' : ''}`} id="navbar">
      <div className="container">
        <div className="nav-links">
          {navItems.map((item) => {
            const sectionId = item.href.replace('#', '');
            const isCurrent = activeSection === sectionId;
            return (
              <a
                key={item.href}
                href={item.href}
                className={isCurrent ? 'current' : ''}
                onClick={onLinkClick}
              >
                {item.label}
              </a>
            );
          })}
          <a
            href="#schemes"
            className="cta"
            onClick={(e) => {
              if (onLinkClick) onLinkClick();
            }}
          >
            Apply Online
          </a>
        </div>
      </div>
    </nav>
  );
}
