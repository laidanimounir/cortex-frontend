import React from 'react';
import { translations } from '../utils/translations';

function ShortcutsModal({ isOpen, onClose, language }) {
  if (!isOpen) return null;

  // ضمان وجود اللغة لتجنب الخطأ
  const currentLang = language || 'en'; 
  const t = translations[currentLang] || translations['en'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content shortcuts-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t.keyboardShortcuts || 'Keyboard Shortcuts'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="shortcuts-list">
          <div className="shortcut-item">
            <span>{t.send || 'Send Message'}</span>
            <kbd>Enter</kbd>
          </div>
          
          <div className="shortcut-item">
            <span>{t.newLine || 'New Line'}</span>
            <div>
              <kbd>Shift</kbd> + <kbd>Enter</kbd>
            </div>
          </div>

          <div className="shortcut-item">
            <span>{t.clearChat || 'Clear Chat'}</span>
            <div>
              <kbd>Ctrl</kbd> + <kbd>L</kbd>
            </div>
          </div>

          <div className="shortcut-item">
            <span>{t.close || 'Close'}</span>
            <kbd>Esc</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShortcutsModal;
