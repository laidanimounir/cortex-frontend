import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SplashScreen.css';

const welcomeMessages = {
  en: [
    'Your intelligent learning companion.',
    'Discover answers. Expand your mind.',
    'Ask anything. Learn everything.',
    'Knowledge starts with a single question.',
    'Think deeper. Learn smarter.',
  ],
  ar: [
    'رفيقك الذكي في التعلّم.',
    'اكتشف الإجابات. وسّع مداركك.',
    'اسأل عن أي شيء. تعلّم كل شيء.',
    'المعرفة تبدأ بسؤال واحد.',
    'فكّر أعمق. تعلّم بذكاء.',
  ],
};

function SplashScreen() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('en');
  const [welcomeText, setWelcomeText] = useState('');
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('selectedLanguage') || 'en';
    setLanguage(savedLang);
    document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = savedLang;

    const msgs = welcomeMessages[savedLang] || welcomeMessages.en;
    setWelcomeText(msgs[Math.floor(Math.random() * msgs.length)]);

    setTimeout(() => setShowContent(true), 100);
  }, []);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem('selectedLanguage', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    const msgs = welcomeMessages[lang] || welcomeMessages.en;
    setWelcomeText(msgs[Math.floor(Math.random() * msgs.length)]);
  };

  const handleStart = () => {
    navigate('/chat');
  };

  return (
    <div className={`splash-container ${showContent ? 'visible' : ''}`}>
      <div className="splash-content">
        <div className="splash-logo-wrapper">
          <div className="splash-logo-glow" />
          <div className="splash-logo">
            <span className="splash-logo-text">Cx</span>
          </div>
        </div>

        <div className="splash-title-wrapper">
          <span className="splash-typing-cursor">|</span>
          <h1 className="splash-title">Cortex</h1>
        </div>

        <p className="splash-tagline">
          {language === 'ar' ? 'تعلّم بلا حدود.' : 'Learn without limits.'}
        </p>

        <p className="splash-welcome">{welcomeText}</p>

        <div className="splash-language-row">
          <button
            className={`splash-lang-btn ${language === 'en' ? 'active' : ''}`}
            onClick={() => handleLanguageChange('en')}
          >
            English
          </button>
          <button
            className={`splash-lang-btn ${language === 'ar' ? 'active' : ''}`}
            onClick={() => handleLanguageChange('ar')}
          >
            العربية
          </button>
        </div>

        <button className="splash-cta" onClick={handleStart}>
          {language === 'ar' ? 'ابدأ المحادثة' : 'Start Chatting'}
          <svg className="splash-cta-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default SplashScreen;
