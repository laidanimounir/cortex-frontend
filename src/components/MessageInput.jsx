import React, { useState, useEffect } from 'react';
import { translations } from '../utils/translations';


function MessageInput({ language, onSendMessage, onDeepThink, disabled }) {
    const t = translations[language];
    const [input, setInput] = useState('');
    const [selectedModel, setSelectedModel] = useState('cortex'); 
    const [showModelMenu, setShowModelMenu] = useState(false);
    const menuRef = React.useRef(null);

   
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowModelMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() && !disabled) {
            if (selectedModel === 'deepthink') {
                onDeepThink(input.trim());
            } else {
                onSendMessage(input.trim());
            }
            setInput('');
        }
    };

    const handleKeyDown = (e) => {
        
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const selectModel = (model) => {
        setSelectedModel(model);
        setShowModelMenu(false);
    };

    return (
        <form className="message-input-container" onSubmit={handleSubmit}>
            <div className="input-wrapper">
              
                <div className="tool-selector-container" ref={menuRef}>
                    <button
                        type="button"
                        className={`tool-selector-btn ${selectedModel === 'deepthink' ? 'deep-think-active' : ''}`}
                        onClick={() => setShowModelMenu(!showModelMenu)}
                        title={t.selectModel}
                        disabled={disabled}
                    >
                        {selectedModel === 'deepthink' ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                            </svg>
                        )}
                    </button>

                  
                    {showModelMenu && (
                        <div className="tool-menu">
                            <button
                                type="button"
                                className={`tool-option ${selectedModel === 'cortex' ? 'active' : ''}`}
                                onClick={() => selectModel('cortex')}
                            >
                                <div className="tool-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                    </svg>
                                </div>
                                <div className="tool-info">
                                    <div className="tool-name">Cortex Fast</div>
                                    <div className="tool-description">{t.cortexModelDesc}</div>
                                </div>
                                {selectedModel === 'cortex' && (
                                    <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                )}
                            </button>
                            <button
                                type="button"
                                className={`tool-option ${selectedModel === 'deepthink' ? 'active' : ''}`}
                                onClick={() => selectModel('deepthink')}
                            >
                                <div className="tool-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                    </svg>
                                </div>
                                <div className="tool-info">
                                    <div className="tool-name">Cortex Deep</div>
                                    <div className="tool-description">{t.deepThinkModelDesc}</div>
                                </div>
                                {selectedModel === 'deepthink' && (
                                    <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                )}
                            </button>
                        </div>
                    )}
                </div>

             
                {selectedModel === 'deepthink' && (
                    <div className="mode-indicator">
                        {t.deepThink}
                    </div>
                )}

                <textarea
                    className="message-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t.inputPlaceholder}
                    disabled={disabled}
                    rows={1}
                    style={{
                        resize: 'none',
                        overflow: 'hidden',
                        minHeight: '50px',
                        maxHeight: '150px'
                    }}
                    onInput={(e) => {
                   
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
                    }}
                />

                <div className="input-actions">
                   
                    <button
                        type="submit"
                        className={`send-button ${selectedModel === 'deepthink' ? 'deep-think-active' : ''}`}
                        disabled={!input.trim() || disabled}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>
        </form>
    );
}

export default MessageInput;
