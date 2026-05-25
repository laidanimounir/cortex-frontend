import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LanguageSelection.css';

function LanguageSelection() {
const navigate = useNavigate();

const languages = [
{ code: 'en', name: 'English', flag: '🇬🇧' },
{ code: 'fr', name: 'Français', flag: '🇫🇷' },
{ code: 'ar', name: 'العربية', flag: '🇸🇦' },
{ code: 'es', name: 'Español', flag: '🇪🇸' },
];

const handleLanguageSelect = (languageCode) => {
localStorage.setItem('selectedLanguage', languageCode);
navigate('/login');
};

return (
<div className="language-selection-container">
<div className="language-selection-card">
<h1 className="language-title">🌍 Choose Your Language</h1>
<p className="language-subtitle">Select your preferred language to continue</p>

    <div className="language-grid">
      {languages.map((lang) => (
        <button
          key={lang.code}
          className="language-button"
          onClick={() => handleLanguageSelect(lang.code)}
        >
          <span className="language-flag">{lang.flag}</span>
          <span className="language-name">{lang.name}</span>
        </button>
      ))}
    </div>
  </div>
</div>
);
}

export default LanguageSelection;