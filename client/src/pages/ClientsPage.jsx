import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Plus,
  Search,
  Filter,
  Globe,
  Mail,
  Phone,
  Briefcase,
  ArrowRight,
  Trash2,
  Edit2,
  X,
  UserCheck,
  Building2
} from 'lucide-react';

export default function ClientsPage({ onSelectClient, onRunAuditForClient }) {
  const { user, isAdmin } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [scope, setScope] = useState(isAdmin ? 'agency' : 'my');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    industry: 'E-Commerce & Retail',
    website: '',
    assignedEmployee: user?.name || 'John Miller'
  });

  const industries = [
    'All Industries',
    'E-Commerce & Retail',
    'Information Technology',
    'Healthcare & Medical',
    'Finance & Banking',
    'Real Estate & Construction',
    'Education & EdTech'
  ];

  useEffect(() => {
    fetchClients();
  }, [search, selectedIndustry, scope]);

  const fetchClients = async () => {
    try {
      let endpoint = `/clients?scope=${scope}&`;
      if (search) endpoint += `search=${encodeURIComponent(search)}&`;
      if (selectedIndustry && selectedIndustry !== 'All Industries') {
        endpoint += `industry=${encodeURIComponent(selectedIndustry)}&`;
      }
      const data = await api.get(endpoint);
      setClients(data);
    } catch (err) {
      console.error('Failed to fetch clients', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      industry: 'E-Commerce & Retail',
      website: '',
      assignedEmployee: user?.name || 'John Miller'
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (client, e) => {
    e.stopPropagation();
    setEditingClient(client);
    setFormData({
      name: client.name || '',
      company: client.company || '',
      email: client.email || '',
      phone: client.phone || '',
      industry: client.industry || 'E-Commerce & Retail',
      website: client.website || '',
      assignedEmployee: client.assignedEmployee || user?.name || 'John Miller'
    });
    setShowModal(true);
  };

  const handleDeleteClient = async (id, company, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${company}?`)) {
      try {
        await api.delete(`/clients/${id}`);
        fetchClients();
      } catch (err) {
        alert(err.message || 'Failed to delete client');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await api.put(`/clients/${editingClient.id}`, formData);
      } else {
        await api.post('/clients', formData);
      }
      setShowModal(false);
      fetchClients();
    } catch (err) {
      alert(err.message || 'Operation failed');
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
      {/* Header with Search and Actions */}
      <div className="card-header-flex" style={{ marginBottom: '24px' }}>
        <div>
          <h2>Client Portfolio Management</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginTop: '4px' }}>
            Manage agency clients, contact details, and their monitored web properties
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreateModal}>
          <Plus size={16} />
          <span>Add New Client</span>
        </button>
      </div>

      {/* Scope Switcher Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={() => setScope('my')}
          className={`btn btn-sm ${scope === 'my' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <UserCheck size={14} />
          <span>My Assigned Clients</span>
        </button>
        <button
          onClick={() => setScope('agency')}
          className={`btn btn-sm ${scope === 'agency' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Building2 size={14} />
          <span>All Agency Clients</span>
        </button>
      </div>

      {/* Filter and Search Bar (FR-17) */}
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
            placeholder="Search by client name, company, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="var(--text-muted)" />
          <select
            className="form-control"
            style={{ width: '210px' }}
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
          >
            {industries.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clients Table */}
      <div className="glass-card">
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Client Company & Contact</th>
                <th>Industry</th>
                <th>Primary Website</th>
                <th>Health Score</th>
                <th>Assigned Auditor</th>
                <th>Date Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    {scope === 'my'
                      ? 'No clients currently assigned to your account. Switch to "All Agency Clients" or create a new client!'
                      : 'No clients found matching your search criteria.'}
                  </td>
                </tr>
              ) : (
                clients.map((client) => {
                  const isAssignedToMe = client.assignedEmployee === user?.name || client.assignedEmployeeId === user?.id;

                  return (
                    <tr
                      key={client.id}
                      onClick={() => onSelectClient(client.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14.5px' }}>
                            {client.company}
                          </div>
                          {isAssignedToMe && (
                            <span
                              style={{
                                fontSize: '10px',
                                background: 'rgba(59, 130, 246, 0.2)',
                                color: '#60a5fa',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontWeight: 700
                              }}
                            >
                              Yours
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <span>{client.name}</span>
                          <span>•</span>
                          <span>{client.email}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '12px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            border: '1px solid var(--border-subtle)'
                          }}
                        >
                          {client.industry}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
                          <Globe size={14} color="#60a5fa" />
                          <span style={{ color: '#60a5fa' }}>{client.website || 'No website'}</span>
                        </div>
                      </td>
                      <td>
                        {client.currentScore ? (
                          <span className={`score-badge ${getScoreClass(client.currentScore)}`}>
                            {client.currentScore} / 100
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Un-audited</span>
                        )}
                      </td>
                      <td style={{ fontSize: '13px' }}>
                        <span style={{ color: isAssignedToMe ? '#60a5fa' : 'inherit', fontWeight: isAssignedToMe ? 600 : 400 }}>
                          {client.assignedEmployee} {isAssignedToMe ? '(You)' : ''}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {new Date(client.dateAdded || client.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={(e) => handleOpenEditModal(client, e)}
                            title="Edit Client"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={(e) => handleDeleteClient(client.id, client.company, e)}
                            title="Delete Client"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Client Modal (FR-03) */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="card-header-flex" style={{ marginBottom: '20px' }}>
              <h3>{editingClient ? 'Edit Client Profile' : 'Register New Agency Client'}</h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowModal(false)}
                style={{ padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Contact Person Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Rajesh Kumar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. ABC Furniture Pvt Ltd"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="contact@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Industry</label>
                <select
                  className="form-control"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                >
                  {industries.filter((i) => i !== 'All Industries').map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Primary Website URL</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="https://abcfurniture.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Agency Employee</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.assignedEmployee}
                  onChange={(e) => setFormData({ ...formData, assignedEmployee: e.target.value })}
                  placeholder="Employee Name"
                />
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
                  {editingClient ? 'Save Changes' : 'Create Client Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
