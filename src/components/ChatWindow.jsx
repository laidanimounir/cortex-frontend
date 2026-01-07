import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { translations } from '../utils/translations';
import SuggestedQuestions from './SuggestedQuestions';

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
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
    );

  
    const RegenerateIcon = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </svg>
    );

    return (
        <div className="chat-window">
            <div className="messages-container">
             
                {messages.length === 0 && (
                    <SuggestedQuestions language={language} onSelectSuggestion={onSelectSuggestion} />

                )}

                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.type} ${msg.isDeepThink ? 'deep-think' : ''}`}>
                        <div className="message-bubble">
                           
                            {msg.type === 'bot' ? (
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
                                            }
                                        }}
                                    >
                                        {msg.text}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <p className="message-text">{msg.text}</p>
                            )}

                            
                            {msg.type === 'bot' && (
                                <div className="message-actions">
                                    <button
                                        className="action-icon-btn"
                                        onClick={() => copyToClipboard(msg.text, index)}
                                        title={copiedIndex === index ? t.copied : t.copy}
                                    >
                                        <CopyIcon />
                                    </button>

                                   
                                    {index === messages.length - 1 && onRegenerateResponse && (
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

                          
                            {msg.type === 'bot' && msg.metadata && (
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

               
                {isTyping && (
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
