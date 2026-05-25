import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { translations } from '../utils/translations';
import SuggestedQuestions from './SuggestedQuestions';

const MODEL_LABELS = {
  'cortex-fast': { en: 'Fast', ar: 'سريع' },
  'cortex-think': { en: 'Think', ar: 'تفكير' },
  'cortex-vision': { en: 'Vision', ar: 'رؤية' },
};

function ChatWindow({ messages, language, isTyping, typingStatus, onSelectSuggestion, onRegenerateResponse }) {
  const t = translations[language] || translations['en'];
  const messagesEndRef = useRef(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const CopyIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );

  const RegenerateIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );

  const getModelBadge = (model) => {
    if (!model) return null;
    const labels = MODEL_LABELS[model];
    const label = labels ? (labels[language] || labels['en'] || model) : model;
    return <span className="model-badge">{label}</span>;
  };

  return (
    <div className="chat-window">
      <div className="messages-container">
        {messages.length === 0 && (
          <SuggestedQuestions language={language} onSelectSuggestion={onSelectSuggestion} />
        )}

        {messages.map((msg, index) => (
          <div key={msg.id || index} className={`message ${msg.type}`}>
            <div className="message-bubble">
              {msg.type === 'bot' && msg.streaming && !msg.text && (
                <div className="skeleton-lines">
                  <div className="skeleton-line" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line skeleton-line-short" />
                </div>
              )}

              {msg.type === 'bot' && msg.text && (
                <>
                  <div className="message-text markdown-content">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                  {msg.streaming && <span className="streaming-cursor" />}
                </>
              )}

              {msg.type === 'bot' && (getModelBadge(msg.model))}

              {msg.type === 'user' && (
                <p className="message-text">{msg.text}</p>
              )}

              {msg.type === 'bot' && !msg.streaming && (
                <div className="message-actions">
                  <button
                    className="action-icon-btn"
                    onClick={() => copyToClipboard(msg.text, index)}
                    title={copiedIndex === index ? t.copied : t.copy}
                  >
                    <CopyIcon />
                    <span>{copiedIndex === index ? t.copied : t.copy}</span>
                  </button>

                  {onRegenerateResponse && (
                    <button
                      className="action-icon-btn"
                      onClick={() => onRegenerateResponse(index)}
                      title={t.regenerate}
                    >
                      <RegenerateIcon />
                    </button>
                  )}
                </div>
              )}

              {msg.type === 'bot' && msg.metadata && !msg.streaming && (
                <div className="message-metadata">
                  {msg.metadata.confidence !== undefined && (
                    <div className="metadata-item">
                      <span className="metadata-label">{t.confidence}:</span>
                      <span className="metadata-value">
                        {(msg.metadata.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                  {msg.metadata.question && (
                    <div className="metadata-item">
                      <span className="metadata-label">{t.matchedQuestion}:</span>
                      <span className="metadata-value">{msg.metadata.question}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && messages.length > 0 && !messages[messages.length - 1]?.streaming && (
          <div className="message bot">
            <div className="message-bubble typing-indicator">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p className="typing-text">{typingStatus || t.typing}</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

export default ChatWindow;
