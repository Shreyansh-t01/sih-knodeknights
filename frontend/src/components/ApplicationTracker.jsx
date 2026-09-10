import React, { useState, useEffect } from 'react';
import ScrollReveal from './ScrollReveal';
import { useInView } from '../hooks/useInView';

export default function ApplicationTracker({ onShowToast }) {
  const [trackInput, setTrackInput] = useState('MMVY2026001234');
  const [activeApplication, setActiveApplication] = useState({
    id: 'MMVY2026001234',
    status: 'Under Verification',
    progress: 68,
    steps: [
      { title: 'Application Submitted', desc: 'Application successfully submitted online on 15 Aug 2026.', done: true },
      { title: 'Documents Verified', desc: 'Primary academic & caste/income documents verified.', done: true },
      { title: 'Institute Verification', desc: 'Forwarded to affiliated institution for enrollment verification.', done: true },
      { title: 'Department Approval', desc: 'Awaiting state higher education department sanction.', done: false, current: true },
      { title: 'Payment Processing', desc: 'DBT funds disbursement will initiate upon department approval.', done: false }
    ]
  });

  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true });
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => {
        setAnimatedProgress(activeApplication.progress);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [inView, activeApplication.progress]);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    const cleanId = trackInput.trim().toUpperCase();
    if (!cleanId) {
      onShowToast('Please enter your Application ID or UARN', 'warning');
      return;
    }

    setAnimatedProgress(0);
    setActiveApplication({
      id: cleanId,
      status: 'Under Verification',
      progress: 68,
      steps: [
        { title: 'Application Submitted', desc: `Application record ${cleanId} received in portal database.`, done: true },
        { title: 'Documents Verified', desc: 'Aadhaar e-KYC and certificates verified.', done: true },
        { title: 'Institute Verification', desc: 'Verified by Institute Nodal Officer.', done: true },
        { title: 'Department Approval', desc: 'Under review by State Welfare Directorate.', done: false, current: true },
        { title: 'Payment Processing', desc: 'Direct Benefit Transfer queued for treasury clearance.', done: false }
      ]
    });

    setTimeout(() => {
      setAnimatedProgress(68);
    }, 150);

    onShowToast(`Tracking status refreshed for application ID: ${cleanId}`, 'success');
  };

  return (
    <section className="section tracker-section" id="tracker" ref={ref}>
      <div className="container">
        <div className="tracker-grid">
          <ScrollReveal animation="fade-up">
            <div>
              <h2>Track Your Application</h2>
              <p>
                Enter your Application ID or Unified Citizen Reference (UARN) to view real-time application progress, document verification status, institute approval, and DBT payment transfer state.
              </p>
              <form className="tracker-form" id="trackForm" onSubmit={handleTrackSubmit}>
                <input
                  type="text"
                  id="trackId"
                  placeholder="Example: MMVY2026001234"
                  value={trackInput}
                  onChange={(e) => setTrackInput(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">
                  Track Status
                </button>
              </form>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="scale-up" delay={150}>
            <div className="track-card" id="trackCard">
              <div className="track-card-head">
                <div>
                  <span className="label">Live Application Reference</span>
                  <h4 id="trackIdShown">{activeApplication.id}</h4>
                </div>
                <span className="status-pill">{activeApplication.status}</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${animatedProgress}%` }}
                ></div>
              </div>
              <p className="progress-label">Application progress: {animatedProgress}% complete</p>
              <ul className="track-list">
                {activeApplication.steps.map((step, idx) => (
                  <li
                    key={idx}
                    className={
                      step.done ? 'done' : step.current ? 'current' : 'pending'
                    }
                  >
                    <span className="track-dot"></span>
                    <div>
                      <h5>{step.title}</h5>
                      <p>{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
