import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DASHBOARD_PASSWORD = 'cortex-admin';
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function Dashboard() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!authenticated) return;
    const chatHistory = JSON.parse(localStorage.getItem('cortex_chat_history') || '[]');
    const ratings = JSON.parse(localStorage.getItem('cortex_message_ratings') || '{}');
    const totalConversations = chatHistory.length;
    let totalMessages = 0;
    let modelCounts = { 'cortex-fast': 0, 'cortex-think': 0, 'cortex-vision': 0 };
    let weeklyActivity = Array(7).fill(0);
    let langCount = { en: 0, ar: 0 };

    chatHistory.forEach(chat => {
      if (!chat.messages) return;
      totalMessages += chat.messages.length;
      chat.messages.forEach(msg => {
        if (msg.model && modelCounts[msg.model] !== undefined) {
          modelCounts[msg.model]++;
        }
      });
      const d = new Date(chat.timestamp);
      const now = new Date();
      const dayDiff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
      if (dayDiff >= 0 && dayDiff < 7) {
        weeklyActivity[6 - dayDiff]++;
      }
    });

    const lang = localStorage.getItem('selectedLanguage') || 'en';
    langCount[lang] = totalConversations;

    let thumbsUp = 0;
    let thumbsDown = 0;
    Object.values(ratings).forEach(v => {
      if (v === 'up') thumbsUp++;
      if (v === 'down') thumbsDown++;
    });

    setStats({ totalConversations, totalMessages, modelCounts, weeklyActivity, langCount, thumbsUp, thumbsDown });
  }, [authenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === DASHBOARD_PASSWORD) {
      setAuthenticated(true);
    }
  };

  if (!authenticated) {
    return (
      <div className="dashboard-login">
        <div className="dashboard-login-box">
          <h1>Developer Dashboard</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="dashboard-password-input"
              autoFocus
            />
            <button type="submit" className="dashboard-login-btn">Unlock</button>
          </form>
          <button className="dashboard-back-btn" onClick={() => navigate('/chat')}>← Back to Chat</button>
        </div>
      </div>
    );
  }

  const maxActivity = Math.max(...stats.weeklyActivity, 1);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>📊 Developer Dashboard</h1>
        <button className="dashboard-back-btn" onClick={() => navigate('/chat')}>← Back to Chat</button>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-value">{stats.totalConversations}</div>
          <div className="card-label">Total Conversations</div>
        </div>
        <div className="dashboard-card">
          <div className="card-value">{stats.totalMessages}</div>
          <div className="card-label">Total Messages</div>
        </div>
        <div className="dashboard-card">
          <div className="card-value">{stats.thumbsUp}</div>
          <div className="card-label">👍 Ratings</div>
        </div>
        <div className="dashboard-card">
          <div className="card-value">{stats.thumbsDown}</div>
          <div className="card-label">👎 Ratings</div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Models Used</h2>
        <div className="model-breakdown">
          <div className="model-bar-item">
            <span className="model-bar-label">Fast</span>
            <div className="model-bar-track">
              <div className="model-bar-fill fast" style={{ width: `${(stats.modelCounts['cortex-fast'] / Math.max(1, Object.values(stats.modelCounts).reduce((a, b) => a + b, 0))) * 100}%` }} />
            </div>
            <span className="model-bar-count">{stats.modelCounts['cortex-fast']}</span>
          </div>
          <div className="model-bar-item">
            <span className="model-bar-label">Think</span>
            <div className="model-bar-track">
              <div className="model-bar-fill think" style={{ width: `${(stats.modelCounts['cortex-think'] / Math.max(1, Object.values(stats.modelCounts).reduce((a, b) => a + b, 0))) * 100}%` }} />
            </div>
            <span className="model-bar-count">{stats.modelCounts['cortex-think']}</span>
          </div>
          <div className="model-bar-item">
            <span className="model-bar-label">Vision</span>
            <div className="model-bar-track">
              <div className="model-bar-fill vision" style={{ width: `${(stats.modelCounts['cortex-vision'] / Math.max(1, Object.values(stats.modelCounts).reduce((a, b) => a + b, 0))) * 100}%` }} />
            </div>
            <span className="model-bar-count">{stats.modelCounts['cortex-vision']}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Language Usage</h2>
        <div className="lang-bars">
          <div className="lang-bar-item">
            <span>English</span>
            <div className="lang-bar-track">
              <div className="lang-bar-fill en" style={{ width: `${(stats.langCount.en / Math.max(1, stats.langCount.en + stats.langCount.ar)) * 100}%` }} />
            </div>
            <span>{stats.langCount.en}</span>
          </div>
          <div className="lang-bar-item">
            <span>العربية</span>
            <div className="lang-bar-track">
              <div className="lang-bar-fill ar" style={{ width: `${(stats.langCount.ar / Math.max(1, stats.langCount.en + stats.langCount.ar)) * 100}%` }} />
            </div>
            <span>{stats.langCount.ar}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Weekly Activity</h2>
        <div className="weekly-chart">
          {stats.weeklyActivity.map((count, i) => (
            <div key={i} className="chart-bar-wrapper">
              <div
                className="chart-bar"
                style={{ height: `${(count / maxActivity) * 100}%` }}
                title={`${DAY_NAMES[i]}: ${count}`}
              />
              <span className="chart-label">{DAY_NAMES[i]}</span>
              <span className="chart-value">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
