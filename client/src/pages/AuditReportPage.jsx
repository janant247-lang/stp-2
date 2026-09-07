import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import {
  ArrowLeft,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Award,
  Sparkles
} from 'lucide-react';

export default function AuditReportPage({ auditId, onBack }) {
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditData();
  }, [auditId]);

  const fetchAuditData = async () => {
    try {
      const data = await api.get(`/audits/${auditId}`);
      setAudit(data);
    } catch (err) {
      console.error('Failed to load audit report', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !audit) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="pulse-ring" style={{ margin: '0 auto 16px' }} />
        <p>Generating printable audit report...</p>
      </div>
    );
  }

  const {
    clientName,
    websiteUrl,
    auditDate,
    overallScore,
    categoryScores,
    counts,
    issues,
    recommendations,
    conductedBy
  } = audit;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Non-printable action buttons */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={onBack} className="btn btn-secondary btn-sm">
          <ArrowLeft size={14} />
          <span>Back to Audit Results</span>
        </button>

        <button onClick={handlePrint} className="btn btn-primary">
          <Printer size={16} />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Printable Report Document (FR-14) */}
      <div
        className="glass-card"
        style={{
          padding: '48px',
          background: 'white',
          color: '#0f172a',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
        }}
      >
        {/* Document Header */}
        <div style={{ borderBottom: '2px solid #3b82f6', paddingBottom: '24px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', fontWeight: 800 }}>
              EXECUTIVE AUDIT REPORT
            </div>
            <h1 style={{ fontSize: '26px', color: '#0f172a', margin: '6px 0 2px' }}>
              Website Optimization & Health Assessment
            </h1>
            <div style={{ fontSize: '13px', color: '#475569' }}>
              System: Web-Based Website Audit & Optimization Recommendation System
            </div>
            <div style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 600, marginTop: '2px' }}>
              AeroDigital Growth Marketing • Confidential Client Assessment
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Report Ref ID:</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
              {audit.id}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Date Generated:</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
              {new Date(auditDate).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* PRD FR-14: Client Information Section */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '28px'
          }}
        >
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', fontWeight: 700, marginBottom: '12px' }}>
            CLIENT INFORMATION & EVALUATION CONTEXT
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', fontSize: '13.5px' }}>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px' }}>Client:</span>
              <strong style={{ color: '#0f172a' }}>{clientName}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px' }}>Website Target:</span>
              <strong style={{ color: '#2563eb', fontFamily: 'var(--font-mono)' }}>{websiteUrl}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px' }}>Audit Date:</span>
              <strong style={{ color: '#0f172a' }}>{new Date(auditDate).toLocaleDateString()}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '12px' }}>Lead Auditor:</span>
              <strong style={{ color: '#0f172a' }}>{conductedBy || 'Agency Analyst'}</strong>
            </div>
          </div>
        </div>

        {/* PRD FR-14: OVERALL SCORE & CATEGORY SCORES */}
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '24px', marginBottom: '32px' }}>
          {/* Overall Score Box */}
          <div
            style={{
              background: '#eff6ff',
              border: '2px solid #bfdbfe',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1e40af', fontWeight: 700 }}>
              OVERALL HEALTH SCORE
            </div>
            <div style={{ fontSize: '48px', fontWeight: 800, color: '#1d4ed8', margin: '8px 0' }}>
              {overallScore} <span style={{ fontSize: '18px', color: '#60a5fa' }}>/ 100</span>
            </div>
            <div style={{ fontSize: '12.5px', color: '#1e40af', fontWeight: 600 }}>
              Calculated via Weighted SEO Formula
            </div>
          </div>

          {/* Category Scores Breakdown Table */}
          <div>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 700, marginBottom: '8px' }}>
              CATEGORY SCORES (WEIGHTED BREAKDOWN)
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ textAlign: 'left', padding: '10px 14px', color: '#475569' }}>Evaluation Category</th>
                  <th style={{ textAlign: 'center', padding: '10px 14px', color: '#475569' }}>Weight</th>
                  <th style={{ textAlign: 'right', padding: '10px 14px', color: '#475569' }}>Achieved Score</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>On-Page SEO</td>
                  <td style={{ textAlign: 'center', padding: '10px 14px', color: '#64748b' }}>30%</td>
                  <td style={{ textAlign: 'right', padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>
                    {categoryScores?.onPageSEO} / 100
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>Technical SEO</td>
                  <td style={{ textAlign: 'center', padding: '10px 14px', color: '#64748b' }}>30%</td>
                  <td style={{ textAlign: 'right', padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>
                    {categoryScores?.technicalSEO} / 100
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>Performance Analysis</td>
                  <td style={{ textAlign: 'center', padding: '10px 14px', color: '#64748b' }}>20%</td>
                  <td style={{ textAlign: 'right', padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>
                    {categoryScores?.performance} / 100
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>Mobile Compatibility</td>
                  <td style={{ textAlign: 'center', padding: '10px 14px', color: '#64748b' }}>10%</td>
                  <td style={{ textAlign: 'right', padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>
                    {categoryScores?.mobile} / 100
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>Content Quality</td>
                  <td style={{ textAlign: 'center', padding: '10px 14px', color: '#64748b' }}>10%</td>
                  <td style={{ textAlign: 'right', padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>
                    {categoryScores?.content} / 100
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* PRD FR-14: ISSUES SUMMARY COUNTS */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 700, marginBottom: '10px' }}>
            ISSUES DETECTION SUMMARY
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', textAlign: 'center' }}>
            <div style={{ padding: '14px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#e11d48' }}>{counts?.critical || 0}</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#be123c' }}>Critical Issues</div>
            </div>
            <div style={{ padding: '14px', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#d97706' }}>{counts?.warnings || 0}</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#b45309' }}>Warnings</div>
            </div>
            <div style={{ padding: '14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#16a34a' }}>{counts?.passed || 0}</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#15803d' }}>Passed Checks</div>
            </div>
            <div style={{ padding: '14px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0284c7' }}>{recommendations?.length || 0}</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#0369a1' }}>Recommendations</div>
            </div>
          </div>
        </div>

        {/* PRD FR-14: STRUCTURED RECOMMENDATIONS */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 700, marginBottom: '14px' }}>
            KEY STRATEGIC RECOMMENDATIONS & ACTION STEPS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(recommendations || []).map((rec, index) => (
              <div
                key={rec.id || index}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '16px',
                  background: '#f8fafc'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: rec.severity === 'CRITICAL' ? '#ffe4e6' : '#fef3c7',
                      color: rec.severity === 'CRITICAL' ? '#e11d48' : '#d97706'
                    }}
                  >
                    {rec.severity}
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{rec.category}</span>
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                    {index + 1}. {rec.title}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.5, margin: '4px 0 8px' }}>
                  {rec.recommendationText}
                </p>
                {rec.actionStep && (
                  <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600 }}>
                    Recommended Action: {rec.actionStep}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Institutional Signature & Footprint */}
        <div
          style={{
            borderTop: '1px solid #e2e8f0',
            paddingTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11.5px',
            color: '#64748b'
          }}
        >
          <div>
            <div><strong>AeroDigital Growth Marketing</strong> • Strategic Digital Marketing & SEO Optimization Division</div>
            <div>Private Internal Audit System — Confidential Agency Client Document</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div>Auditor Sign-off: ________________________</div>
            <div>Date: {new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
