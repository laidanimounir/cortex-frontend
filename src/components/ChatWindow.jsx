import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { preprocessMath } from './MathRenderer';
import 'katex/dist/katex.min.css';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { useMessageRatings } from '../hooks/useMessageRatings';
import SuggestedQuestions from './SuggestedQuestions';
import CodeRunner from './CodeRunner';

const MODEL_LABELS = {
  'cortex-fast': { en: 'Fast', ar: 'سريع' },
  'cortex-think': { en: 'Think', ar: 'تفكير' },
  'cortex-vision': { en: 'Vision', ar: 'رؤية' },
};

function ChatWindow({ messages, isTyping, typingStatus, onSelectSuggestion, onRegenerateResponse }) {
  const { language, t } = useLanguage();
  const { showToast } = useToast();
  const { getRating, setRating } = useMessageRatings();
  const messagesEndRef = useRef(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [copiedCodeBlock, setCopiedCodeBlock] = useState(null);

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

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeBlock(code.slice(0, 20));
      setTimeout(() => setCopiedCodeBlock(null), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const handleRating = (messageId, value) => {
    const current = getRating(messageId);
    const newValue = current === value ? null : value;
    setRating(messageId, newValue);
    if (newValue && !current) {
      showToast('Thanks for the feedback!', 'success');
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

              {msg.type === 'bot' && msg.isImage && msg.text && (
                <div className="message-image-container">
                  <div className="image-loading-spinner">
                    <div className="spinner" />
                    <span>{language === 'ar' ? 'جارٍ تحميل الصورة...' : 'Loading image...'}</span>
                  </div>
                  <img
                    src={msg.text}
                    alt="Generated"
                    className="generated-image"
                    onLoad={(e) => {
                      e.target.style.display = 'block';
                      e.target.previousElementSibling.style.display = 'none';
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.previousElementSibling.innerHTML = language === 'ar' ? 'فشل تحميل الصورة' : 'Failed to load image';
                    }}
                    style={{ display: 'none' }}
                  />
                  <a
                    href={msg.text}
                    download={`cortex-image-${msg.id || 'download'}.png`}
                    className="image-download-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>{language === 'ar' ? 'تحميل' : 'Download'}</span>
                  </a>
                </div>
              )}

              {msg.type === 'bot' && msg.text && !msg.isImage && (
                <>
                    <div className="message-text markdown-content">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        code({ inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '');
                          if (!inline && match) {
                            const codeString = String(children).replace(/\n$/, '');
                            const langLabel = match[1] === 'python' ? 'Python' : match[1] === 'javascript' ? 'JavaScript' : match[1] === 'typescript' ? 'TypeScript' : match[1] === 'html' ? 'HTML' : match[1] === 'css' ? 'CSS' : match[1] === 'bash' ? 'Bash' : match[1] === 'json' ? 'JSON' : match[1] === 'jsx' ? 'JSX' : match[1] === 'tsx' ? 'TSX' : match[1];
                            const runnableLangs = ['html', 'javascript', 'js', 'jsx', 'tsx'];
                            const isRunnable = runnableLangs.includes(match[1]);
                            return (
                              <div className="code-block-wrapper">
                                <div className="code-block-header">
                                  <span className="code-lang-label">{langLabel}</span>
                                  <div className="code-header-actions">
                                    {isRunnable && <CodeRunner code={codeString} language={match[1]} />}
                                    <button
                                      className="code-copy-btn"
                                      onClick={() => copyCode(codeString)}
                                    >
                                      {copiedCodeBlock === codeString.slice(0, 20) ? t.copied : t.copyCode}
                                    </button>
                                  </div>
                                </div>
                                <SyntaxHighlighter
                                  style={vscDarkPlus}
                                  language={match[1]}
                                  PreTag="div"
                                  showLineNumbers
                                  lineNumberStyle={{ minWidth: '2.5em', paddingRight: '1em', color: '#6B7280', userSelect: 'none', textAlign: 'right' }}
                                  {...props}
                                >
                                  {codeString}
                                </SyntaxHighlighter>
                              </div>
                            );
                          }
                          return (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                        table({ children }) {
                          return (
                            <div style={{ overflowX: 'auto', width: '100%' }}>
                              <table>{children}</table>
                            </div>
                          );
                        },
                      }}
                    >
                      {preprocessMath(msg.text)}
                    </ReactMarkdown>
                  </div>
                  {msg.streaming && <span className="streaming-cursor" />}
                </>
              )}

              {getModelBadge(msg.model)}

              {msg.type === 'user' && (
                <p className="message-text">{msg.text}</p>
              )}

              {msg.type === 'bot' && !msg.streaming && (
                <>
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

                  <div className="message-ratings">
                    <button
                      className={`rating-btn ${getRating(msg.id) === 'up' ? 'active' : ''}`}
                      onClick={() => handleRating(msg.id, 'up')}
                      title="Helpful"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill={getRating(msg.id) === 'up' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
                      </svg>
                    </button>
                    <button
                      className={`rating-btn ${getRating(msg.id) === 'down' ? 'active' : ''}`}
                      onClick={() => handleRating(msg.id, 'down')}
                      title="Not helpful"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill={getRating(msg.id) === 'down' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" />
                      </svg>
                    </button>
                  </div>

                  {msg.webSources && msg.webSources.length > 0 && (
                    <div className="web-sources">
                      <div className="sources-title">
                        {language === 'ar' ? 'المصادر' : 'Sources'}
                      </div>
                      <div className="sources-list">
                        {msg.webSources.slice(0, 5).map((source, si) => (
                          <a
                            key={si}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="source-card"
                          >
                            <span className="source-title">{source.title || source.url}</span>
                            <span className="source-url">{source.url}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </>
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

        {!messages.some(m => m.streaming) && (
          <SuggestedQuestions
            onSelectSuggestion={onSelectSuggestion}
            lastBotMessage={
              [...messages].reverse().find(m => m.type === 'bot')?.text || null
            }
          />
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

export default ChatWindow;
