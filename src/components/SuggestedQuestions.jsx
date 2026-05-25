import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

function extractKeywords(text) {
  const words = text?.toLowerCase().split(' ').filter(w => w.length > 3) || [];
  return [...new Set(words)].slice(0, 3);
}

function generateFollowUps(lastBotMessage, language) {
  const keywords = extractKeywords(lastBotMessage);

  const followUpPool = {
    en: [
      'Can you explain that in more detail?',
      'What are some real-world examples of this?',
      'How does this compare to alternative approaches?',
      'What are the limitations I should know about?',
      'Can you provide a step-by-step guide?',
      'What are the common mistakes to avoid?',
    ],
    ar: [
      'هل يمكنك شرح هذا بمزيد من التفاصيل؟',
      'ما هي بعض الأمثلة الواقعية لهذا؟',
      'كيف يقارن هذا بالطرق البديلة؟',
      'ما هي القيود التي يجب أن أعرفها؟',
      'هل يمكنك تقديم دليل خطوة بخطوة؟',
      'ما هي الأخطاء الشائعة التي يجب تجنبها؟',
    ],
  };

  const pool = followUpPool[language] || followUpPool.en;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected = new Set();
  const result = [];

  if (keywords.length > 0) {
    const keywordQs = keywords.map(kw => {
      if (language === 'ar') {
        return `حدثني أكثر عن "${kw}"`;
      }
      return `Tell me more about "${kw}"`;
    });
    keywordQs.forEach(q => {
      if (result.length < 3) {
        result.push({ id: `auto-${result.length}`, text: q, icon: 'idea' });
        selected.add(q);
      }
    });
  }

  for (const q of shuffled) {
    if (result.length >= 3) break;
    if (!selected.has(q)) {
      result.push({ id: `auto-${result.length}`, text: q, icon: 'idea' });
      selected.add(q);
    }
  }

  return result.slice(0, 3);
}

function SuggestedQuestions({ onSelectSuggestion, lastBotMessage }) {
  const { language, t } = useLanguage();

  const icons = {
    summarize: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    code: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    idea: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="2" x2="12" y2="6" />
        <line x1="12" y1="18" x2="12" y2="22" />
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
        <line x1="2" y1="12" x2="6" y2="12" />
        <line x1="18" y1="12" x2="22" y2="12" />
        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
        <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
      </svg>
    ),
  };

  const prompts = lastBotMessage
    ? generateFollowUps(lastBotMessage, language)
    : t.prompts;

  return (
    <div className="suggested-questions">
      {!lastBotMessage && (
        <div className="welcome-hero">
          <h1 className="welcome-title">{t.welcome}</h1>
          <p className="welcome-subtitle">{t.welcomeSubtitle}</p>
        </div>
      )}

      <div className="questions-grid">
        {prompts.map((prompt) => (
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
