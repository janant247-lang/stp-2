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
  Sparkles
} from 'lucide-react';

export default function Sidebar({ currentPage, setCurrentPage }) {
  const { user, logout, isAdmin } = useAuth();

  const workspaceNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'websites', label: 'Websites', icon: Globe }
  ];

  const auditNav = [
    { id: 'new-audit', label: 'New Audit', icon: PlusCircle },
    { id: 'audit-history', label: 'Audit History', icon: History },
    { id: 'recommendations', label: 'Recommendations', icon: Lightbulb }
  ];

  const adminNav = [
    { id: 'employees', label: 'Team Members', icon: ShieldCheck, role: 'admin' },
    { id: 'settings', label: 'Agency Settings', icon: Settings, role: 'admin' }
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Sparkles size={20} />
        </div>
        <div>
          <div className="brand-title">AeroAudit</div>
          <div className="brand-sub">Growth & SEO Studio</div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="nav-menu">
        <div className="nav-section-title">Daily Workspace</div>
        {workspaceNav.map((item) => {
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

        <div className="nav-section-title" style={{ marginTop: '16px' }}>
          Auditing & Insights
        </div>
        {auditNav.map((item) => {
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

        {isAdmin && (
          <>
            <div className="nav-section-title" style={{ marginTop: '16px' }}>
              Administration
            </div>
            {adminNav.map((item) => {
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
          </>
        )}
      </nav>

      {/* User Footer */}
      <div className="sidebar-user">
        <div className="user-badge">
          <div className="user-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {user?.name || 'Team Member'}
            </div>
            <span className={`user-role-tag ${isAdmin ? 'role-admin' : 'role-employee'}`}>
              {isAdmin ? 'Administrator' : 'Specialist'}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="btn btn-secondary btn-sm"
          title="Sign Out"
          style={{ padding: '8px 10px', borderRadius: '8px' }}
        >
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  );
}

