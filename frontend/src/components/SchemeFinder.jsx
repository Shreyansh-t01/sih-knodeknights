import React, { useState, useMemo } from 'react';
import ScrollReveal from './ScrollReveal';

export default function SchemeFinder({ onOpenRegister, onShowToast }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Applications Open');

  const schemes = [
    {
      id: 'scheme-1',
      title: 'Merit Scholarship for Undergraduates',
      desc: 'Financial assistance for eligible meritorious students pursuing approved undergraduate and professional courses in state-recognized universities.',
      course: 'UG / Professional',
      metaLabel1: 'Level',
      metaVal1: 'UG / Professional',
      metaLabel2: 'Benefit',
      metaVal2: 'Fee Assistance',
      status: 'Applications Open'
    },
    {
      id: 'scheme-2',
      title: 'Technical Education Scholarship',
      desc: 'Scholarship assistance for eligible students pursuing engineering, technology, polytechnic diploma, and technical degree programs.',
      course: 'Engineering',
      metaLabel1: 'Course',
      metaVal1: 'Engineering',
      metaLabel2: 'Mode',
      metaVal2: 'Online DBT',
      status: 'Applications Open'
    },
    {
      id: 'scheme-3',
      title: 'Medical Education Assistance',
      desc: 'Financial support for eligible students admitted into recognized MBBS, BDS, Nursing, and allied medical professional education programs.',
      course: 'Medical',
      metaLabel1: 'Course',
      metaVal1: 'Medical',
      metaLabel2: 'Support',
      metaVal2: 'Education Fee',
      status: 'Applications Open'
    },
    {
      id: 'scheme-4',
      title: 'Post-Matric Student Welfare Scholarship',
      desc: 'Holistic maintenance allowance and fee reimbursement for students pursuing degree, diploma and postgraduate courses.',
      course: 'UG / Professional',
      metaLabel1: 'Category',
      metaVal1: 'Welfare Quota',
      metaLabel2: 'Benefit',
      metaVal2: 'Full Tuition',
      status: 'Closing Soon'
    },
    {
      id: 'scheme-5',
      title: 'Women in STEM Innovation Grant',
      desc: 'Special scholarship incentive for female scholars enrolled in accredited Bachelor and Master of Science or Engineering degrees.',
      course: 'Engineering',
      metaLabel1: 'Course',
      metaVal1: 'STEM Fields',
      metaLabel2: 'Award',
      metaVal2: '₹60,000 / yr',
      status: 'Applications Open'
    },
    {
      id: 'scheme-6',
      title: 'Healthcare Paramedical Support Scheme',
      desc: 'Stipend and tuition assistance for students pursuing pharmacy, physiotherapy, medical laboratory technology and paramedical diplomas.',
      course: 'Medical',
      metaLabel1: 'Course',
      metaVal1: 'Paramedical',
      metaLabel2: 'Mode',
      metaVal2: 'Institutional DBT',
      status: 'Applications Open'
    }
  ];

  const filteredSchemes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return schemes.filter((s) => {
      const matchQuery =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.desc.toLowerCase().includes(q) ||
        s.course.toLowerCase().includes(q);
      const matchCourse = !selectedCourse || s.course === selectedCourse;
      const matchStatus = !selectedStatus || s.status === selectedStatus;
      return matchQuery && matchCourse && matchStatus;
    });
  }, [searchQuery, selectedCourse, selectedStatus]);

  const handleDetailsClick = (schemeTitle) => {
    onShowToast(`Displaying eligibility guidelines and criteria for: ${schemeTitle}`, 'info');
  };

  return (
    <section className="section alt" id="schemes">
      <div className="container">
        <ScrollReveal animation="fade-up">
          <div className="section-head">
            <span className="eyebrow">Find Your Scholarship</span>
            <h2>Explore Available Schemes</h2>
            <p>Search and filter scholarship schemes based on course, qualification, and category.</p>
          </div>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delay={80}>
          <div className="finder-bar">
            <input
              type="text"
              id="schemeSearch"
              placeholder="Search scholarship by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              id="schemeCourse"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">All Courses</option>
              <option value="Engineering">Engineering</option>
              <option value="Medical">Medical</option>
              <option value="UG / Professional">UG / Professional</option>
            </select>
            <select
              id="schemeStatus"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Applications Open">Applications Open</option>
              <option value="Closing Soon">Closing Soon</option>
            </select>
            <button
              type="button"
              className="btn btn-primary"
              id="schemeSearchBtn"
              onClick={() => onShowToast(`Found ${filteredSchemes.length} matching scheme(s)`, 'info')}
            >
              Filter Schemes
            </button>
          </div>
        </ScrollReveal>

        <div className="scheme-grid" id="schemeGrid">
          {filteredSchemes.map((scheme, idx) => (
            <ScrollReveal
              key={scheme.id}
              animation="fade-up"
              delay={(idx % 3) * 120}
              className="scheme-card-wrapper"
            >
              <article className="scheme-card">
                <span
                  className={
                    scheme.status === 'Closing Soon' ? 'badge-closing' : 'badge-open'
                  }
                >
                  {scheme.status}
                </span>
                <h3>{scheme.title}</h3>
                <p>{scheme.desc}</p>
                <div className="scheme-meta">
                  <div>
                    <span>{scheme.metaLabel1}</span>
                    <strong>{scheme.metaVal1}</strong>
                  </div>
                  <div>
                    <span>{scheme.metaLabel2}</span>
                    <strong>{scheme.metaVal2}</strong>
                  </div>
                </div>
                <div className="scheme-foot">
                  <a
                    className="link-arrow"
                    href="#schemes"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDetailsClick(scheme.title);
                    }}
                  >
                    View Details →
                  </a>
                  <button
                    type="button"
                    className="btn btn-navy"
                    onClick={onOpenRegister}
                  >
                    Apply
                  </button>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>

        {filteredSchemes.length === 0 && (
          <p id="schemeEmpty" style={{ textAlign: 'center', color: 'var(--gray-500)', marginTop: '32px', fontSize: '1rem' }}>
            No scholarship schemes match your filter criteria. Try resetting course or status filters.
          </p>
        )}
      </div>
    </section>
  );
}
