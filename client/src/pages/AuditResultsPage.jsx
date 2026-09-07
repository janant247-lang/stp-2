import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import {
  Award,
  ArrowLeft,
  Printer,
  History,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  ExternalLink,
  Clock,
  HardDrive,
  Smartphone,
  FileCode,
  Sparkles,
  Play,
  ArrowUpRight
} from 'lucide-react';

export default function AuditResultsPage({ auditId, onBack, onViewReport, onViewHistory, onRunFollowUp }) {
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    fetchAudit();
  }, [auditId]);

  const fetchAudit = async () => {
    try {
      const data = await api.get(`/audits/${auditId}`);
      setAudit(data);
    } catch (err) {
      console.error('Failed to load audit results', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !audit) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="pulse-ring" style={{ margin: '0 auto 16px' }} />
        <p>Loading comprehensive audit report...</p>
      </div>
    );
  }

  const { overallScore, categoryScores, counts, metrics, issues, recommendations, clientName, websiteUrl, auditDate } = audit;

  const filteredIssues = (issues || []).filter((issue) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'CRITICAL') return issue.severity === 'CRITICAL';
    if (activeTab === 'WARNING') return issue.severity === 'WARNING';
    if (activeTab === 'INFO') return issue.severity === 'INFO';
    return true;
  });

  const getScoreColor = (score) => {
    if (score >= 85) return '#10b981';
    if (score >= 70) return '#3b82f6';
    if (score >= 50) return '#f59e0b';
    return '#f43f5e';
  };

  const getScoreRating = (score) => {
    if (score >= 85) return 'Excellent Health';
    if (score >= 70) return 'Good Condition';
    if (score >= 50) return 'Needs Optimization';
    return 'Critical Attention Required';
  };

  return (
    <div>
      {/* Top Action Bar */}
      <div className="card-header-flex" style={{ marginBottom: '20px' }}>
        <button onClick={onBack} className="btn btn-secondary btn-sm">
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => onViewReport(audit.id)} className="btn btn-secondary btn-sm">
            <Printer size={14} />
            <span>Print / Export Report</span>
          </button>
          {audit.websiteId && (
            <button onClick={() => onViewHistory(audit.websiteId)} className="btn btn-secondary btn-sm">
              <History size={14} />
              <span>Score Progression</span>
            </button>
          )}
          <button
            onClick={() => onRunFollowUp({ url: websiteUrl, clientId: audit.clientId, websiteId: audit.websiteId })}
            className="btn btn-primary btn-sm"
          >
            <Play size={14} fill="white" />
            <span>Run Follow-Up Audit</span>
          </button>
        </div>
      </div>

      {/* Main Audit Summary Hero Card */}
      <div className="glass-card" style={{ marginBottom: '24px', padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '24px' }}>{clientName}</h1>
              {audit.improvementDelta !== undefined && audit.improvementDelta !== null && (
                <span className={audit.improvementDelta >= 0 ? 'delta-badge-pos' : 'delta-badge-neg'}>
                  {audit.improvementDelta >= 0 ? `+${audit.improvementDelta}` : audit.improvementDelta} Improvement Delta
                </span>
              )}
            </div>

            <a
              href={websiteUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: '13.5px',
                color: '#60a5fa',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontFamily: 'var(--font-mono)',
                marginTop: '6px'
              }}
            >
              <span>{websiteUrl}</span>
              <ExternalLink size={13} />
            </a>

            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
              Audit Date: {new Date(auditDate).toLocaleDateString()} • Conducted by: {audit.conductedBy || 'Agency Analyst'}
            </div>
          </div>

          {/* Radial / Overall Score Gauge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              padding: '14px 28px',
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div className="radial-score-box" style={{ padding: 0 }}>
              <div className="gauge-circle" style={{ width: '100px', height: '100px' }}>
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={getScoreColor(overallScore)}
                    strokeWidth="8"
                    strokeDasharray={`${(overallScore / 100) * 251.2} 251.2`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: getScoreColor(overallScore) }}>
                    {overallScore}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                OVERALL HEALTH SCORE
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                {getScoreRating(overallScore)}
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <span className="badge-critical">{counts?.critical || 0} Critical</span>
                <span className="badge-warning">{counts?.warnings || 0} Warnings</span>
                <span className="badge-passed">{counts?.passed || 0} Passed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PRD FR-11: Configurable Category Scores Grid (30%, 30%, 20%, 10%, 10%) */}
      <div className="category-scores-grid">
        <div className="category-score-card" style={{ '--card-color': '#3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>ON-PAGE SEO</span>
            <span style={{ fontSize: '11px', color: '#60a5fa', fontWeight: 700 }}>Weight: 30%</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, margin: '8px 0', color: getScoreColor(categoryScores?.onPageSEO) }}>
            {categoryScores?.onPageSEO}
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/100</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Title tags, meta descriptions, H1/H2 hierarchy, image ALT attributes.
          </p>
        </div>

        <div className="category-score-card" style={{ '--card-color': '#06b6d4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>TECHNICAL SEO</span>
            <span style={{ fontSize: '11px', color: '#22d3ee', fontWeight: 700 }}>Weight: 30%</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, margin: '8px 0', color: getScoreColor(categoryScores?.technicalSEO) }}>
            {categoryScores?.technicalSEO}
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/100</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            HTTPS enforcement, robots.txt, sitemap.xml, canonical tags, crawlability.
          </p>
        </div>

        <div className="category-score-card" style={{ '--card-color': '#8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>PERFORMANCE</span>
            <span style={{ fontSize: '11px', color: '#c084fc', fontWeight: 700 }}>Weight: 20%</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, margin: '8px 0', color: getScoreColor(categoryScores?.performance) }}>
            {categoryScores?.performance}
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/100</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Response latency, HTML page size, and asset payload weights.
          </p>
        </div>

        <div className="category-score-card" style={{ '--card-color': '#ec4899' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>MOBILE COMPAT</span>
            <span style={{ fontSize: '11px', color: '#f472b6', fontWeight: 700 }}>Weight: 10%</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, margin: '8px 0', color: getScoreColor(categoryScores?.mobile) }}>
            {categoryScores?.mobile}
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/100</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Viewport meta tags, responsive design markers, and screen adaptability.
          </p>
        </div>

        <div className="category-score-card" style={{ '--card-color': '#10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>CONTENT QUALITY</span>
            <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 700 }}>Weight: 10%</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, margin: '8px 0', color: getScoreColor(categoryScores?.content) }}>
            {categoryScores?.content}
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/100</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Text volume, thin content flags, and OpenGraph social metadata.
          </p>
        </div>
      </div>

      {/* Raw Diagnostic Technical Telemetry (PRD FR-07, FR-08, FR-09) */}
      <div
        className="glass-card"
        style={{
          padding: '16px 20px',
          marginBottom: '28px',
          background: 'rgba(15, 23, 42, 0.4)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 700 }}>
          Live Technical SEO & Performance Indicators
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '13px' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>HTTPS: </span>
            <strong style={{ color: metrics?.sslValid ? '#10b981' : '#f43f5e' }}>
              {metrics?.sslValid ? '✓ PASS' : '✗ FAIL'}
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Robots.txt: </span>
            <strong style={{ color: metrics?.robotsValid ? '#10b981' : '#f59e0b' }}>
              {metrics?.robotsValid ? '✓ PASS' : '■ WARNING'}
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>XML Sitemap: </span>
            <strong style={{ color: metrics?.sitemapValid ? '#10b981' : '#f59e0b' }}>
              {metrics?.sitemapValid ? '✓ PASS' : '■ WARNING'}
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Canonical Tag: </span>
            <strong style={{ color: metrics?.canonicalTag ? '#10b981' : '#f59e0b' }}>
              {metrics?.canonicalTag ? '✓ PASS' : '■ MISSING'}
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Response Time: </span>
            <strong>{metrics?.responseTimeMs ? `${(metrics.responseTimeMs / 1000).toFixed(2)}s` : '1.2s'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>HTML Size: </span>
            <strong>{metrics?.pageSizeMB ? `${metrics.pageSizeMB} MB` : `${metrics?.pageSizeKB || 45} KB`}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Images Missing ALT: </span>
            <strong style={{ color: (metrics?.imagesWithoutAlt || 0) > 0 ? '#f59e0b' : '#10b981' }}>
              {metrics?.imagesWithoutAlt || 0} / {metrics?.imagesTotal || 0}
            </strong>
          </div>
        </div>
      </div>

      {/* Categorized Issues & Recommendations Section (FR-12 & FR-13) */}
      <div className="glass-card">
        <div className="card-header-flex" style={{ flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h3>Audit Issues & Actionable Recommendations</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Step-by-step optimization recommendations prioritized by impact severity
            </p>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map((tab) => (
              <button
                key={tab}
                className={`btn btn-sm ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          {filteredIssues.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 10px' }} />
              <p>No issues found matching this filter category.</p>
            </div>
          ) : (
            filteredIssues.map((issue) => {
              const rec = (recommendations || []).find((r) => r.issueId === issue.id || r.title === issue.title);

              return (
                <div key={issue.id} className="recommendation-item">
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {issue.severity === 'CRITICAL' && <span className="badge-critical">CRITICAL</span>}
                      {issue.severity === 'WARNING' && <span className="badge-warning">WARNING</span>}
                      {issue.severity === 'INFO' && <span className="badge-info">INFO</span>}
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>• {issue.category}</span>
                    </div>
                  </div>

                  <h4 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {issue.title}
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    {issue.description}
                  </p>

                  {rec && (
                    <div
                      style={{
                        background: 'rgba(59, 130, 246, 0.08)',
                        borderLeft: '3px solid var(--primary)',
                        padding: '12px 14px',
                        borderRadius: '0 6px 6px 0',
                        marginTop: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#60a5fa', marginBottom: '4px' }}>
                        <Sparkles size={14} />
                        <span>ACTIONABLE RECOMMENDATION</span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                        {rec.recommendationText}
                      </p>
                      {rec.actionStep && (
                        <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          <strong>Fix:</strong> {rec.actionStep}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
