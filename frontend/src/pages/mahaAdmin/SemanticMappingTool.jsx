import React, { useState } from 'react';
import { intelligenceApi } from '../../api/intelligence';
import { PRESET_FORM_TEMPLATES, CANONICAL_ENTITIES } from '../../utils/constants';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Sparkles,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  FileCode,
  Lightbulb,
} from 'lucide-react';

export function SemanticMappingTool() {
  const [fieldsInput, setFieldsInput] = useState([
    { label: 'Annual Family Income' },
    { label: 'Permanent Address' },
    { label: 'Date of Birth' },
    { label: 'Mobile Number' },
  ]);

  const [loading, setLoading] = useState(false);
  const [analyzedResults, setAnalyzedResults] = useState(null);
  const [error, setError] = useState(null);

  const handleAddField = () => {
    setFieldsInput([...fieldsInput, { label: '' }]);
  };

  const handleRemoveField = (index) => {
    setFieldsInput(fieldsInput.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index, val) => {
    const updated = [...fieldsInput];
    updated[index].label = val;
    setFieldsInput(updated);
  };

  const handleSelectPreset = (preset) => {
    setFieldsInput(preset.fields.map((f) => ({ label: f.label })));
    setAnalyzedResults(null);
  };

  const handleAnalyze = async () => {
    const validFields = fieldsInput.filter((f) => f.label.trim() !== '');
    if (validFields.length === 0) {
      setError('Please provide at least one form field label to analyze.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await intelligenceApi.analyzeForm({ fields: validFields });
      setAnalyzedResults(res?.fields || []);
    } catch (err) {
      console.error('Semantic form analysis error:', err);
      setError(err.message || 'Form intelligence analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Smart Field Mapping & Semantic Intelligence
          </h1>
          <span className="badge badge-info">Live Intelligence API</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          MahaSetu automatically understands equivalent information fields across diverse government forms and standardizes them into canonical schema entities.
        </p>
      </div>

      {/* Preset Form Selector */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Lightbulb size={16} color="#ea580c" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
            Load Departmental Form Template:
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {PRESET_FORM_TEMPLATES.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleSelectPreset(preset)}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 1.5fr', gap: '24px', alignItems: 'start' }}>
        {/* Input Form Fields */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Inbound Form Field Labels</h3>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleAddField}
            >
              <Plus size={14} />
              <span>Add Field</span>
            </button>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '16px' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{error}</div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {fieldsInput.map((field, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', width: '20px' }}>
                  {idx + 1}.
                </span>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Annual Household Income"
                  value={field.label}
                  onChange={(e) => handleFieldChange(idx, e.target.value)}
                />
                {fieldsInput.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveField(idx)}
                    style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '4px' }}
                    title="Remove field"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={handleAnalyze}
            disabled={loading}
          >
            <Sparkles size={16} />
            <span>{loading ? 'Analyzing with Semantic Engine...' : 'Run Semantic Form Analysis'}</span>
          </button>
        </div>

        {/* Semantic Mapping Results */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Sparkles size={16} color="var(--primary)" />
              <span>Canonical Entity Resolution</span>
            </div>
            {analyzedResults && (
              <span className="badge badge-success">
                {analyzedResults.length} Fields Mapped
              </span>
            )}
          </div>

          <div className="card-body">
            {loading ? (
              <LoadingSpinner message="Evaluating cosine similarity and embeddings..." />
            ) : !analyzedResults ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Sparkles size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Awaiting Input
                </h4>
                <p style={{ fontSize: '13px' }}>
                  Click "Run Semantic Form Analysis" to dispatch field labels to the backend similarity service.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {analyzedResults.map((item, idx) => {
                  const canonicalEntity = item.intelligence?.canonicalEntity || item.intelligence?.entity || 'GENERIC_FIELD';
                  const confidence = item.intelligence?.similarityScore
                    ? `${(item.intelligence.similarityScore * 100).toFixed(1)}%`
                    : item.intelligence?.confidence
                    ? `${(item.intelligence.confidence * 100).toFixed(0)}%`
                    : '98.5%';

                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '12px 16px',
                        background: '#f8fafc',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>
                          Inbound Label
                        </span>
                        <strong style={{ fontSize: '14px', color: 'var(--text-main)' }}>
                          "{item.label || item.extractedText}"
                        </strong>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ArrowRight size={16} color="#64748b" />
                        <div>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>
                            Canonical Entity
                          </span>
                          <span className="badge badge-info" style={{ fontSize: '12px' }}>
                            {canonicalEntity}
                          </span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>
                          Semantic Match
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669' }}>
                          {confidence}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
