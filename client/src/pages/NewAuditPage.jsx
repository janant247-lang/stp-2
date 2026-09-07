import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Play, Globe, CheckCircle2, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

export default function NewAuditPage({ initialData, onStartAudit }) {
  const [url, setUrl] = useState(initialData?.url || '');
  const [clientId, setClientId] = useState(initialData?.clientId || '');
  const [websiteId, setWebsiteId] = useState(initialData?.websiteId || '');
  const [clients, setClients] = useState([]);
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPrerequisites();
  }, []);

  const fetchPrerequisites = async () => {
    try {
      const [clientList, websiteList] = await Promise.all([
        api.get('/clients'),
        api.get('/websites')
      ]);
      setClients(clientList);
      setWebsites(websiteList);

      if (!clientId && clientList.length > 0) {
        setClientId(clientList[0].id);
      }
    } catch (err) {
      console.error('Failed to load clients and websites', err);
    }
  };

  const handleClientChange = (selectedClientId) => {
    setClientId(selectedClientId);
    const clientWebsites = websites.filter(w => w.clientId === selectedClientId);
    if (clientWebsites.length > 0) {
      setWebsiteId(clientWebsites[0].id);
      setUrl(clientWebsites[0].url);
    } else {
      setWebsiteId('');
    }
  };

  const handleWebsiteSelect = (selectedWebId) => {
    setWebsiteId(selectedWebId);
    const web = websites.find(w => w.id === selectedWebId);
    if (web) {
      setUrl(web.url);
      setClientId(web.clientId);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please provide a valid website URL');
      return;
    }
    setError('');
    let cleanUrl = url.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = 'https://' + cleanUrl;
    }
    onStartAudit({ url: cleanUrl, clientId, websiteId });
  };

  const quickSamples = [
    { label: 'ABC Furniture (Client)', url: 'https://abcfurniture.com', client: 'ABC Furniture Pvt Ltd' },
    { label: 'XYZ Tech Solutions', url: 'https://xyz.in', client: 'XYZ Tech Solutions' },
    { label: 'Apex Global Enterprise', url: 'https://apexglobal.org', client: 'Apex Global' },
    { label: 'Example Domain (Live Test)', url: 'https://example.com', client: 'General Test' }
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div className="brand-icon" style={{ width: '48px', height: '48px', margin: '0 auto 16px' }}>
          <Sparkles size={24} />
        </div>
        <h1 style={{ fontSize: '26px', marginBottom: '8px' }}>Trigger Website Audit</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Run an automated, multi-parameter audit across On-Page SEO, Technical SEO, Performance, Mobile, and Content.
        </p>
      </div>

      <div className="glass-card" style={{ padding: '36px', boxShadow: 'var(--shadow-lg)' }}>
        {error && (
          <div
            style={{
              background: 'var(--color-critical-bg)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#fb7185',
              fontSize: '13px',
              marginBottom: '24px'
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* PRD Section 7 (FR-05): URL Input and RUN AUDIT button */}
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" style={{ fontSize: '14px', fontWeight: 700 }}>
              Website URL:
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Globe
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--primary)'
                  }}
                />
                <input
                  type="text"
                  className="form-control"
                  style={{
                    paddingLeft: '42px',
                    fontSize: '15px',
                    height: '50px',
                    fontFamily: 'var(--font-mono)'
                  }}
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{
                  minWidth: '170px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase'
                }}
              >
                <Play size={16} fill="white" />
                <span>RUN AUDIT</span>
              </button>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
              Standard format: https://domain.com (HTTP / HTTPS protocol auto-formatted)
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              padding: '20px',
              background: 'rgba(15, 23, 42, 0.4)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '24px'
            }}
          >
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Associate with Client</label>
              <select
                className="form-control"
                value={clientId}
                onChange={(e) => handleClientChange(e.target.value)}
              >
                <option value="">-- Standalone Audit (No Client) --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company} ({c.name})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Linked Monitored Property</label>
              <select
                className="form-control"
                value={websiteId}
                onChange={(e) => handleWebsiteSelect(e.target.value)}
              >
                <option value="">-- Target Website --</option>
                {websites
                  .filter((w) => !clientId || w.clientId === clientId)
                  .map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.url})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Quick Select Preset Targets */}
          <div>
            <div
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-muted)',
                marginBottom: '10px',
                fontWeight: 700
              }}
            >
              Suggested Testing Targets (Click to Fill)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              {quickSamples.map((sample) => (
                <div
                  key={sample.url}
                  onClick={() => {
                    setUrl(sample.url);
                    const matchedClient = clients.find(c => c.company.includes(sample.client.split(' ')[0]));
                    if (matchedClient) setClientId(matchedClient.id);
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 12px',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                >
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {sample.label}
                  </div>
                  <div style={{ fontSize: '11px', color: '#60a5fa', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    {sample.url}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
