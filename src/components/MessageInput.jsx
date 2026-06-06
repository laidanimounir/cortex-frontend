import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const MODEL_OPTIONS = [
  { id: 'cortex-fast', labelKey: 'modelFast', descKey: 'modelFastDesc', icon: '⚡' },
  { id: 'cortex-think', labelKey: 'modelThink', descKey: 'modelThinkDesc', icon: '🧠' },
  { id: 'cortex-vision', labelKey: 'modelVision', descKey: 'modelVisionDesc', icon: '🎯' },
];

function MessageInput({ onSendMessage, disabled, selectedModel, onModelChange, imageMode, onImageModeToggle, fileAttachment, onFileAttach, onFileRemove }) {
  const { language, t } = useLanguage();

  const [input, setInput] = useState('');
  const [showModelMenu, setShowModelMenu] = useState(false);
  const menuRef = React.useRef(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        onFileAttach({ name: file.name, type: file.type, data: isImage ? result : result.split(',')[1], isImage });
      }
    };
    if (isImage) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

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
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,.pdf,.docx,.doc,.txt"
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className={`tool-selector-btn ${fileAttachment ? 'file-active' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            title={language === 'ar' ? 'إرفاق ملف' : 'Attach file'}
            disabled={disabled}
          >
            📎
          </button>
          {fileAttachment && (
            <div className="file-attachment-badge">
              <span className="file-attachment-name">{fileAttachment.name}</span>
              <button type="button" className="file-attachment-remove" onClick={onFileRemove}>✕</button>
            </div>
          )}
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
