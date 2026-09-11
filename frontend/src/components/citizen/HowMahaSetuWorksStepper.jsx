import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Clock,
  ArrowRight,
  ArrowLeft,
  Radio,
  Database,
  UserCheck,
  ShieldCheck,
  Cpu,
  Activity,
  CheckCircle2,
} from 'lucide-react';

export function HowMahaSetuWorksStepper() {
  const { t } = useLanguage();
  const containerRef = useRef(null);

  // Active step in the horizontal pipeline (1 to 6)
  const [activeStep, setActiveStep] = useState(1);
  const [hasTriggered, setHasTriggered] = useState(false);

  const stepsData = [
    {
      id: 1,
      title: t('step_1_title'),
      desc: t('step_1_desc'),
      detail: t('step_1_detail'),
      icon: Radio,
      badge: 'System Listener',
    },
    {
      id: 2,
      title: t('step_2_title'),
      desc: t('step_2_desc'),
      detail: t('step_2_detail'),
      icon: Database,
      badge: 'Semantic MDM',
    },
    {
      id: 3,
      title: t('step_3_title'),
      desc: t('step_3_desc'),
      detail: t('step_3_detail'),
      icon: UserCheck,
      badge: 'Citizen Notice',
    },
    {
      id: 4,
      title: t('step_4_title'),
      desc: t('step_4_desc'),
      detail: t('step_4_detail'),
      icon: ShieldCheck,
      badge: 'Mandatory Consent',
    },
    {
      id: 5,
      title: t('step_5_title'),
      desc: t('step_5_desc'),
      detail: t('step_5_detail'),
      icon: Cpu,
      badge: 'Secure Interop',
    },
    {
      id: 6,
      title: t('step_6_title'),
      desc: t('step_6_desc'),
      detail: t('step_6_detail'),
      icon: Activity,
      badge: 'Audit Trail',
    },
  ];

  // Scroll Trigger using IntersectionObserver: triggers progression when scrolled into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasTriggered) {
          setHasTriggered(true);
          playStepperAnimation();
        }
      },
      { threshold: 0.25 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [hasTriggered]);

  const playStepperAnimation = () => {
    setActiveStep(1);
    let current = 1;
    const interval = setInterval(() => {
      current += 1;
      if (current <= 6) {
        setActiveStep(current);
      } else {
        clearInterval(interval);
      }
    }, 650);
  };

  const handleStepClick = (stepId) => {
    setActiveStep(stepId);
  };

  const handleNext = () => {
    if (activeStep < 6) setActiveStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (activeStep > 1) setActiveStep((prev) => prev - 1);
  };

  // Rail progress percentage based on activeStep
  const progressPercent = ((activeStep - 1) / (stepsData.length - 1)) * 100;
  const currentStepData = stepsData.find((s) => s.id === activeStep) || stepsData[0];
  const CurrentIcon = currentStepData.icon;

  return (
    <div className="card" ref={containerRef} style={{ overflow: 'hidden' }}>
      {/* Clean Official Header */}
      <div
        className="card-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          padding: '14px 20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} color="var(--gov-orange)" />
          <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--gov-primary)' }}>
            {t('how_it_works')}
          </span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              background: '#e0f2fe',
              color: '#0369a1',
              padding: '2px 8px',
              borderRadius: '12px',
              marginLeft: '4px',
            }}
          >
            {t('step_stage')} {activeStep} / 6
          </span>
        </div>

        <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#64748b' }}>
          {t('transparent_workflow', 'Transparent Citizen Workflow')}
        </span>
      </div>

      <div className="card-body" style={{ padding: '24px 20px' }}>
        {/* Horizontal Workflow Pipeline (Left-to-Right) */}
        <div className="stepper-h-container">
          {/* Animated Connecting Rail */}
          <div className="stepper-h-rail-bg">
            <div
              className="stepper-h-rail-progress"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* 6 Sequential Step Nodes */}
          <div className="stepper-h-grid">
            {stepsData.map((step) => {
              const StepIcon = step.icon;
              const isActive = activeStep === step.id;
              const isCompleted = activeStep > step.id;
              const isFinal = step.id === 6 && activeStep === 6;

              let circleClass = 'stepper-node-circle';
              if (isActive) circleClass += ' is-active';
              else if (isCompleted) circleClass += ' is-completed';
              if (isFinal) circleClass += ' is-final';

              return (
                <button
                  key={step.id}
                  type="button"
                  className={`stepper-h-step ${isActive ? 'active' : ''}`}
                  onClick={() => handleStepClick(step.id)}
                  title={`Stage ${step.id}: ${step.title}`}
                >
                  <div className={circleClass}>
                    {isCompleted ? (
                      <CheckCircle2 size={22} color="#ffffff" />
                    ) : (
                      <StepIcon size={20} />
                    )}
                    <span className="stepper-step-number">{step.id}</span>
                  </div>
                  <div className="stepper-step-title">{step.title}</div>
                  <div className="stepper-step-desc">{step.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Step Spotlight & Data-Flow Preview Box */}
        <div className="stepper-spotlight-box">
          <div className="stepper-spotlight-left">
            <div
              className="stepper-spotlight-icon-wrap"
              style={{
                background:
                  activeStep === 4
                    ? 'var(--gov-orange)'
                    : activeStep === 6
                    ? 'var(--gov-green)'
                    : 'var(--gov-primary)',
              }}
            >
              <CurrentIcon size={22} />
            </div>

            <div>
              <div className="stepper-spotlight-title">
                <span>
                  {t('step_stage')} {currentStepData.id}: {currentStepData.title}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    background: '#fef3c7',
                    color: '#b45309',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  {currentStepData.badge}
                </span>
              </div>
              <div className="stepper-spotlight-desc">
                {currentStepData.detail}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handlePrev}
              disabled={activeStep === 1}
              style={{ padding: '6px 12px' }}
            >
              <ArrowLeft size={14} />
              <span>Prev</span>
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleNext}
              disabled={activeStep === 6}
              style={{ padding: '6px 12px' }}
            >
              <span>Next</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
