import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Globe,
  Activity,
  Award,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Sparkles,
  Play,
  UserCheck,
  Building2,
  Filter
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

export default function DashboardPage({ onNavigate, onSelectAudit, onSelectClient }) {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState(isAdmin ? 'agency' : 'my');
  const [employeesList, setEmployeesList] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  useEffect(() => {
    if (isAdmin) {
      api.get('/users').then(users => setEmployeesList(users)).catch(() => {});
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchStats();
  }, [scope, selectedEmployeeId]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      let endpoint = `/dashboard/stats?scope=${scope}`;
      if (selectedEmployeeId) {
        endpoint += `&employeeId=${selectedEmployeeId}`;
      }
      const data = await api.get(endpoint);
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreClass = (score) => {
    if (score >= 85) return 'score-high';
    if (score >= 70) return 'score-medium';
    return 'score-low';
  };

  const isMyView = scope === 'my';

  return (
    <div>
      {/* Portfolio / Scope Switcher Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Workspace View:</span>
          <div
            style={{
              display: 'inline-flex',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '3px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <button
              onClick={() => {
                setScope('my');
                setSelectedEmployeeId('');
              }}
              style={{
                background: isMyView && !selectedEmployeeId ? 'var(--primary)' : 'transparent',
                color: isMyView && !selectedEmployeeId ? 'white' : 'var(--text-secondary)',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <UserCheck size={14} />
              <span>{user?.name ? `${user.name.split(' ')[0]}'s Workspace` : 'My Workspace'}</span>
            </button>
            <button
              onClick={() => {
                setScope('agency');
                setSelectedEmployeeId('');
              }}
              style={{
                background: !isMyView && !selectedEmployeeId ? 'var(--primary)' : 'transparent',
                color: !isMyView && !selectedEmployeeId ? 'white' : 'var(--text-secondary)',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Building2 size={14} />
              <span>All Agency Overview</span>
            </button>
          </div>
        </div>

        {isAdmin && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={14} color="var(--text-muted)" />
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Filter by Employee:</span>
            <select
              className="form-control"
              style={{ width: '200px', padding: '6px 10px', fontSize: '12.5px' }}
              value={selectedEmployeeId}
              onChange={(e) => {
                setSelectedEmployeeId(e.target.value);
                if (e.target.value) setScope('my');
              }}
            >
              <option value="">All Team Members</option>
              {employeesList.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Agency Summary Banner */}
      <div className="agency-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={20} color="#60a5fa" />
          <span style={{ fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '13px' }}>
            {isMyView ? `PORTFOLIO WORKSPACE: ${stats?.employeeName || user?.name}` : 'AGENCY-WIDE INTELLIGENCE OVERVIEW'}
          </span>
        </div>
        <div className="banner-pill-group">
          <div className="banner-stat">
            <span>{isMyView ? 'My Clients:' : 'Total Clients:'}</span>
            <strong>{stats?.agencyBanner?.clients ?? 0}</strong>
          </div>
          <div className="banner-stat">
            <span>{isMyView ? 'My Websites:' : 'Total Websites:'}</span>
            <strong>{stats?.agencyBanner?.websites ?? 0}</strong>
          </div>
          <div className="banner-stat">
            <span>{isMyView ? 'My Audits:' : 'Total Audits:'}</span>
            <strong>{stats?.agencyBanner?.audits ?? 0}</strong>
          </div>
          <div className="banner-stat">
            <span>Average Health Score:</span>
            <strong style={{ color: '#34d399' }}>
              {stats?.agencyBanner?.avgScore || 76} / 100
            </strong>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div className="pulse-ring" style={{ margin: '0 auto 16px' }} />
          <p>Loading workspace audits and metrics...</p>
        </div>
      ) : (
        <>
          {/* Top 4 KPI Metrics */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div>
                <div className="metric-label">{isMyView ? 'My Assigned Clients' : 'Total Clients Managed'}</div>
                <div className="metric-value">{stats?.counts?.totalClients}</div>
                <div style={{ fontSize: '12px', color: '#10b981', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TrendingUp size={14} /> {isMyView ? 'In your portfolio' : 'Active accounts'}
                </div>
              </div>
              <div className="metric-icon-box" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                <Users size={22} />
              </div>
            </div>

            <div className="metric-card">
              <div>
                <div className="metric-label">{isMyView ? 'My Monitored Websites' : 'Monitored Websites'}</div>
                <div className="metric-value">{stats?.counts?.totalWebsites}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  {isMyView ? 'Under your management' : 'Across client portfolios'}
                </div>
              </div>
              <div className="metric-icon-box" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
                <Globe size={22} />
              </div>
            </div>

            <div className="metric-card">
              <div>
                <div className="metric-label">{isMyView ? 'Audits I Conducted' : 'Total Audits Executed'}</div>
                <div className="metric-value">{stats?.counts?.totalAudits}</div>
                <div style={{ fontSize: '12px', color: '#10b981', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} /> Full evaluations
                </div>
              </div>
              <div className="metric-icon-box" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#c084fc' }}>
                <Activity size={22} />
              </div>
            </div>

            <div className="metric-card">
              <div>
                <div className="metric-label">{isMyView ? 'My Portfolio Health' : 'Average Website Health'}</div>
                <div className="metric-value" style={{ color: '#34d399' }}>
                  {stats?.counts?.averageScore}
                  <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: 500 }}>/100</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Weighted formula score
                </div>
              </div>
              <div className="metric-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                <Award size={22} />
              </div>
            </div>
          </div>

          {/* 2-Column Analytics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', marginBottom: '28px' }}>
            {/* Score Distribution Chart */}
            <div className="glass-card">
              <div className="card-header-flex">
                <div>
                  <h3>Score Distribution</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {isMyView ? 'Breakdown of your client audit results' : 'Frequency of scores across agency audits'}
                  </p>
                </div>
              </div>

              <div style={{ height: '240px', marginTop: '16px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.distribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="range" stroke="#64748b" fontSize={12} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {(stats?.distribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Websites Requiring Attention */}
            <div className="glass-card">
              <div className="card-header-flex">
                <div>
                  <h3>Websites Requiring Attention</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {isMyView ? 'Your client properties under score 70' : 'Agency websites under score 70'}
                  </p>
                </div>
                <span className="badge-critical" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertTriangle size={12} />
                  {stats?.requiringAttention?.length || 0} Priority
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(!stats?.requiringAttention || stats.requiringAttention.length === 0) ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '16px 0' }}>
                    {isMyView ? 'All websites in your portfolio currently meet or exceed healthy thresholds.' : 'All websites meet or exceed healthy thresholds.'}
                  </p>
                ) : (
                  stats.requiringAttention.map((site) => (
                    <div
                      key={site.id}
                      style={{
                        background: 'rgba(244, 63, 94, 0.06)',
                        border: '1px solid rgba(244, 63, 94, 0.25)',
                        borderRadius: 'var(--radius-md)',
                        padding: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{site.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {site.clientName} • {site.url}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="score-badge score-low">
                          {site.currentScore || 0} / 100
                        </span>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onNavigate('new-audit', { url: site.url, clientId: site.clientId })}
                        >
                          Audit
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recent Audits Table */}
          <div className="glass-card">
            <div className="card-header-flex">
              <div>
                <h3>{isMyView ? 'My Recent Audits' : 'Recent Agency Website Audits'}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {isMyView ? 'Audits you have conducted or assigned to your clients' : 'Latest automated SEO and technical evaluation logs'}
                </p>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => onNavigate('new-audit')}
              >
                <Play size={14} fill="white" />
                <span>Run New Audit</span>
              </button>
            </div>

            <div className="table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Target Website & Client</th>
                    <th>Overall Score</th>
                    <th>Category Scores</th>
                    <th>Issues Detected</th>
                    <th>Conducted By</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(!stats?.recentAudits || stats.recentAudits.length === 0) ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '28px', color: 'var(--text-muted)' }}>
                        No audits found in your workspace yet. Click "Run New Audit" to evaluate a website!
                      </td>
                    </tr>
                  ) : (
                    stats.recentAudits.map((audit) => (
                      <tr key={audit.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {audit.clientName}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {audit.websiteUrl}
                          </div>
                        </td>
                        <td>
                          <span className={`score-badge ${getScoreClass(audit.overallScore)}`}>
                            {audit.overallScore} / 100
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                            <span title="On-Page">OP:{audit.categoryScores?.onPageSEO}</span>
                            <span>•</span>
                            <span title="Technical">TC:{audit.categoryScores?.technicalSEO}</span>
                            <span>•</span>
                            <span title="Performance">PF:{audit.categoryScores?.performance}</span>
                            <span>•</span>
                            <span title="Mobile">MB:{audit.categoryScores?.mobile}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {audit.counts?.critical > 0 && (
                              <span className="badge-critical">{audit.counts.critical} Crit</span>
                            )}
                            {audit.counts?.warnings > 0 && (
                              <span className="badge-warning">{audit.counts.warnings} Warn</span>
                            )}
                            <span className="badge-passed">{audit.counts?.passed || 0} Pass</span>
                          </div>
                        </td>
                        <td style={{ fontSize: '13px' }}>
                          <span style={{
                            color: audit.conductedBy === user?.name ? '#60a5fa' : 'inherit',
                            fontWeight: audit.conductedBy === user?.name ? 600 : 400
                          }}>
                            {audit.conductedBy} {audit.conductedBy === user?.name ? '(You)' : ''}
                          </span>
                        </td>
                        <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {new Date(audit.auditDate).toLocaleDateString()}
                        </td>
                        <td>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => onSelectAudit(audit.id)}
                          >
                            <span>View Results</span>
                            <ArrowUpRight size={13} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
