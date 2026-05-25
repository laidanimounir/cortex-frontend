import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
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
  const { language, setLanguage } = useLanguage();
  const [welcomeText, setWelcomeText] = useState('');
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const msgs = welcomeMessages[language] || welcomeMessages.en;
    setWelcomeText(msgs[Math.floor(Math.random() * msgs.length)]);
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, [language]);

  const handleStart = () => {
    navigate('/chat');
  };

  return (
    <div className={`splash-container ${showContent ? 'visible' : ''}`}>
      <div className="splash-lang-top">
        <button
          className={`splash-lang-chip ${language === 'en' ? 'active' : ''}`}
          onClick={() => setLanguage('en')}
        >
          EN
        </button>
        <span className="splash-lang-divider">|</span>
        <button
          className={`splash-lang-chip ${language === 'ar' ? 'active' : ''}`}
          onClick={() => setLanguage('ar')}
        >
          ع
        </button>
      </div>

      <div className="splash-content">
        <div className="splash-logo-frame">
          <div className="splash-logo-glow" />
          <img
            src="../assets/images/logo.png"
            alt="Cortex"
            className="splash-logo-img"
          />
        </div>

        <h1 className="splash-title">Cortex</h1>

        <p className="splash-tagline">
          {language === 'ar' ? 'تعلّم بلا حدود.' : 'Learn without limits.'}
        </p>

        <p className="splash-welcome">{welcomeText}</p>

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
