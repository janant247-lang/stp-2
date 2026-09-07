import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import {
  ShieldCheck,
  Plus,
  User,
  Mail,
  Lock,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  Sparkles
} from 'lucide-react';

export default function EmployeesPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'EMPLOYEE'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await api.get('/users');
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', formData);
      setShowModal(false);
      setFormData({ name: '', email: '', password: '', role: 'EMPLOYEE' });
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to create user account');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      await api.patch(`/users/${id}/status`, { status: nextStatus });
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Status update failed');
    }
  };

  const handleToggleRole = async (id, currentRole) => {
    const nextRole = currentRole === 'ADMIN' ? 'EMPLOYEE' : 'ADMIN';
    try {
      await api.patch(`/users/${id}/role`, { role: nextRole });
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Role update failed');
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (window.confirm(`Delete account for ${name}?`)) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (err) {
        alert(err.message || 'Failed to delete account');
      }
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="card-header-flex" style={{ marginBottom: '24px' }}>
        <div>
          <h2>Employee & Staff Access Management</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginTop: '4px' }}>
            PRD FR-18: Manage agency team members, role-based authorization, and account states
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          <span>Add Employee Account</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="glass-card">
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Team Member</th>
                <th>Email Address</th>
                <th>System Role</th>
                <th>Status</th>
                <th>Assigned Clients</th>
                <th>Date Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isActive = user.status === 'ACTIVE';

                return (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '13px' }}>
                          {user.name.charAt(0)}
                        </div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</div>
                      </div>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{user.email}</td>
                    <td>
                      <button
                        onClick={() => handleToggleRole(user.id, user.role)}
                        title="Click to toggle role"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <span className={`user-role-tag ${user.role === 'ADMIN' ? 'role-admin' : 'role-employee'}`}>
                          {user.role} ⇅
                        </span>
                      </button>
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: isActive ? '#34d399' : '#fb7185'
                        }}
                      >
                        {isActive ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        {user.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px' }}>
                      {user.clientsCount || 0} clients
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(user.dateAdded || user.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className={`btn btn-sm ${isActive ? 'btn-secondary' : 'btn-primary'}`}
                          onClick={() => handleToggleStatus(user.id, user.status)}
                        >
                          {isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          title="Delete User"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="card-header-flex" style={{ marginBottom: '20px' }}>
              <h3>Create Agency Employee Account</h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowModal(false)}
                style={{ padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Alex Henderson"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Agency Email *</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="alex@agency.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Temporary Password *</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">System Role</label>
                <select
                  className="form-control"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="EMPLOYEE">Digital Marketing Employee (Audits & Clients)</option>
                  <option value="ADMIN">Administrator (Full Access & Configuration)</option>
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
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
