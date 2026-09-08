import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Shield,
  User,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ArrowLeft,
  Mail,
  Info
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();

  // 'login' | 'forgot-email' | 'forgot-reset' | 'reset-success'
  const [view, setView] = useState('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Forgot password form state
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [demoCodeHint, setDemoCodeHint] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  const handleRequestResetCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to request password reset.');
      }
      setDemoCodeHint(data.resetCode || '');
      setSuccessMsg('Reset code generated successfully! Enter the code below to reset your password.');
      setView('forgot-reset');
    } catch (err) {
      setError(err.message || 'Could not find an account with that email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail,
          code: resetCode,
          newPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to reset password.');
      }
      setView('reset-success');
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please check your code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        background: 'radial-gradient(ellipse at 50% 15%, rgba(99, 102, 241, 0.18) 0%, #0d111c 70%)'
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '38px',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.65)'
        }}
      >
        {/* Branding & Friendly Welcome */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div
            className="brand-icon"
            style={{
              width: '52px',
              height: '52px',
              margin: '0 auto 16px',
              borderRadius: '16px',
              boxShadow: '0 10px 25px rgba(99, 102, 241, 0.35)'
            }}
          >
            <Sparkles size={28} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>
            AeroAudit Studio
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: 1.5 }}>
            {view === 'login' && 'Welcome back! Please sign in to access your client audits.'}
            {view === 'forgot-email' && 'Forgot your password? No worries, we will help you reset it.'}
            {view === 'forgot-reset' && 'Enter your verification code and choose a new password.'}
            {view === 'reset-success' && 'You are all set! Your password has been updated.'}
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div
            style={{
              background: 'var(--color-critical-bg)',
              border: '1px solid rgba(244, 63, 94, 0.35)',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#fb7185',
              fontSize: '13px',
              marginBottom: '20px'
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Success / Info Notification */}
        {successMsg && (
          <div
            style={{
              background: 'var(--color-success-bg)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#34d399',
              fontSize: '13px',
              marginBottom: '20px'
            }}
          >
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ================= VIEW 1: LOGIN ================= */}
        {view === 'login' && (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label">Work Email</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '42px', borderRadius: '12px' }}
                  placeholder="name@agency.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <User
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email || '');
                    setError('');
                    setSuccessMsg('');
                    setView('forgot-email');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#818cf8',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => (e.target.style.color = '#a5b4fc')}
                  onMouseLeave={(e) => (e.target.style.color = '#818cf8')}
                >
                  Forgot password?
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '42px', borderRadius: '12px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px', borderRadius: '12px', fontSize: '14px', fontWeight: 600 }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In to Workspace'}
              <ArrowRight size={16} />
            </button>

            {/* Quick Demo Accounts */}
            <div style={{ marginTop: '28px', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
              <div
                style={{
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--text-muted)',
                  marginBottom: '12px',
                  textAlign: 'center',
                  fontWeight: 700
                }}
              >
                Quick Demo Accounts
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ borderRadius: '10px', padding: '9px 12px' }}
                  onClick={() => handleQuickLogin('admin@agency.com', 'admin123')}
                >
                  <Shield size={14} color="#c084fc" />
                  <span>Admin Login</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ borderRadius: '10px', padding: '9px 12px' }}
                  onClick={() => handleQuickLogin('employee@agency.com', 'employee123')}
                >
                  <User size={14} color="#60a5fa" />
                  <span>Employee Login</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ================= VIEW 2: FORGOT PASSWORD (ENTER EMAIL) ================= */}
        {view === 'forgot-email' && (
          <form onSubmit={handleRequestResetCode}>
            <div className="form-group" style={{ marginBottom: '22px' }}>
              <label className="form-label">Registered Account Email</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '42px', borderRadius: '12px' }}
                  placeholder="name@agency.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                We will generate a secure 6-digit recovery code for your account.
              </p>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px', borderRadius: '12px', fontSize: '14px', fontWeight: 600 }}
              disabled={loading}
            >
              {loading ? 'Generating Code...' : 'Send Recovery Code'}
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => {
                setError('');
                setSuccessMsg('');
                setView('login');
              }}
              className="btn btn-secondary"
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '11px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <ArrowLeft size={15} />
              <span>Back to Sign In</span>
            </button>
          </form>
        )}

        {/* ================= VIEW 3: ENTER CODE & NEW PASSWORD ================= */}
        {view === 'forgot-reset' && (
          <form onSubmit={handleResetPassword}>
            {demoCodeHint && (
              <div
                style={{
                  background: 'rgba(99, 102, 241, 0.12)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  marginBottom: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '12.5px',
                  color: '#a5b4fc'
                }}
              >
                <Info size={16} style={{ flexShrink: 0 }} />
                <div>
                  <strong>Demo Reset Code:</strong> <code style={{ color: '#fff', fontWeight: 700 }}>{demoCodeHint}</code>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">6-Digit Verification Code</label>
              <input
                type="text"
                className="form-control"
                style={{
                  borderRadius: '12px',
                  letterSpacing: '0.2em',
                  fontSize: '16px',
                  textAlign: 'center',
                  fontWeight: 700
                }}
                maxLength={6}
                placeholder="123456"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password (Min. 6 chars)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '42px', borderRadius: '12px' }}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '22px' }}>
              <label className="form-label">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '42px', borderRadius: '12px' }}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px', borderRadius: '12px', fontSize: '14px', fontWeight: 600 }}
              disabled={loading}
            >
              {loading ? 'Updating Password...' : 'Reset & Save Password'}
              <CheckCircle2 size={16} />
            </button>

            <button
              type="button"
              onClick={() => {
                setError('');
                setSuccessMsg('');
                setView('forgot-email');
              }}
              className="btn btn-secondary"
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '11px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <ArrowLeft size={15} />
              <span>Back</span>
            </button>
          </form>
        )}

        {/* ================= VIEW 4: RESET SUCCESS ================= */}
        {view === 'reset-success' && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'var(--color-success-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: '#34d399'
              }}
            >
              <CheckCircle2 size={32} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Password Reset Successful!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px', lineHeight: 1.5 }}>
              Your account password has been updated. You can now sign in using your new credentials.
            </p>
            <button
              type="button"
              onClick={() => {
                setEmail(resetEmail);
                setPassword('');
                setError('');
                setSuccessMsg('');
                setView('login');
              }}
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px', borderRadius: '12px', fontSize: '14px', fontWeight: 600 }}
            >
              Return to Sign In
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
