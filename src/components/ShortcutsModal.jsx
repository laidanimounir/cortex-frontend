import React, { useState } from 'react';
import { translations } from '../utils/translations';


function ShortcutsModal({ language, onClose }) {
    const t = translations[language];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content shortcuts-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{t.shortcutsTitle}</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <div className="shortcuts-list">
                    <div className="shortcut-item">
                        <kbd>Enter</kbd>
                        <span>{t.shortcutsList.send}</span>
                    </div>
                    <div className="shortcut-item">
                        <kbd>Shift</kbd> + <kbd>Enter</kbd>
                        <span>{t.shortcutsList.newLine}</span>
                    </div>
                    <div className="shortcut-item">
                        <kbd>Ctrl</kbd> + <kbd>K</kbd>
                        <span>{t.shortcutsList.clear}</span>
                    </div>
                    <div className="shortcut-item">
                        <kbd>Ctrl</kbd> + <kbd>/</kbd>
                        <span>{t.shortcutsList.shortcuts}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ShortcutsModal;
