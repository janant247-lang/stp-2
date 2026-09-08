import React from 'react';
import { Sparkles, Play, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Topbar({ currentPageTitle, onQuickAudit }) {
  const { user } = useAuth();

  // Friendly time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'there';

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>{currentPageTitle}</h2>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {getGreeting()}, {firstName} 👋
          </div>
        </div>
        <span
          style={{
            fontSize: '11px',
            background: 'rgba(99, 102, 241, 0.12)',
            color: '#818cf8',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            padding: '4px 10px',
            borderRadius: '20px',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <Sparkles size={12} />
          <span>Agency Optimization System</span>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            fontSize: '12.5px',
            color: 'var(--text-secondary)',
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '5px 12px',
            borderRadius: '20px',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--color-success)',
              boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
              display: 'inline-block'
            }}
          />
          <span>All systems synced</span>
        </div>

        <button
          onClick={onQuickAudit}
          className="btn btn-primary btn-sm"
          style={{ padding: '8px 16px', borderRadius: '10px' }}
        >
          <Play size={14} fill="currentColor" />
          <span>New Audit</span>
        </button>
      </div>
    </header>
  );
}

