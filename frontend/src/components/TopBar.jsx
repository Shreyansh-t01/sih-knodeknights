import React from 'react';

export default function TopBar({ lang, setLang, scale, setScale, onShowToast }) {
  const handleLangChange = (newLang) => {
    setLang(newLang);
    onShowToast(
      newLang === 'hi'
        ? 'हिंदी भाषा का चयन किया गया (भाषा अनुवाद सामग्री जल्द जोड़ी जाएगी)'
        : 'Language set to English',
      'success'
    );
  };

  const handleScaleChange = (step) => {
    const scaleMap = {
      '-1': '0.9',
      '0': '1',
      '1': '1.12'
    };
    const newScale = scaleMap[step] || '1';
    setScale(newScale);
    document.documentElement.style.setProperty('--scale', newScale);
    onShowToast(
      step === '-1' ? 'Text size decreased (A-)' : step === '1' ? 'Text size increased (A+)' : 'Text size reset to default (A)',
      'info'
    );
  };

  return (
    <div className="topbar">
      <div className="container">
        <div className="topbar-left">
          <b>Government of [State]</b>
          <span>• Higher Education Scholarship Services</span>
        </div>
        <div className="topbar-right">
          <a href="#main">Skip to Main Content</a>
          <div className="lang-toggle" id="langToggle">
            <button
              type="button"
              className={lang === 'en' ? 'active' : ''}
              onClick={() => handleLangChange('en')}
            >
              EN
            </button>
            <button
              type="button"
              className={lang === 'hi' ? 'active' : ''}
              onClick={() => handleLangChange('hi')}
            >
              हिं
            </button>
          </div>
          <a href="#help">Help</a>
          <div className="text-size" id="textSize">
            <button
              type="button"
              aria-label="Decrease text size"
              onClick={() => handleScaleChange('-1')}
            >
              A-
            </button>
            <button
              type="button"
              aria-label="Reset text size"
              onClick={() => handleScaleChange('0')}
            >
              A
            </button>
            <button
              type="button"
              aria-label="Increase text size"
              onClick={() => handleScaleChange('1')}
            >
              A+
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
