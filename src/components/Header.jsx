import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { sendConversationEmail } from '../services/email';
import jsPDF from 'jspdf';

function Header({ onClearChat, onToggleCompact, isCompact, messages, onToggleSidebar, onToggleFocus, focusMode, onShare }) {
  const { language, t } = useLanguage();
  const { showToast } = useToast();

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  const handleClearChat = () => setShowClearConfirm(true);

  const confirmClear = () => {
    onClearChat();
    setShowClearConfirm(false);
  };

  const formatTimestamp = () => {
    const d = new Date();
    return d.toISOString().slice(0, 19).replace('T', ' ');
  };

  const exportAsTXT = () => {
    const header = `Cortex Chat Export\n${formatTimestamp()}\n${'='.repeat(40)}\n\n`;
    const content = messages
      .map(m => {
        const label = m.type === 'user' ? 'User' : 'Cortex';
        const time = m.id ? new Date(m.id).toLocaleTimeString() : '';
        return `[${time}] ${label}:\n${m.text}`;
      })
      .join('\n\n---\n\n');

    const blob = new Blob([header + content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cortex-chat-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
    showToast('Exported as TXT', 'success');
  };

  const exportAsMarkdown = () => {
    const header = `# Cortex Chat Export\n\n*Exported: ${formatTimestamp()}*\n\n`;
    const content = messages
      .map(m => {
        const label = m.type === 'user' ? '**User**' : '**Cortex**';
        return `${label}\n\n${m.text}\n`;
      })
      .join('\n---\n\n');

    const blob = new Blob([header + content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cortex-chat-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
    showToast('Exported as Markdown', 'success');
  };

  const exportAsPDF = () => {
    const isRTL = language === 'ar';
    const doc = new jsPDF();
    let y = 20;
    let page = 1;

    const addFooter = () => {
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${page}`, isRTL ? 190 : 10, 290);
      doc.text('Cortex AI', isRTL ? 10 : 190, 290, { align: isRTL ? 'left' : 'right' });
    };

    doc.setFontSize(18);
    doc.setTextColor(32, 201, 151);
    doc.text('Cortex Chat Export', isRTL ? 190 : 20, y, { align: isRTL ? 'right' : 'left' });
    y += 10;

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Exported: ${formatTimestamp()}`, isRTL ? 190 : 20, y, { align: isRTL ? 'right' : 'left' });
    y += 15;

    messages.forEach((msg) => {
      const label = msg.type === 'user' ? (language === 'ar' ? 'المستخدم' : 'User') : 'Cortex';
      doc.setFontSize(11);
      doc.setTextColor(32, 201, 151);
      doc.setFont(undefined, 'bold');
      doc.text(label + ':', isRTL ? 190 : 20, y, { align: isRTL ? 'right' : 'left' });
      y += 8;

      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      doc.setTextColor(230);

      const lines = doc.splitTextToSize(msg.text, 170);
      lines.forEach(line => {
        if (y > 275) {
          addFooter();
          doc.addPage();
          page++;
          y = 20;
        }
        doc.text(line, isRTL ? 190 : 20, y, { align: isRTL ? 'right' : 'left' });
        y += 7;
      });
      y += 5;
    });

    addFooter();
    doc.save(`cortex-chat-${Date.now()}.pdf`);
    setShowExportMenu(false);
    showToast('Exported as PDF', 'success');
  };

  const handleSendEmail = async () => {
    if (!emailAddress.trim()) return;
    setSendingEmail(true);
    try {
      await sendConversationEmail({
        toEmail: emailAddress.trim(),
        conversation: messages,
        language,
      });
      showToast('Email sent successfully!', 'success');
      setShowEmailModal(false);
      setEmailAddress('');
    } catch (err) {
      showToast(err.message === 'EmailJS not configured'
        ? (language === 'ar' ? 'خدمة البريد الإلكتروني قريباً' : 'Email feature coming soon')
        : 'Failed to send email', 'warning');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <header className="app-header">
      <div className="branding">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            className="action-btn"
            onClick={onToggleSidebar}
            title="Toggle Sidebar"
            style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div>
            <h1 className="app-title">{t.appName}</h1>
            <p className="app-subtitle">{t.subtitle}</p>
          </div>
        </div>

        <div className="header-actions">
          <div className="language-switcher">
            <button
              className={`lang-btn ${language === 'ar' ? 'active' : ''}`}
              onClick={() => setLanguage('ar')}
            >
              {t.languageAr}
            </button>
            <button
              className={`lang-btn ${language === 'en' ? 'active' : ''}`}
              onClick={() => setLanguage('en')}
            >
              {t.languageEn}
            </button>
          </div>

          <div className="action-buttons">
            <button
              className={`action-btn ${isCompact ? 'active' : ''}`}
              onClick={onToggleCompact}
              title={t.compactMode}
            >
              ⊟
            </button>

            <button
              className={`action-btn ${focusMode ? 'active' : ''}`}
              onClick={onToggleFocus}
              title={t.focusMode}
            >
              ◎
            </button>

            <div className="export-menu-container">
              <button
                className="action-btn"
                onClick={() => setShowExportMenu(!showExportMenu)}
                title={t.export}
                disabled={messages.length === 0}
              >
                ⬇
              </button>
              {showExportMenu && (
                <div className="export-dropdown">
                  <button onClick={exportAsPDF}>{t.exportPDF}</button>
                  <button onClick={exportAsTXT}>{t.exportTXT}</button>
                  <button onClick={exportAsMarkdown}>{t.exportMD}</button>
                  <button onClick={() => { setShowExportMenu(false); setShowEmailModal(true); }}>
                    {t.sendEmail}
                  </button>
                </div>
              )}
            </div>

            <button
              className="action-btn"
              onClick={() => { if (onShare) onShare(); }}
              title="Share"
              disabled={messages.length === 0}
            >
              🔗
            </button>

            <button
              className="action-btn clear-btn"
              onClick={handleClearChat}
              title={t.clearChat}
              disabled={messages.length === 0}
            >
              🗑
            </button>
          </div>
        </div>
      </div>

      {showClearConfirm && (
        <div className="modal-overlay" onClick={() => setShowClearConfirm(false)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <p>{t.clearConfirm}</p>
            <div className="modal-buttons">
              <button className="modal-btn cancel" onClick={() => setShowClearConfirm(false)}>
                {t.cancel}
              </button>
              <button className="modal-btn confirm" onClick={confirmClear}>
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEmailModal && (
        <div className="modal-overlay" onClick={() => setShowEmailModal(false)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t.sendEmail}</h2>
              <button className="modal-close" onClick={() => setShowEmailModal(false)}>&times;</button>
            </div>
            <div className="form-group">
              <label className="form-label">
                {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <input
                type="email"
                className="form-input"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  marginTop: '0.5rem',
                }}
              />
            </div>
            <div className="modal-buttons" style={{ marginTop: '1.5rem' }}>
              <button className="modal-btn cancel" onClick={() => setShowEmailModal(false)}>
                {t.cancel}
              </button>
              <button
                className="modal-btn confirm"
                onClick={handleSendEmail}
                disabled={!emailAddress.trim() || sendingEmail}
                style={{
                  background: 'var(--accent-primary)',
                  color: '#000',
                  fontWeight: 600,
                  opacity: (!emailAddress.trim() || sendingEmail) ? 0.5 : 1,
                }}
              >
                {sendingEmail ? (language === 'ar' ? 'جارٍ الإرسال...' : 'Sending...') : (language === 'ar' ? 'إرسال' : 'Send')}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
