import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Settings, Sliders, Building, Check, Sparkles, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [weights, setWeights] = useState({
    onPageSEO: 30,
    technicalSEO: 30,
    performance: 20,
    mobile: 10,
    content: 10
  });
  const [agencyName, setAgencyName] = useState('');
  const [institution, setInstitution] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [savedMessage, setSavedMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await api.get('/settings');
      setSettings(data);
      if (data.weights) setWeights(data.weights);
      setAgencyName(data.agencyName || '');
      setInstitution(data.institution || 'AeroDigital Growth Marketing');
      setContactEmail(data.contactEmail || '');
      setContactPhone(data.contactPhone || '');
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  };

  const totalWeight =
    (Number(weights.onPageSEO) || 0) +
    (Number(weights.technicalSEO) || 0) +
    (Number(weights.performance) || 0) +
    (Number(weights.mobile) || 0) +
    (Number(weights.content) || 0);

  const handleSaveWeights = async (e) => {
    e.preventDefault();
    setSavedMessage('');
    setErrorMessage('');

    if (totalWeight !== 100) {
      setErrorMessage(`Total weight must equal exactly 100%. Current sum: ${totalWeight}%`);
      return;
    }

    try {
      await api.put('/settings', {
        agencyName,
        institution,
        contactEmail,
        contactPhone,
        weights
      });
      setSavedMessage('Configuration updated successfully! New audits will use these parameters.');
      setTimeout(() => setSavedMessage(''), 5000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save settings');
    }
  };

  const handleResetDefaults = () => {
    setWeights({
      onPageSEO: 30,
      technicalSEO: 30,
      performance: 20,
      mobile: 10,
      content: 10
    });
    setErrorMessage('');
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="pulse-ring" style={{ margin: '0 auto 16px' }} />
        <p>Loading application configuration...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      <div className="card-header-flex" style={{ marginBottom: '24px' }}>
        <div>
          <h2>Application Settings & SEO Scoring Rules</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginTop: '4px' }}>
            PRD FR-11 & FR-18: Configure weighted score formulas and institutional agency details
          </p>
        </div>
      </div>

      {savedMessage && (
        <div
          style={{
            background: 'var(--color-success-bg)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#34d399',
            fontSize: '13.5px',
            marginBottom: '24px'
          }}
        >
          <Check size={18} />
          <span>{savedMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            background: 'var(--color-critical-bg)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#fb7185',
            fontSize: '13.5px',
            marginBottom: '24px'
          }}
        >
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSaveWeights}>
        {/* PRD FR-11: Configurable Category Weights */}
        <div className="glass-card" style={{ marginBottom: '28px', padding: '28px' }}>
          <div className="card-header-flex" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sliders size={20} color="#3b82f6" />
              <h3>SEO Health Score Formula Weights (PRD FR-11)</h3>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleResetDefaults}
            >
              Reset to PRD Standard (30/30/20/10/10)
            </button>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Customize the relative percentage weights applied when calculating the overall website health score. The cumulative total must sum to 100%.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '12px' }}>On-Page SEO (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="form-control"
                style={{ textAlign: 'center', fontSize: '18px', fontWeight: 700 }}
                value={weights.onPageSEO}
                onChange={(e) => setWeights({ ...weights, onPageSEO: Number(e.target.value) })}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '12px' }}>Technical SEO (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="form-control"
                style={{ textAlign: 'center', fontSize: '18px', fontWeight: 700 }}
                value={weights.technicalSEO}
                onChange={(e) => setWeights({ ...weights, technicalSEO: Number(e.target.value) })}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '12px' }}>Performance (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="form-control"
                style={{ textAlign: 'center', fontSize: '18px', fontWeight: 700 }}
                value={weights.performance}
                onChange={(e) => setWeights({ ...weights, performance: Number(e.target.value) })}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '12px' }}>Mobile (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="form-control"
                style={{ textAlign: 'center', fontSize: '18px', fontWeight: 700 }}
                value={weights.mobile}
                onChange={(e) => setWeights({ ...weights, mobile: Number(e.target.value) })}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '12px' }}>Content (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="form-control"
                style={{ textAlign: 'center', fontSize: '18px', fontWeight: 700 }}
                value={weights.content}
                onChange={(e) => setWeights({ ...weights, content: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          {/* Validation Meter */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: totalWeight === 100 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
              border: `1px solid ${totalWeight === 100 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 600, color: totalWeight === 100 ? '#34d399' : '#fb7185' }}>
              Formula Weight Total: {totalWeight}%
            </span>
            <span style={{ fontSize: '12px', color: totalWeight === 100 ? '#34d399' : '#fb7185' }}>
              {totalWeight === 100 ? '✓ Balanced (100%)' : `Must equal 100% (Difference: ${100 - totalWeight}%)`}
            </span>
          </div>
        </div>

        {/* Agency Profile & Institutional Details */}
        <div className="glass-card" style={{ marginBottom: '28px', padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Building size={20} color="#06b6d4" />
            <h3>Agency & Institutional Attribution</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Agency / Product Brand</label>
              <input
                type="text"
                className="form-control"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Academic Institution</label>
              <input
                type="text"
                className="form-control"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Support / Contact Email</label>
              <input
                type="email"
                className="form-control"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="text"
                className="form-control"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="submit" className="btn btn-primary btn-lg" disabled={totalWeight !== 100}>
            Save All Configurations
          </button>
        </div>
      </form>
    </div>
  );
}
