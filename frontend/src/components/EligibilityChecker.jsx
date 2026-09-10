import React, { useState } from 'react';
import ScrollReveal from './ScrollReveal';

export default function EligibilityChecker({ onShowToast }) {
  const [stateVal, setStateVal] = useState('');
  const [pctVal, setPctVal] = useState('');
  const [courseVal, setCourseVal] = useState('Undergraduate');
  const [incomeVal, setIncomeVal] = useState('');
  const [eligibilityResult, setEligibilityResult] = useState(null);

  const initialDocs = [
    { id: 'doc-1', label: 'Aadhaar / Official Identity Document', checked: false },
    { id: 'doc-2', label: 'Class 10 Qualifying Marksheet / Certificate', checked: false },
    { id: 'doc-3', label: 'Class 12 Passing Marksheet / Diploma Certificate', checked: false },
    { id: 'doc-4', label: 'College / Institute Admission Bonafide Proof', checked: false },
    { id: 'doc-5', label: 'Competent Authority Family Income Certificate', checked: false },
    { id: 'doc-6', label: 'Student Active Bank Account Passbook / Cancelled Cheque', checked: false }
  ];

  const [docs, setDocs] = useState(initialDocs);

  const toggleDoc = (id) => {
    setDocs((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, checked: !doc.checked } : doc))
    );
  };

  const completedDocs = docs.filter((d) => d.checked).length;

  const handleEligibilitySubmit = (e) => {
    e.preventDefault();
    if (!stateVal || !pctVal) {
      onShowToast('Please select your state and enter Class 12 percentage', 'warning');
      return;
    }

    const pctNumber = parseFloat(pctVal);
    const incomeNumber = parseFloat(incomeVal) || 0;

    if (pctNumber >= 60 && (incomeNumber === 0 || incomeNumber <= 600000)) {
      setEligibilityResult({
        status: 'likely_eligible',
        message: 'You meet the preliminary merit and income criteria for state undergraduate assistance.'
      });
      onShowToast('Eligibility Check: You appear eligible for primary state scholarships!', 'success');
    } else {
      setEligibilityResult({
        status: 'special_category',
        message: 'Standard merit threshold is 60%. However, specialized welfare quotas and fee reimbursement may still apply.'
      });
      onShowToast('Review specialized welfare criteria in scheme details.', 'info');
    }
  };

  return (
    <section className="section alt" id="eligibility">
      <div className="container">
        <ScrollReveal animation="fade-up">
          <div className="section-head">
            <span className="eyebrow">Before You Apply</span>
            <h2>Eligibility &amp; Documents</h2>
            <p>Check basic eligibility and prepare the required documents before starting your scholarship application.</p>
          </div>
        </ScrollReveal>

        <div className="two-col">
          <ScrollReveal animation="fade-up" delay={80}>
            <div className="panel">
              <h3>Quick Eligibility Checker</h3>
              <p className="sub">Enter basic details to perform a quick preliminary eligibility assessment.</p>
              <form id="eligibilityForm" onSubmit={handleEligibilitySubmit}>
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="elgState">Domicile State</label>
                    <select
                      id="elgState"
                      value={stateVal}
                      onChange={(e) => setStateVal(e.target.value)}
                    >
                      <option value="">Select State</option>
                      <option value="Home State">State Domicile (Primary)</option>
                      <option value="Other State">Other State / All India</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="elgPct">Class 12 Percentage (%)</label>
                    <input
                      type="number"
                      id="elgPct"
                      placeholder="Example: 85"
                      min="35"
                      max="100"
                      step="0.1"
                      value={pctVal}
                      onChange={(e) => setPctVal(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="elgCourse">Enrolled Course</label>
                    <select
                      id="elgCourse"
                      value={courseVal}
                      onChange={(e) => setCourseVal(e.target.value)}
                    >
                      <option value="Undergraduate">Undergraduate (B.Tech / B.Sc / BA)</option>
                      <option value="Medical">Medical (MBBS / BDS / Nursing)</option>
                      <option value="Postgraduate">Postgraduate (M.Tech / M.Sc / MBA)</option>
                      <option value="Diploma">Polytechnic / Diploma</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="elgIncome">Annual Family Income (₹)</label>
                    <input
                      type="number"
                      id="elgIncome"
                      placeholder="e.g. 250000"
                      value={incomeVal}
                      onChange={(e) => setIncomeVal(e.target.value)}
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-navy btn-block">
                  Check Eligibility
                </button>
              </form>

              {eligibilityResult && (
                <div
                  style={{
                    marginTop: '18px',
                    padding: '14px',
                    borderRadius: '9px',
                    background:
                      eligibilityResult.status === 'likely_eligible'
                        ? 'var(--green-bg)'
                        : 'var(--orange-bg)',
                    color:
                      eligibilityResult.status === 'likely_eligible'
                        ? 'var(--green-text)'
                        : 'var(--orange-dark)',
                    fontSize: '0.88rem',
                    lineHeight: '1.5'
                  }}
                >
                  <strong>
                    {eligibilityResult.status === 'likely_eligible'
                      ? '✓ Likely Eligible'
                      : 'ℹ Needs Scheme Verification'}
                  </strong>
                  <p style={{ marginTop: '4px' }}>{eligibilityResult.message}</p>
                </div>
              )}
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={160}>
            <div className="panel">
              <h3>Document Checklist</h3>
              <p className="sub">Tick documents you have prepared to ensure a swift application verification.</p>
              <div className="checklist" id="docChecklist">
                {docs.map((doc) => (
                  <label
                    key={doc.id}
                    className={`check-row ${doc.checked ? 'checked' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={doc.checked}
                      onChange={() => toggleDoc(doc.id)}
                    />
                    <span>{doc.label}</span>
                  </label>
                ))}
              </div>
              <p className="checklist-progress" id="checklistProgress">
                {completedDocs} of {docs.length} documents ready
                {completedDocs === docs.length && ' — Excellent! You have all documents prepared.'}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
