import React from 'react';
import { Sparkles, Shield, Play, KeyRound } from 'lucide-react';

export default function Topbar({ currentPageTitle, onQuickAudit, onChangePassword }) {
  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>{currentPageTitle}</h2>
        <span
          style={{
            fontSize: '11px',
            background: 'rgba(59, 130, 246, 0.1)',
            color: '#60a5fa',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            padding: '3px 8px',
            borderRadius: '12px',
            fontWeight: 600
          }}
        >
          Enterprise SEO Intelligence
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: 'var(--text-muted)'
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--color-success)',
              display: 'inline-block'
            }}
          />
          <span>API Connected (Port 5000)</span>
        </div>

        <button
          onClick={onChangePassword}
          className="btn btn-secondary btn-sm"
          style={{ padding: '8px 12px' }}
          title="Change Password"
        >
          <KeyRound size={14} />
          <span>Change Password</span>
        </button>

        <button
          onClick={onQuickAudit}
          className="btn btn-primary btn-sm"
          style={{ padding: '8px 14px' }}
        >
          <Play size={14} fill="white" />
          <span>Run Audit</span>
        </button>
      </div>
    </header>
  );
}
