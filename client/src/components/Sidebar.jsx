import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Globe,
  PlusCircle,
  History,
  Lightbulb,
  ShieldCheck,
  Settings,
  LogOut,
  Sparkles,
  KeyRound
} from 'lucide-react';

export default function Sidebar({ currentPage, setCurrentPage, onChangePassword }) {
  const { user, logout, isAdmin } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, role: 'all' },
    { id: 'clients', label: 'Clients', icon: Users, role: 'all' },
    { id: 'websites', label: 'Websites', icon: Globe, role: 'all' },
    { id: 'new-audit', label: 'New Audit', icon: PlusCircle, role: 'all' },
    { id: 'audit-history', label: 'Audit History', icon: History, role: 'all' },
    { id: 'recommendations', label: 'Recommendations', icon: Lightbulb, role: 'all' },
    { id: 'employees', label: 'Employees', icon: ShieldCheck, role: 'admin' },
    { id: 'settings', label: 'Settings', icon: Settings, role: 'admin' }
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Sparkles size={20} />
        </div>
        <div>
          <div className="brand-title">AeroAudit Pro</div>
          <div className="brand-sub">Agency Edition</div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="nav-menu">
        <div className="nav-section-title">Core Management</div>
        {navItems.map((item) => {
          if (item.role === 'admin' && !isAdmin) return null;
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <div
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setCurrentPage(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="sidebar-user">
        <div className="user-badge" style={{ cursor: 'pointer' }} onClick={onChangePassword} title="Click to Change Password">
          <div className="user-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>{user?.name || 'Agency User'}</div>
            <span className={`user-role-tag ${isAdmin ? 'role-admin' : 'role-employee'}`}>
              {user?.role}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={onChangePassword}
            className="btn btn-secondary btn-sm"
            title="Change Password"
            style={{ padding: '6px 8px' }}
          >
            <KeyRound size={15} />
          </button>
          <button
            onClick={logout}
            className="btn btn-secondary btn-sm"
            title="Sign Out"
            style={{ padding: '6px 8px' }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
