import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import {
  ArrowLeft,
  Globe,
  TrendingUp,
  AlertCircle,
  Clock,
  Play,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function ClientDetailsPage({ clientId, onBack, onRunAudit, onSelectAudit }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientDetails();
  }, [clientId]);

  const fetchClientDetails = async () => {
    try {
      const res = await api.get(`/clients/${clientId}`);
      setData(res);
    } catch (err) {
      console.error('Failed to load client details', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="pulse-ring" style={{ margin: '0 auto 16px' }} />
        <p>Loading client overview and historical progression...</p>
      </div>
    );
  }

  const { client, stats, websites, recentAudits, progression } = data;

  const isDeltaPositive = stats.improvementDelta >= 0;

  return (
    <div>
      {/* Top Navigation & Header */}
      <button
        onClick={onBack}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '20px' }}
      >
        <ArrowLeft size={14} />
        <span>Back to Clients</span>
      </button>

      <div
        className="glass-card"
        style={{
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '24px' }}>{client.company}</h1>
            <span
              style={{
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: '4px',
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}
            >
              {client.industry}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginTop: '6px' }}>
            Contact: {client.name} • {client.email} {client.phone && `• ${client.phone}`} • Assigned: {client.assignedEmployee}
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => onRunAudit({ clientId: client.id, url: client.website })}
        >
          <Play size={15} fill="white" />
          <span>Trigger New Audit</span>
        </button>
      </div>

      {/* PRD FR-16: Client-Specific Dashboard Metrics */}
      <div className="metrics-grid">
        {/* Current Score vs Previous Score & Delta */}
        <div className="metric-card">
          <div>
            <div className="metric-label">Current Audit Score</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <div className="metric-value" style={{ color: '#34d399' }}>
                {stats.currentScore || '--'}
                <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>/100</span>
              </div>
            </div>

            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Prev: {stats.previousScore || '--'}
              </span>
              {stats.previousScore && (
                <span className={isDeltaPositive ? 'delta-badge-pos' : 'delta-badge-neg'}>
                  <TrendingUp size={13} />
                  {isDeltaPositive ? `+${stats.improvementDelta}` : stats.improvementDelta} Improvement
                </span>
              )}
            </div>
          </div>
          <div className="metric-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <Sparkles size={22} />
          </div>
        </div>

        {/* Total Audits Conducted */}
        <div className="metric-card">
          <div>
            <div className="metric-label">Audits Conducted</div>
            <div className="metric-value">{stats.totalAuditsConducted}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
              Tracked across all cycles
            </div>
          </div>
          <div className="metric-icon-box" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
            <Clock size={22} />
          </div>
        </div>

        {/* Number of Open Issues */}
        <div className="metric-card">
          <div>
            <div className="metric-label">Open Recommendations</div>
            <div className="metric-value" style={{ color: stats.openIssuesCount > 0 ? '#fbbf24' : '#34d399' }}>
              {stats.openIssuesCount}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
              Actionable optimizations pending
            </div>
          </div>
          <div className="metric-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <AlertCircle size={22} />
          </div>
        </div>

        {/* Total Websites */}
        <div className="metric-card">
          <div>
            <div className="metric-label">Monitored Web Properties</div>
            <div className="metric-value">{stats.websitesCount}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
              Domains under client account
            </div>
          </div>
          <div className="metric-icon-box" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
            <Globe size={22} />
          </div>
        </div>
      </div>

      {/* Historical Score Progression Chart (FR-15) */}
      <div className="glass-card" style={{ marginBottom: '28px' }}>
        <div className="card-header-flex">
          <div>
            <h3>Audit Score Progression Over Time</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Measurable SEO and technical health growth demonstrating agency optimization impact
            </p>
          </div>
          <span className="delta-badge-pos" style={{ padding: '6px 14px', fontSize: '13.5px' }}>
            <TrendingUp size={15} /> Continuous Progression Tracked
          </span>
        </div>

        <div style={{ height: '280px', marginTop: '16px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progression || []} margin={{ top: 15, right: 30, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis domain={[50, 100]} stroke="#64748b" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 5 }}
                activeDot={{ r: 8, fill: '#06b6d4' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Linked Websites and Recent Audits Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Client's Websites */}
        <div className="glass-card">
          <div className="card-header-flex">
            <h3>Registered Websites</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{websites.length} Properties</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {websites.map((web) => (
              <div
                key={web.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{web.name}</div>
                  <div style={{ fontSize: '12.5px', color: '#60a5fa', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    {web.url}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Last audited: {web.lastAuditDate ? new Date(web.lastAuditDate).toLocaleDateString() : 'Never'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {web.currentScore && (
                    <span className="score-badge score-high">{web.currentScore}/100</span>
                  )}
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onRunAudit({ clientId: client.id, websiteId: web.id, url: web.url })}
                  >
                    Audit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audits Log */}
        <div className="glass-card">
          <div className="card-header-flex">
            <h3>Audit History Log</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{recentAudits.length} Records</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentAudits.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '16px' }}>
                No audits have been executed yet for this client.
              </p>
            ) : (
              recentAudits.map((a) => (
                <div
                  key={a.id}
                  style={{
                    background: 'rgba(15, 23, 42, 0.5)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600 }}>Score: {a.overallScore}/100</span>
                      {a.improvementDelta !== undefined && a.improvementDelta !== null && (
                        <span className={a.improvementDelta >= 0 ? 'delta-badge-pos' : 'delta-badge-neg'} style={{ fontSize: '11px', padding: '2px 6px' }}>
                          {a.improvementDelta >= 0 ? `+${a.improvementDelta}` : a.improvementDelta}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
                      {new Date(a.auditDate).toLocaleDateString()} • By {a.conductedBy}
                    </div>
                  </div>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onSelectAudit(a.id)}
                  >
                    <span>Inspect</span>
                    <ArrowUpRight size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
