import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import {
  History,
  TrendingUp,
  Globe,
  Calendar,
  ArrowUpRight,
  Sparkles,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function AuditHistoryPage({ defaultWebsiteId, onSelectAudit }) {
  const [websites, setWebsites] = useState([]);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState(defaultWebsiteId || '');
  const [historyData, setHistoryData] = useState(null);
  const [auditsList, setAuditsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWebsites();
  }, []);

  useEffect(() => {
    if (selectedWebsiteId) {
      fetchWebsiteHistory(selectedWebsiteId);
    }
  }, [selectedWebsiteId]);

  const fetchWebsites = async () => {
    try {
      const data = await api.get('/websites');
      setWebsites(data);
      if (!selectedWebsiteId && data.length > 0) {
        setSelectedWebsiteId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load websites', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWebsiteHistory = async (webId) => {
    try {
      const [hist, allAudits] = await Promise.all([
        api.get(`/audits/history/${webId}`),
        api.get('/audits')
      ]);
      setHistoryData(hist);
      const filtered = allAudits.filter(a => a.websiteId === webId || (hist.website && a.websiteUrl === hist.website.url));
      setAuditsList(filtered);
    } catch (err) {
      console.error('Failed to fetch website history', err);
    }
  };

  const progression = historyData?.progression || [];
  const currentScore = progression.length > 0 ? progression[progression.length - 1].score : null;
  const initialScore = progression.length > 0 ? progression[0].score : null;
  const totalGrowth = (currentScore !== null && initialScore !== null) ? (currentScore - initialScore) : 0;

  return (
    <div>
      {/* Header & Website Selector */}
      <div className="card-header-flex" style={{ marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>Website Audit History & Score Progression</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginTop: '4px' }}>
            Track longitudinal SEO improvements and demonstrate tangible growth to clients
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Target Website:</span>
          <select
            className="form-control"
            style={{ width: '280px' }}
            value={selectedWebsiteId}
            onChange={(e) => setSelectedWebsiteId(e.target.value)}
          >
            {websites.map((w) => (
              <option key={w.id} value={w.id}>
                {w.clientName} ({w.name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary KPI Progression Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div>
            <div className="metric-label">Initial Health Score</div>
            <div className="metric-value" style={{ color: '#fbbf24' }}>
              {initialScore || '--'}
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/100</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {progression[0]?.month || 'First baseline'}
            </div>
          </div>
          <div className="metric-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <Calendar size={22} />
          </div>
        </div>

        <div className="metric-card">
          <div>
            <div className="metric-label">Current Latest Score</div>
            <div className="metric-value" style={{ color: '#34d399' }}>
              {currentScore || '--'}
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/100</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {progression[progression.length - 1]?.month || 'Current month'}
            </div>
          </div>
          <div className="metric-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <Award size={22} />
          </div>
        </div>

        <div className="metric-card">
          <div>
            <div className="metric-label">Net Measurable Growth</div>
            <div className="metric-value" style={{ color: '#60a5fa' }}>
              +{totalGrowth} Pts
            </div>
            <div style={{ fontSize: '12px', color: '#34d399', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={14} /> Optimization uplift
            </div>
          </div>
          <div className="metric-icon-box" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
            <Sparkles size={22} />
          </div>
        </div>
      </div>

      {/* PRD FR-15: Interactive Score Progression Line / Area Chart */}
      <div className="glass-card" style={{ marginBottom: '28px' }}>
        <div className="card-header-flex">
          <div>
            <h3>Audit Score Progression Chart</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Historical performance demonstrating improvement across audit iterations
            </p>
          </div>
          <span className="delta-badge-pos">
            <TrendingUp size={14} /> +{totalGrowth} Overall Improvement
          </span>
        </div>

        <div style={{ height: '320px', marginTop: '16px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={progression} margin={{ top: 15, right: 30, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
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
              <Area
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#scoreGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PRD FR-15: Month-by-Month Progress Table */}
      <div className="glass-card">
        <div className="card-header-flex">
          <div>
            <h3>Historical Progress Records</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Sequential log of all audit runs and monthly scores
            </p>
          </div>
        </div>

        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Timeline Interval / Month</th>
                <th>Overall Score</th>
                <th>Growth Progress</th>
                <th>Status Verdict</th>
              </tr>
            </thead>
            <tbody>
              {progression.map((item, idx) => {
                const prev = idx > 0 ? progression[idx - 1].score : null;
                const delta = prev !== null ? item.score - prev : 0;

                return (
                  <tr key={item.month + idx}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.month} {item.date && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({item.date})</span>}
                    </td>
                    <td>
                      <span className="score-badge score-high" style={{ fontSize: '13px' }}>
                        {item.score} / 100
                      </span>
                    </td>
                    <td>
                      {idx === 0 ? (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Initial Baseline</span>
                      ) : (
                        <span className={delta >= 0 ? 'delta-badge-pos' : 'delta-badge-neg'} style={{ fontSize: '12px' }}>
                          <TrendingUp size={12} />
                          {delta >= 0 ? `+${delta}` : delta} pts
                        </span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: item.score >= 80 ? '#34d399' : '#fbbf24' }}>
                        {item.score >= 85 ? 'Optimal Health' : item.score >= 70 ? 'Satisfactory' : 'Needs Work'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
