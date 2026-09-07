import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import {
  Lightbulb,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const categories = ['ALL', 'On-Page SEO', 'Technical SEO', 'Performance', 'Mobile Compatibility', 'Content Analysis'];
  const severities = ['ALL', 'CRITICAL', 'WARNING', 'INFO'];
  const statuses = ['ALL', 'OPEN', 'RESOLVED'];

  useEffect(() => {
    fetchRecommendations();
  }, [search, selectedSeverity, selectedCategory, selectedStatus]);

  const fetchRecommendations = async () => {
    try {
      let endpoint = '/recommendations?';
      if (search) endpoint += `search=${encodeURIComponent(search)}&`;
      if (selectedSeverity !== 'ALL') endpoint += `severity=${selectedSeverity}&`;
      if (selectedCategory !== 'ALL') endpoint += `category=${encodeURIComponent(selectedCategory)}&`;
      if (selectedStatus !== 'ALL') endpoint += `status=${selectedStatus}&`;

      const data = await api.get(endpoint);
      setRecommendations(data);
    } catch (err) {
      console.error('Failed to load recommendations', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'OPEN' ? 'RESOLVED' : 'OPEN';
    try {
      await api.patch(`/recommendations/${id}`, { status: nextStatus });
      setRecommendations(prev =>
        prev.map(r => (r.id === id ? { ...r, status: nextStatus } : r))
      );
    } catch (err) {
      alert(err.message || 'Failed to update recommendation status');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="card-header-flex" style={{ marginBottom: '24px' }}>
        <div>
          <h2>Consolidated Optimization Recommendations</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginTop: '4px' }}>
            Actionable improvement opportunities across all client web properties (PRD FR-13)
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-card"
        style={{
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          gap: '14px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
      >
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }}
          />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '38px' }}
            placeholder="Search recommendations by title or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select
            className="form-control"
            style={{ width: '140px' }}
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
          >
            {severities.map(s => (
              <option key={s} value={s}>Severity: {s}</option>
            ))}
          </select>

          <select
            className="form-control"
            style={{ width: '180px' }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(c => (
              <option key={c} value={c}>Category: {c}</option>
            ))}
          </select>

          <select
            className="form-control"
            style={{ width: '140px' }}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            {statuses.map(st => (
              <option key={st} value={st}>Status: {st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Recommendations Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {recommendations.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 12px' }} />
            <p>No open recommendations found matching current criteria.</p>
          </div>
        ) : (
          recommendations.map((rec) => {
            const isResolved = rec.status === 'RESOLVED';

            return (
              <div
                key={rec.id}
                className="glass-card"
                style={{
                  padding: '20px 24px',
                  opacity: isResolved ? 0.65 : 1,
                  borderLeft: rec.severity === 'CRITICAL' ? '4px solid #f43f5e' : rec.severity === 'WARNING' ? '4px solid #f59e0b' : '4px solid #0ea5e9'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      {rec.severity === 'CRITICAL' && <span className="badge-critical">CRITICAL</span>}
                      {rec.severity === 'WARNING' && <span className="badge-warning">WARNING</span>}
                      {rec.severity === 'INFO' && <span className="badge-info">INFO</span>}
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>• {rec.category}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>• Client: <strong>{rec.clientName}</strong></span>
                    </div>

                    <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', marginBottom: '6px', textDecoration: isResolved ? 'line-through' : 'none' }}>
                      {rec.title}
                    </h3>

                    <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
                      {rec.recommendationText}
                    </p>

                    {rec.actionStep && (
                      <div
                        style={{
                          background: 'rgba(59, 130, 246, 0.08)',
                          border: '1px solid rgba(59, 130, 246, 0.2)',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          fontSize: '12.5px',
                          color: '#93c5fd',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontFamily: 'var(--font-mono)'
                        }}
                      >
                        <Sparkles size={13} color="#60a5fa" />
                        <span><strong>Action:</strong> {rec.actionStep}</span>
                      </div>
                    )}
                  </div>

                  {/* Status Toggle Button */}
                  <div>
                    <button
                      className={`btn btn-sm ${isResolved ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() => handleToggleStatus(rec.id, rec.status || 'OPEN')}
                    >
                      <CheckCircle2 size={14} />
                      <span>{isResolved ? 'Re-open' : 'Mark as Resolved'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
