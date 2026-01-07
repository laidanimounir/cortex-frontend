import React from 'react';
import { translations } from '../utils/translations';


function SuggestedQuestions({ language, onSelectSuggestion }) {
    const t = translations[language] || translations['en'];


   
    const icons = {
        summarize: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
        ),
        code: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
        ),
        idea: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="2" x2="12" y2="6"></line>
                <line x1="12" y1="18" x2="12" y2="22"></line>
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                <line x1="2" y1="12" x2="6" y2="12"></line>
                <line x1="18" y1="12" x2="22" y2="12"></line>
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
            </svg>
        )
    };

    return (
        <div className="suggested-questions">
            <div className="welcome-hero">
                <h1 className="welcome-title">{t.welcome}</h1>
                <p className="welcome-subtitle">{t.welcomeSubtitle}</p>
            </div>

            <div className="questions-grid">
                {t.prompts.map((prompt) => (
                    <button
                        key={prompt.id}
                        className="suggested-question-btn"
                        onClick={() => onSelectSuggestion(prompt.text)}
                    >
                        <span className="prompt-icon">
                            {icons[prompt.icon] || prompt.icon}
                        </span>
                        <span className="prompt-text">{prompt.text}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default SuggestedQuestions;
