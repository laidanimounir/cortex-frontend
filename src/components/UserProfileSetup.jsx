import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const INTERESTS = ['Science', 'Math', 'Programming', 'History', 'Literature', 'Business'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

function UserProfileSetup({ onSave, initialProfile }) {
  const { language, t } = useLanguage();
  const [interests, setInterests] = useState(initialProfile?.interests || []);
  const [level, setLevel] = useState(initialProfile?.level || '');

  const toggleInterest = (interest) => {
    setInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSave = () => {
    if (!level) return;
    const profile = { interests, level };
    localStorage.setItem('cortex_user_profile', JSON.stringify(profile));
    if (onSave) onSave(profile);
  };

  return (
    <div className="profile-setup-overlay">
      <div className="profile-setup-modal">
        <div className="profile-setup-header">
          <h2>{t.profileTitle || (language === 'ar' ? 'إعداد الملف الشخصي' : 'Set Up Your Profile')}</h2>
          <p className="profile-setup-subtitle">
            {t.profileSubtitle || (language === 'ar' ? 'اختر اهتماماتك ومستواك للحصول على إجابات مخصصة' : 'Select your interests and level for personalized answers')}
          </p>
        </div>

        <div className="profile-section">
          <h3 className="profile-section-title">
            {t.interestsLabel || (language === 'ar' ? 'اهتماماتي' : 'My Interests')}
          </h3>
          <div className="interests-grid">
            {INTERESTS.map(interest => {
              const selected = interests.includes(interest);
              const label = language === 'ar'
                ? ({ 'Science': 'العلوم', 'Math': 'الرياضيات', 'Programming': 'البرمجة', 'History': 'التاريخ', 'Literature': 'الأدب', 'Business': 'الأعمال' }[interest] || interest)
                : interest;
              return (
                <button
                  key={interest}
                  className={`interest-chip ${selected ? 'selected' : ''}`}
                  onClick={() => toggleInterest(interest)}
                >
                  {label}
                  {selected && <span className="interest-check">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="profile-section">
          <h3 className="profile-section-title">
            {t.levelLabel || (language === 'ar' ? 'مستواي' : 'My Level')}
          </h3>
          <div className="level-options">
            {LEVELS.map(l => {
              const label = language === 'ar'
                ? ({ 'Beginner': 'مبتدئ', 'Intermediate': 'متوسط', 'Advanced': 'متقدم' }[l] || l)
                : l;
              return (
                <button
                  key={l}
                  className={`level-btn ${level === l ? 'selected' : ''}`}
                  onClick={() => setLevel(l)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <button
          className="save-profile-btn"
          onClick={handleSave}
          disabled={interests.length === 0 || !level}
        >
          {t.saveProfile || (language === 'ar' ? 'حفظ الملف الشخصي' : 'Save Profile')}
        </button>
      </div>
    </div>
  );
}

export default UserProfileSetup;
