import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ClientsPage from './pages/ClientsPage';
import ClientDetailsPage from './pages/ClientDetailsPage';
import WebsitesPage from './pages/WebsitesPage';
import NewAuditPage from './pages/NewAuditPage';
import AuditProcessingPage from './pages/AuditProcessingPage';
import AuditResultsPage from './pages/AuditResultsPage';
import AuditReportPage from './pages/AuditReportPage';
import AuditHistoryPage from './pages/AuditHistoryPage';
import RecommendationsPage from './pages/RecommendationsPage';
import EmployeesPage from './pages/EmployeesPage';
import SettingsPage from './pages/SettingsPage';
import ChangePasswordModal from './components/ChangePasswordModal';

export default function App() {
  const { user, token, loading } = useAuth();

  // Page state routing
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [selectedAuditId, setSelectedAuditId] = useState(null);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState(null);
  const [auditConfig, setAuditConfig] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div className="pulse-ring" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)' }}>Initializing AeroAudit Platform...</p>
        </div>
      </div>
    );
  }

  // Not logged in -> show Login page (FR-01 & Scope)
  if (!token || !user) {
    return <LoginPage />;
  }

  // Navigation handlers
  const handleSelectClient = (clientId) => {
    setSelectedClientId(clientId);
    setCurrentPage('client-details');
  };

  const handleSelectAudit = (auditId) => {
    setSelectedAuditId(auditId);
    setCurrentPage('audit-results');
  };

  const handleSelectHistory = (websiteId) => {
    setSelectedWebsiteId(websiteId);
    setCurrentPage('audit-history');
  };

  const handleStartAuditRun = (config) => {
    setAuditConfig(config);
    setCurrentPage('audit-processing');
  };

  const handleAuditComplete = (auditRecord) => {
    setSelectedAuditId(auditRecord.id);
    setCurrentPage('audit-results');
  };

  const handleRunAuditForTarget = (targetConfig) => {
    setAuditConfig(targetConfig);
    setCurrentPage('new-audit');
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard': return 'Agency Executive Dashboard';
      case 'clients': return 'Client Portfolio Management';
      case 'client-details': return 'Client Specific Overview & Progression';
      case 'websites': return 'Monitored Client Websites';
      case 'new-audit': return 'Automated Website Audit';
      case 'audit-processing': return 'Live Audit Progress Scanner';
      case 'audit-results': return 'Comprehensive Audit Results & Scores';
      case 'audit-report': return 'Executive Printable Audit Report';
      case 'audit-history': return 'Score Progression History';
      case 'recommendations': return 'Actionable Recommendations Board';
      case 'employees': return 'Employee & Staff Access';
      case 'settings': return 'System Settings & Score Weights';
      default: return 'AeroAudit Portal';
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={(page) => {
          setCurrentPage(page);
        }}
        onChangePassword={() => setShowPasswordModal(true)}
      />

      <div className="main-content">
        <Topbar
          currentPageTitle={getPageTitle()}
          onQuickAudit={() => setCurrentPage('new-audit')}
          onChangePassword={() => setShowPasswordModal(true)}
        />

        <main className="page-body">
          {currentPage === 'dashboard' && (
            <DashboardPage
              onNavigate={(page, params) => {
                if (params) setAuditConfig(params);
                setCurrentPage(page);
              }}
              onSelectAudit={handleSelectAudit}
              onSelectClient={handleSelectClient}
            />
          )}

          {currentPage === 'clients' && (
            <ClientsPage
              onSelectClient={handleSelectClient}
              onRunAuditForClient={handleRunAuditForTarget}
            />
          )}

          {currentPage === 'client-details' && (
            <ClientDetailsPage
              clientId={selectedClientId || 'client-1'}
              onBack={() => setCurrentPage('clients')}
              onRunAudit={handleRunAuditForTarget}
              onSelectAudit={handleSelectAudit}
            />
          )}

          {currentPage === 'websites' && (
            <WebsitesPage
              onRunAudit={handleRunAuditForTarget}
              onSelectHistory={handleSelectHistory}
            />
          )}

          {currentPage === 'new-audit' && (
            <NewAuditPage
              initialData={auditConfig}
              onStartAudit={handleStartAuditRun}
            />
          )}

          {currentPage === 'audit-processing' && (
            <AuditProcessingPage
              auditConfig={auditConfig || { url: 'https://abcfurniture.com' }}
              onAuditComplete={handleAuditComplete}
              onAuditFail={() => setCurrentPage('new-audit')}
            />
          )}

          {currentPage === 'audit-results' && (
            <AuditResultsPage
              auditId={selectedAuditId || 'audit-abc-followup'}
              onBack={() => setCurrentPage('dashboard')}
              onViewReport={(id) => {
                setSelectedAuditId(id);
                setCurrentPage('audit-report');
              }}
              onViewHistory={(webId) => {
                setSelectedWebsiteId(webId);
                setCurrentPage('audit-history');
              }}
              onRunFollowUp={handleRunAuditForTarget}
            />
          )}

          {currentPage === 'audit-report' && (
            <AuditReportPage
              auditId={selectedAuditId || 'audit-abc-followup'}
              onBack={() => setCurrentPage('audit-results')}
            />
          )}

          {currentPage === 'audit-history' && (
            <AuditHistoryPage
              defaultWebsiteId={selectedWebsiteId || 'web-1'}
              onSelectAudit={handleSelectAudit}
            />
          )}

          {currentPage === 'recommendations' && (
            <RecommendationsPage />
          )}

          {currentPage === 'employees' && (
            <EmployeesPage />
          )}

          {currentPage === 'settings' && (
            <SettingsPage />
          )}
        </main>
      </div>

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
}
