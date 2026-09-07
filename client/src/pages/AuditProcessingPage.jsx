import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import {
  Globe,
  Search,
  Cpu,
  Smartphone,
  FileText,
  CheckCircle2,
  Loader2,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function AuditProcessingPage({ auditConfig, onAuditComplete, onAuditFail }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(10);
  const [error, setError] = useState(null);

  const steps = [
    { title: 'Network Connection & HTML Retrieval', desc: 'Fetching target headers, verifying SSL certificate, measuring TTFB latency', icon: Globe },
    { title: 'On-Page SEO Inspection', desc: 'Analyzing title tag, meta description, H1/H2 hierarchy, and image ALT attributes', icon: Search },
    { title: 'Technical SEO & Crawlability', desc: 'Checking /robots.txt, /sitemap.xml, canonical tags, and noindex directives', icon: Cpu },
    { title: 'Performance & Resource Analysis', desc: 'Calculating page weight, payload size, and resource request count', icon: Loader2 },
    { title: 'Mobile Compatibility Analysis', desc: 'Validating viewport meta tags and responsive CSS media query breakpoints', icon: Smartphone },
    { title: 'Content Analysis & Recommendations', desc: 'Evaluating text density and generating prioritized actionable recommendations', icon: FileText }
  ];

  useEffect(() => {
    let interval;
    // Animate progress smoothly through steps while backend executes
    interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 90) {
          const next = prev + 3;
          const stepIndex = Math.min(steps.length - 1, Math.floor((next / 90) * steps.length));
          setCurrentStep(stepIndex);
          return next;
        }
        return prev;
      });
    }, 400);

    // Call real backend audit endpoint
    const executeAudit = async () => {
      try {
        const response = await api.post('/audits/run', {
          url: auditConfig.url,
          clientId: auditConfig.clientId,
          websiteId: auditConfig.websiteId
        });
        setProgress(100);
        setCurrentStep(steps.length - 1);
        setTimeout(() => {
          onAuditComplete(response.audit);
        }, 800);
      } catch (err) {
        console.error('Audit failed', err);
        setError(err.message || 'Audit execution failed');
      } finally {
        clearInterval(interval);
      }
    };

    executeAudit();

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ maxWidth: '720px', margin: '40px auto', textAlign: 'center' }}>
      <div className="glass-card" style={{ padding: '40px 36px' }}>
        {/* Animated Scanner Ring */}
        <div className="pulse-ring" style={{ margin: '0 auto 24px' }}>
          <Sparkles size={32} color="#3b82f6" />
        </div>

        <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>
          Automated Audit in Progress
        </h2>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            color: '#60a5fa',
            background: 'rgba(59, 130, 246, 0.1)',
            padding: '6px 16px',
            borderRadius: '20px',
            display: 'inline-block',
            marginBottom: '28px',
            border: '1px solid rgba(59, 130, 246, 0.25)'
          }}
        >
          {auditConfig.url}
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span>Auditing Parameters</span>
            <span>{progress}%</span>
          </div>
          <div
            style={{
              height: '8px',
              width: '100%',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'var(--gradient-brand)',
                borderRadius: '4px',
                transition: 'width 0.3s ease-out'
              }}
            />
          </div>
        </div>

        {error ? (
          <div
            style={{
              background: 'var(--color-critical-bg)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              textAlign: 'left',
              color: '#fb7185'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '6px' }}>
              <AlertCircle size={18} />
              <span>Audit Encountered an Issue</span>
            </div>
            <p style={{ fontSize: '13px' }}>{error}</p>
            <button
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '14px' }}
              onClick={onAuditFail}
            >
              Return to Audit Setup
            </button>
          </div>
        ) : (
          /* Step-by-Step Milestones Checklist */
          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStep || progress === 100;
              const isCurrent = index === currentStep && progress < 100;

              return (
                <div
                  key={step.title}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: isCurrent
                      ? 'rgba(59, 130, 246, 0.1)'
                      : isCompleted
                      ? 'rgba(16, 185, 129, 0.05)'
                      : 'transparent',
                    border: isCurrent
                      ? '1px solid rgba(59, 130, 246, 0.3)'
                      : isCompleted
                      ? '1px solid rgba(16, 185, 129, 0.2)'
                      : '1px solid transparent',
                    transition: 'var(--transition)'
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isCompleted
                        ? 'rgba(16, 185, 129, 0.15)'
                        : isCurrent
                        ? 'rgba(59, 130, 246, 0.2)'
                        : 'rgba(255, 255, 255, 0.05)',
                      color: isCompleted ? '#10b981' : isCurrent ? '#60a5fa' : 'var(--text-muted)'
                    }}
                  >
                    {isCompleted ? <CheckCircle2 size={18} /> : <Icon size={16} />}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: '13.5px',
                        fontWeight: 600,
                        color: isCompleted ? '#10b981' : isCurrent ? 'var(--text-primary)' : 'var(--text-muted)'
                      }}
                    >
                      {step.title}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {step.desc}
                    </div>
                  </div>

                  {isCurrent && (
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: 'rgba(59, 130, 246, 0.2)',
                        color: '#60a5fa',
                        fontWeight: 600
                      }}
                    >
                      Analyzing...
                    </span>
                  )}
                  {isCompleted && (
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#10b981',
                        fontWeight: 600
                      }}
                    >
                      Done
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
