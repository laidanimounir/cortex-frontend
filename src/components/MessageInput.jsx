import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const MODEL_OPTIONS = [
  { id: 'cortex-fast', labelKey: 'modelFast', descKey: 'modelFastDesc', icon: '⚡' },
  { id: 'cortex-think', labelKey: 'modelThink', descKey: 'modelThinkDesc', icon: '🧠' },
  { id: 'cortex-vision', labelKey: 'modelVision', descKey: 'modelVisionDesc', icon: '🎯' },
];

function MessageInput({ onSendMessage, disabled, selectedModel, onModelChange, imageMode, onImageModeToggle }) {
  const { language, t } = useLanguage();

  const [input, setInput] = useState('');
  const [showModelMenu, setShowModelMenu] = useState(false);
  const menuRef = React.useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowModelMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const currentModel = MODEL_OPTIONS.find(m => m.id === selectedModel) || MODEL_OPTIONS[0];
  const currentIcon = currentModel.icon;

  return (
    <form className="message-input-container" onSubmit={handleSubmit}>
      <div className="input-wrapper">
        <div className="tool-selector-container" ref={menuRef}>
          <button
            type="button"
            className={`tool-selector-btn ${imageMode ? 'image-mode-active' : ''}`}
            onClick={onImageModeToggle}
            title={imageMode ? (language === 'ar' ? 'وضع النص' : 'Text Mode') : (language === 'ar' ? 'وضع الصور' : 'Image Mode')}
            disabled={disabled}
          >
            {imageMode ? '✕' : '🖼'}
          </button>

          {!imageMode && (
          <button
            type="button"
            className="tool-selector-btn"
            onClick={() => setShowModelMenu(!showModelMenu)}
            title={t.selectModel}
            disabled={disabled}
          >
            {currentIcon}
          </button>
          )}

          {showModelMenu && (
            <div className="tool-menu">
              {MODEL_OPTIONS.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  className={`tool-option ${selectedModel === model.id ? 'active' : ''}`}
                  onClick={() => {
                    onModelChange(model.id);
                    setShowModelMenu(false);
                  }}
                >
                  <div className="tool-icon">{model.icon}</div>
                  <div className="tool-info">
                    <div className="tool-name">{t[model.labelKey]}</div>
                    <div className="tool-description">{t[model.descKey]}</div>
                  </div>
                  {selectedModel === model.id && (
                    <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <textarea
          className="message-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={imageMode ? (language === 'ar' ? 'صف الصورة التي تريد توليدها...' : 'Describe the image you want to generate...') : t.inputPlaceholder}
          disabled={disabled}
          rows={1}
          style={{
            resize: 'none',
            overflow: 'hidden',
            minHeight: '50px',
            maxHeight: '150px',
          }}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
          }}
        />

        <div className="input-actions">
          <button
            type="submit"
            className="send-button"
            disabled={!input.trim() || disabled}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
      {input.trim() && (
        <div className="word-counter">
          {input.trim().split(/\s+/).length} {t.wordCount}
        </div>
      )}
    </form>
  );
}

export default MessageInput;
