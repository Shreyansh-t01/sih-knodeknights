import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import TopBar from './components/TopBar';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Ticker from './components/Ticker';
import Hero from './components/Hero';
import QuickServices from './components/QuickServices';
import Stats from './components/Stats';
import SchemeFinder from './components/SchemeFinder';
import ProcessSteps from './components/ProcessSteps';
import ApplicationTracker from './components/ApplicationTracker';
import EligibilityChecker from './components/EligibilityChecker';
import ImportantDates from './components/ImportantDates';
import NewsNotices from './components/NewsNotices';
import HelpFaq from './components/HelpFaq';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import ToastContainer from './components/ToastContainer';
import BackToTop from './components/BackToTop';

function App() {
  const [isDark, setIsDark] = useState(false);
  const [lang, setLang] = useState('en');
  const [scale, setScale] = useState('1');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Toast helper
  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3600);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Theme toggle
  const toggleDark = () => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
      showToast(next ? 'Dark mode enabled' : 'Light mode enabled', 'info');
      return next;
    });
  };

  // Scroll spy for active navbar anchor
  useEffect(() => {
    const sectionIds = ['home', 'schemes', 'process', 'tracker', 'eligibility', 'dates', 'news', 'help'];
    const handleScroll = () => {
      const scrollPos = window.scrollY + 160;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && scrollPos >= el.offsetTop) {
          setActiveSection(sectionIds[i]);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="app-container">
      <TopBar
        lang={lang}
        setLang={setLang}
        scale={scale}
        setScale={setScale}
        onShowToast={showToast}
      />

      <Header
        isDark={isDark}
        toggleDark={toggleDark}
        onOpenLogin={() => setLoginModalOpen(true)}
        isNavOpen={isNavOpen}
        toggleNav={() => setIsNavOpen(!isNavOpen)}
        onShowToast={showToast}
      />

      <Navbar
        isNavOpen={isNavOpen}
        activeSection={activeSection}
        onLinkClick={() => setIsNavOpen(false)}
        onOpenRegister={() => {
          setIsNavOpen(false);
          setRegisterModalOpen(true);
        }}
      />

      <Ticker />

      <main id="main">
        <Hero
          onOpenRegister={() => setRegisterModalOpen(true)}
          onShowToast={showToast}
        />

        <QuickServices
          onOpenRegister={() => setRegisterModalOpen(true)}
        />

        <Stats />

        <SchemeFinder
          onOpenRegister={() => setRegisterModalOpen(true)}
          onShowToast={showToast}
        />

        <ProcessSteps />

        <ApplicationTracker
          onShowToast={showToast}
        />

        <EligibilityChecker
          onShowToast={showToast}
        />

        <ImportantDates />

        <NewsNotices
          onShowToast={showToast}
        />

        <HelpFaq />
      </main>

      <Footer
        onOpenRegister={() => setRegisterModalOpen(true)}
        onShowToast={showToast}
      />

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSwitchToRegister={() => {
          setLoginModalOpen(false);
          setRegisterModalOpen(true);
        }}
        onShowToast={showToast}
      />

      <RegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onSwitchToLogin={() => {
          setRegisterModalOpen(false);
          setLoginModalOpen(true);
        }}
        onShowToast={showToast}
      />

      <ToastContainer
        toasts={toasts}
        onRemove={removeToast}
      />

      <BackToTop />
    </div>
  );
}

export default App;
