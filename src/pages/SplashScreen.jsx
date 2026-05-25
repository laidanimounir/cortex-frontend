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

  /* FIX 8 - remove will-change after animation ends */
  const handleAnimationEnd = useCallback((e) => {
    e.currentTarget.style.willChange = 'auto';
  }, []);

  /* FIX 3 - prevent double navigation within 1s */
  const handleStart = useCallback(() => {
    if (btnDisabled) return;
    setBtnDisabled(true);
    navigate('/chat');
    setTimeout(() => setBtnDisabled(false), 1000);
  }, [btnDisabled, navigate]);

  /* FIX 2 - logo image error fallback */
  const handleLogoError = useCallback(() => {
    setLogoError(true);
  }, []);

  return (
    <>
      {/* FIX 7 - skip link */}
      <a href="#main-content" className="skip-link">Skip to content</a>

      <div className={`splash-container ${showContent ? 'visible' : ''}`}>
        {/* FIX 4 - redesigned language pill */}
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

        {/* FIX 7 - main content landmark */}
        <div id="main-content" className="splash-content">
          <div className="splash-logo-frame">
            <div className="splash-logo-glow" />
            {/* FIX 2 - eager loading, error fallback, accessible role */}
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

          {/* FIX 1 + FIX 8 - staggered entrance + will-change cleanup */}
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

          {/* FIX 7 - aria-live for dynamically changing text */}
          <p
            className="splash-welcome"
            aria-live="polite"
            style={{ willChange: 'opacity, transform' }}
            onAnimationEnd={handleAnimationEnd}
          >
            {welcomeText}
          </p>

          {/* FIX 3 - updated CTA */}
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
      </div>
    </>
  );
}

export default SplashScreen;
