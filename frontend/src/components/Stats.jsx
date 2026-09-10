import React from 'react';
import ScrollReveal from './ScrollReveal';
import AnimatedCounter from './AnimatedCounter';

export default function Stats() {
  const stats = [
    { icon: '🧑🎓', countEnd: 250000, suffix: '+', label: 'Registered Students' },
    { icon: '✅', countEnd: 185000, suffix: '+', label: 'Applications Approved' },
    { icon: '💰', prefix: '₹', countEnd: 500, suffix: '+ Cr', label: 'Scholarship Assistance' },
    { icon: '🏫', countEnd: 1450, suffix: '+', label: 'Participating Institutions' }
  ];

  return (
    <section className="section">
      <div className="container">
        <ScrollReveal animation="fade-up">
          <div className="section-head">
            <span className="eyebrow">Portal Overview</span>
            <h2>Scholarship Impact</h2>
            <p>
              A transparent digital platform designed to simplify scholarship application and direct benefit transfer services for students across the state.
            </p>
          </div>
        </ScrollReveal>

        <div className="stats-grid">
          {stats.map((stat, idx) => (
            <ScrollReveal
              key={idx}
              animation="fade-up"
              delay={idx * 120}
              className="stat-card-wrap"
            >
              <div className="stat-card">
                <span className="stat-icon">{stat.icon}</span>
                <div>
                  <div className="stat-num">
                    <AnimatedCounter
                      end={stat.countEnd}
                      prefix={stat.prefix || ''}
                      suffix={stat.suffix || ''}
                      duration={1600}
                    />
                  </div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
