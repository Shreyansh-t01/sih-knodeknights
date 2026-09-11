import React, { useState, useEffect, useRef } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useLanguage } from '../../context/LanguageContext';
import { HowMahaSetuWorksStepper } from '../../components/citizen/HowMahaSetuWorksStepper';
import {
  Shield,
  ShieldCheck,
  ArrowRight,
  FileCheck2,
  Clock,
  Lock,
  Eye,
  CheckCircle2,
  Building,
  Fingerprint,
  Car,
  GraduationCap,
  Landmark,
} from 'lucide-react';

export function CitizenHome() {
  const { navigate } = useNavigation();
  const { t } = useLanguage();

  const serviceCategories = [
    {
      title: t('cat_identity'),
      count: '4 Connected Depts',
      icon: Fingerprint,
      desc: t('cat_identity_sub'),
    },
    {
      title: t('cat_revenue'),
      count: '3 Connected Depts',
      icon: Landmark,
      desc: t('cat_revenue_sub'),
    },
    {
      title: t('cat_municipal'),
      count: '3 Connected Depts',
      icon: Building,
      desc: t('cat_municipal_sub'),
    },
    {
      title: t('cat_transport'),
      count: '2 Connected Depts',
      icon: Car,
      desc: t('cat_transport_sub'),
    },
    {
      title: t('cat_education'),
      count: '3 Connected Depts',
      icon: GraduationCap,
      desc: t('cat_education_sub'),
    },
    {
      title: t('cat_police'),
      count: '1 Connected Dept',
      icon: Shield,
      desc: t('cat_police_sub'),
    },
  ];

  const whatCanYouDoRef = useRef(null);
  const [cardsRevealed, setCardsRevealed] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setCardsRevealed(true);
        }
      },
      { threshold: 0.15 }
    );

    if (whatCanYouDoRef.current) {
      observer.observe(whatCanYouDoRef.current);
    }

    return () => {
      if (whatCanYouDoRef.current) {
        observer.unobserve(whatCanYouDoRef.current);
      }
    };
  }, []);

  const whatYouCanDoCards = [
    {
      num: '01',
      title: t('card_apply'),
      desc: t('card_apply_desc'),
    },
    {
      num: '02',
      title: t('card_track'),
      desc: t('card_track_desc'),
    },
    {
      num: '03',
      title: t('card_consent'),
      desc: t('card_consent_desc'),
    },
    {
      num: '04',
      title: t('card_updates'),
      desc: t('card_updates_desc'),
    },
    {
      num: '05',
      title: t('card_connected'),
      desc: t('card_connected_desc'),
    },
  ];

  return (
    <div style={{ textAlign: 'left' }}>
      {/* 1. OFFICIAL INDIA.GOV.IN STYLE PORTAL BANNER */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e3d59 0%, #173047 100%)',
          color: '#ffffff',
          padding: '36px 30px',
          marginBottom: '24px',
          borderLeft: '6px solid var(--gov-orange)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '780px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span
              style={{
                background: 'var(--gov-orange)',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '2px',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              {t('hero_badge')}
            </span>
            <span style={{ color: '#93c5fd', fontSize: '12px', fontWeight: 600 }}>
              Smart India Hackathon 2026 • SIH26129
            </span>
          </div>

          <h1
            style={{
              fontSize: '32px',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              lineHeight: 1.2,
              marginBottom: '12px',
              color: '#ffffff',
            }}
          >
            {t('hero_title')}
          </h1>

          <p style={{ fontSize: '15px', color: '#cbd5e1', lineHeight: 1.55, marginBottom: '22px' }}>
            {t('hero_sub')}
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '18px' }}>
            <button
              type="button"
              className="btn btn-orange btn-lg"
              onClick={() => navigate('citizen_dashboard')}
            >
              <span>{t('btn_explore')}</span>
              <ArrowRight size={16} />
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-lg"
              onClick={() => navigate('citizen_applications')}
              style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.3)' }}
            >
              <FileCheck2 size={16} />
              <span>{t('btn_track')}</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#93c5fd' }}>
            <Lock size={15} color="#fed7aa" />
            <span>{t('trust_statement')}</span>
          </div>
        </div>
      </div>

      {/* 2. SERVICES BY CATEGORY (Iconic india.gov.in category layout) */}
      <section style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--gov-primary)', margin: 0 }}>
              {t('cat_heading')}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {t('cat_sub')}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('citizen_dashboard')}
          >
            {t('view_all')}
          </button>
        </div>

        <div className="gov-category-grid">
          {serviceCategories.map((cat, idx) => {
            const IconComponent = cat.icon;
            return (
              <div
                key={idx}
                className="gov-category-card"
                onClick={() => navigate('citizen_dashboard')}
              >
                <div className="gov-category-circle">
                  <IconComponent size={24} />
                </div>
                <div className="gov-category-title">{cat.title}</div>
                <span className="gov-category-count">{cat.count}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. WHAT CAN YOU DO WITH MAHASETU? (Numbered Government Cards with Staggered Scroll Entrance) */}
      <section ref={whatCanYouDoRef} style={{ marginBottom: '32px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--gov-primary)', margin: 0 }}>
            {t('what_heading')}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {t('what_sub')}
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
          }}
        >
          {whatYouCanDoCards.map((card, idx) => (
            <div
              key={idx}
              className={`card stagger-card ${cardsRevealed ? 'is-revealed' : ''}`}
              style={{
                padding: '20px',
                borderTop: '3px solid var(--gov-primary)',
                transitionDelay: `${idx * 90}ms`,
              }}
            >
              <div style={{ color: 'var(--gov-orange)', fontWeight: 800, fontSize: '18px', marginBottom: '6px' }}>
                {card.num}
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--gov-primary)', marginBottom: '6px' }}>
                {card.title}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. HOW MAHASETU WORKS (Interactive Scroll-Triggered Stepper with Left-to-Right & Left-to-Bottom Modes) */}
      <section style={{ marginBottom: '32px' }}>
        <HowMahaSetuWorksStepper />
      </section>

      {/* 5. YOU STAY IN CONTROL (Trust Principles) */}
      <section style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '14px' }}>
          <h2 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--gov-primary)', margin: 0 }}>
            {t('trust_heading')}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {t('trust_sub')}
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
          }}
        >
          <div className="card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <ShieldCheck size={18} color="var(--gov-green)" />
              <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--gov-primary)' }}>
                {t('trust_consent_title')}
              </h4>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {t('trust_consent_desc')}
            </p>
          </div>

          <div className="card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Eye size={18} color="var(--gov-orange)" />
              <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--gov-primary)' }}>
                {t('trust_transparent_title')}
              </h4>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {t('trust_transparent_desc')}
            </p>
          </div>

          <div className="card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Clock size={18} color="var(--gov-primary)" />
              <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--gov-primary)' }}>
                {t('trust_traceable_title')}
              </h4>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {t('trust_traceable_desc')}
            </p>
          </div>

          <div className="card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <CheckCircle2 size={18} color="var(--gov-primary)" />
              <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--gov-primary)' }}>
                {t('trust_systems_title')}
              </h4>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {t('trust_systems_desc')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
