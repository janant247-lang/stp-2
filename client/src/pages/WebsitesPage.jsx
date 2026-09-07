import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  Globe,
  Plus,
  Search,
  Filter,
  Play,
  ExternalLink,
  History,
  Trash2,
  X,
  Sparkles,
  UserCheck,
  Building2
} from 'lucide-react';

export default function WebsitesPage({ onRunAudit, onSelectHistory }) {
  const { user, isAdmin } = useAuth();
  const [websites, setWebsites] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [scope, setScope] = useState(isAdmin ? 'agency' : 'my');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    clientId: '',
    url: '',
    name: '',
    type: 'E-Commerce'
  });

  const types = ['All Types', 'E-Commerce', 'Corporate', 'Healthcare', 'Blog', 'Portfolio', 'SaaS'];

  useEffect(() => {
    fetchData();
  }, [search, selectedType, scope]);

  const fetchData = async () => {
    try {
      let endpoint = `/websites?scope=${scope}&`;
      if (search) endpoint += `search=${encodeURIComponent(search)}&`;
      if (selectedType && selectedType !== 'All Types') {
        endpoint += `type=${encodeURIComponent(selectedType)}&`;
      }
      const [webData, clientData] = await Promise.all([
        api.get(endpoint),
        api.get('/clients?scope=agency')
      ]);
      setWebsites(webData);
      setClients(clientData);
      if (clientData.length > 0 && !formData.clientId) {
        setFormData(prev => ({ ...prev, clientId: clientData[0].id }));
      }
    } catch (err) {
      console.error('Failed to load websites', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWebsite = async (e) => {
    e.preventDefault();
    try {
      await api.post('/websites', formData);
      setShowModal(false);
      setFormData({
        clientId: clients[0]?.id || '',
        url: '',
        name: '',
        type: 'Corporate'
      });
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to add website');
    }
  };

  const handleDeleteWebsite = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove ${name}?`)) {
      try {
        await api.delete(`/websites/${id}`);
        fetchData();
      } catch (err) {
        alert(err.message || 'Failed to delete website');
      }
    }
  };

  const getScoreClass = (score) => {
    if (!score) return '';
    if (score >= 85) return 'score-high';
    if (score >= 70) return 'score-medium';
    return 'score-low';
  };

  return (
    <div>
      {/* Header */}
      <div className="card-header-flex" style={{ marginBottom: '24px' }}>
        <div>
          <h2>Monitored Websites & Web Properties</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginTop: '4px' }}>
            Client websites tracked for automated audits, SEO compliance, and performance metrics
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          <span>Add Client Website</span>
        </button>
      </div>

      {/* Scope Switcher Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={() => setScope('my')}
          className={`btn btn-sm ${scope === 'my' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <UserCheck size={14} />
          <span>My Clients' Websites</span>
        </button>
        <button
          onClick={() => setScope('agency')}
          className={`btn btn-sm ${scope === 'agency' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Building2 size={14} />
          <span>All Agency Websites</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-card"
        style={{
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
      >
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
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
            placeholder="Search by website URL, name, or client company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="var(--text-muted)" />
          <select
            className="form-control"
            style={{ width: '180px' }}
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Websites Table (FR-04) */}
      <div className="glass-card">
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Website Name & URL</th>
                <th>Client Company</th>
                <th>Website Type</th>
                <th>Current Health Score</th>
                <th>Last Audit Date</th>
                <th>Date Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {websites.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    {scope === 'my'
                      ? "No websites registered for your assigned clients yet. Switch to 'All Agency Websites' or add one!"
                      : "No websites found matching your search."}
                  </td>
                </tr>
              ) : (
                websites.map((web) => (
                  <tr key={web.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>
                        {web.name}
                      </div>
                      <a
                        href={web.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: '12px',
                          color: '#60a5fa',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontFamily: 'var(--font-mono)',
                          marginTop: '2px'
                        }}
                      >
                        <span>{web.url}</span>
                        <ExternalLink size={12} />
                      </a>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                        {web.clientName}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '12px',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        {web.type}
                      </span>
                    </td>
                    <td>
                      {web.currentScore ? (
                        <span className={`score-badge ${getScoreClass(web.currentScore)}`}>
                          {web.currentScore} / 100
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Not Audited</span>
                      )}
                    </td>
                    <td style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                      {web.lastAuditDate ? new Date(web.lastAuditDate).toLocaleDateString() : 'Pending'}
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(web.dateAdded).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => onRunAudit({ websiteId: web.id, clientId: web.clientId, url: web.url })}
                          title="Run Automated Audit Now"
                        >
                          <Play size={13} fill="white" />
                          <span>Audit</span>
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onSelectHistory(web.id)}
                          title="View Score Progression History"
                        >
                          <History size={13} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteWebsite(web.id, web.name)}
                          title="Remove Website"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Website Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="card-header-flex" style={{ marginBottom: '20px' }}>
              <h3>Link Website to Agency Client</h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowModal(false)}
                style={{ padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateWebsite}>
              <div className="form-group">
                <label className="form-label">Assign to Client *</label>
                <select
                  className="form-control"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  required
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company} ({c.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Website Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. ABC Furniture E-Commerce Store"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Website URL *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="https://abcfurniture.com"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Website Type</label>
                <select
                  className="form-control"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  {types.filter(t => t !== 'All Types').map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save and Register Website
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
