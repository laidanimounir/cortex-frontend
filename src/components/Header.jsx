import React, { useState } from 'react';
import { translations } from '../utils/translations';
import jsPDF from 'jspdf';


function Header({ language, onLanguageChange, onClearChat, onToggleCompact, isCompact, messages, onToggleSidebar }) {
    const t = translations[language] || translations['en'];

    const [showExportMenu, setShowExportMenu] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    const handleClearChat = () => {
        setShowClearConfirm(true);
    };

    const confirmClear = () => {
        onClearChat();
        setShowClearConfirm(false);
    };

  
    const exportAsTXT = () => {
        const content = messages
            .map(m => `${m.type.toUpperCase()}: ${m.text}`)
            .join('\n\n');

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cortex-chat-${Date.now()}.txt`;
        a.click();
        setShowExportMenu(false);
    };

    
    const exportAsMarkdown = () => {
        const content = messages
            .map(m => `### ${m.type === 'user' ? 'User' : 'Cortex'}\n\n${m.text}\n`)
            .join('\n---\n\n');

        const blob = new Blob([`# Cortex Chat Export\n\n${content}`], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cortex-chat-${Date.now()}.md`;
        a.click();
        setShowExportMenu(false);
    };

    
    const exportAsPDF = () => {
        const doc = new jsPDF();
        let y = 20;

        doc.setFontSize(16);
        doc.text('Cortex Chat Export', 20, y);
        y += 15;

        doc.setFontSize(10);
        messages.forEach((msg) => {
            const label = msg.type === 'user' ? 'User' : 'Cortex';
            doc.setFont(undefined, 'bold');
            doc.text(label + ':', 20, y);
            y += 7;

            doc.setFont(undefined, 'normal');
            const lines = doc.splitTextToSize(msg.text, 170);
            lines.forEach(line => {
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(line, 20, y);
                y += 7;
            });
            y += 5;
        });

        doc.save(`cortex-chat-${Date.now()}.pdf`);
        setShowExportMenu(false);
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
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
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
                            onClick={() => onLanguageChange('ar')}
                        >
                            {t.languageAr}
                        </button>
                        <button
                            className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                            onClick={() => onLanguageChange('en')}
                        >
                            {t.languageEn}
                        </button>
                        <button
                            className={`lang-btn ${language === 'de' ? 'active' : ''}`}
                            onClick={() => onLanguageChange('de')}
                        >
                            {t.languageDe}
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
                                </div>
                            )}
                        </div>

                      
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
        </header>
    );
}

export default Header;
