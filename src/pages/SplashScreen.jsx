import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import './SplashScreen.css';
import logoImg from '../assets/images/logo.png';

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
  const [logoError, setLogoError] = useState(false);
  const [btnDisabled, setBtnDisabled] = useState(false);

  useEffect(() => {
    const msgs = welcomeMessages[language] || welcomeMessages.en;
    setWelcomeText(msgs[Math.floor(Math.random() * msgs.length)]);
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, [language]);

  const handleAnimationEnd = useCallback((e) => {
    e.currentTarget.style.willChange = 'auto';
  }, []);

  const handleStart = useCallback(() => {
    if (btnDisabled) return;
    setBtnDisabled(true);
    navigate('/chat');
    setTimeout(() => setBtnDisabled(false), 1000);
  }, [btnDisabled, navigate]);

  const handleLogoError = useCallback(() => {
    setLogoError(true);
  }, []);

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>

      <div className={`splash-container ${showContent ? 'visible' : ''}`}>
        {/* SPLIT LAYOUT - language pill */}
        <div
          className="splash-lang-pill"
          role="group"
          aria-label="Language switcher"
        >
          <button
            className={`splash-lang-chip ${language === 'en' ? 'active' : ''}`}
            onClick={() => setLanguage('en')}
            aria-pressed={language === 'en'}
          >
            EN
          </button>
          <button
            className={`splash-lang-chip ${language === 'ar' ? 'active' : ''}`}
            onClick={() => setLanguage('ar')}
            aria-pressed={language === 'ar'}
          >
            ع
          </button>
        </div>

        {/* SPLIT LAYOUT - main split row */}
        <div id="main-content" className="splash-content">
          {/* SPLIT LAYOUT - left column: text */}
          <div className="splash-left">
            <p
              className="splash-eyebrow"
              style={{ willChange: 'opacity, transform' }}
              onAnimationEnd={handleAnimationEnd}
            >
              {language === 'ar' ? 'مساعد ذكي' : 'AI Assistant'}
            </p>

            <h1
              className="splash-title"
              style={{ willChange: 'opacity, transform' }}
              onAnimationEnd={handleAnimationEnd}
            >
              Cortex
            </h1>

            <p
              className="splash-tagline"
              style={{ willChange: 'opacity, transform' }}
              onAnimationEnd={handleAnimationEnd}
            >
              {language === 'ar' ? 'تعلّم بلا حدود.' : 'Learn without limits.'}
            </p>

            {/* SPLIT LAYOUT - divider line */}
            <div
              className="splash-divider"
              style={{ willChange: 'width' }}
              onAnimationEnd={handleAnimationEnd}
            />

            <p
              className="splash-welcome"
              aria-live="polite"
              style={{ willChange: 'opacity, transform' }}
              onAnimationEnd={handleAnimationEnd}
            >
              {welcomeText}
            </p>

            <button
              className="splash-cta"
              onClick={handleStart}
              aria-label="Start chatting with Cortex"
              disabled={btnDisabled}
              style={{ willChange: 'opacity, transform' }}
              onAnimationEnd={handleAnimationEnd}
            >
              {language === 'ar' ? 'ابدأ المحادثة' : 'Start Chatting'}
              <svg className="splash-cta-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>

          {/* SPLIT LAYOUT - vertical divider */}
          <div className="splash-vertical-divider" />

          {/* SPLIT LAYOUT - right column: logo + glow */}
          <div className="splash-right">
            {/* SPLIT LAYOUT - floating decorative circles */}
            <div className="splash-right-bg">
              <span className="splash-float-circle c1" />
              <span className="splash-float-circle c2" />
              <span className="splash-float-circle c3" />
            </div>

            <div className="splash-logo-frame">
              {/* SPLIT LAYOUT - outer glow ring */}
              <div className="splash-logo-glow-outer" />
              <div className="splash-logo-glow" />
              {!logoError ? (
                <img
                  src={logoImg}
                  alt="Cortex"
                  className="splash-logo-img"
                  loading="eager"
                  onError={handleLogoError}
                  onAnimationEnd={handleAnimationEnd}
                  style={{ willChange: 'opacity, transform' }}
                  role="img"
                  aria-label="Cortex brain logo"
                />
              ) : (
                <div
                  className="splash-logo-fallback"
                  role="img"
                  aria-label="Cortex brain logo"
                >
                  CX
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SplashScreen;
