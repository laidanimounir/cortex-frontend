import React from 'react';
import { translations } from '../utils/translations';


function Sidebar({ language, isOpen, onClose, onNewChat, chatHistory, onLoadChat, onDeleteChat, activeChatId }) {
    const t = translations[language];

   
    const groupChatsByDate = (history) => {
        const groups = {
            today: [],
            yesterday: [],
            previous7Days: [],
            older: []
        };

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);

        history.forEach(chat => {
            const chatDate = new Date(chat.timestamp || Date.now());
           
            const compareDate = new Date(chatDate.getFullYear(), chatDate.getMonth(), chatDate.getDate());

            if (compareDate.getTime() === today.getTime()) {
                groups.today.push(chat);
            } else if (compareDate.getTime() === yesterday.getTime()) {
                groups.yesterday.push(chat);
            } else if (compareDate > lastWeek) {
                groups.previous7Days.push(chat);
            } else {
                groups.older.push(chat);
            }
        });

        return groups;
    };

    const groupedHistory = chatHistory ? groupChatsByDate(chatHistory) : {};

    const renderHistoryGroup = (title, chats) => {
        if (!chats || chats.length === 0) return null;
        return (
            <div className="history-group">
                <h3 className="history-group-title">{title}</h3>
                {chats.map((chat, index) => (
                    <div key={chat.id || index} className={`history-item-wrapper ${activeChatId === chat.id ? 'active' : ''}`}>
                        <button
                            className={`history-item ${activeChatId === chat.id ? 'active' : ''}`}
                            onClick={() => onLoadChat(chat)}
                            title={chat.title || chat.messages?.[0]?.text}
                        >
                            <span className="history-text">
                                {chat.title || chat.messages?.[0]?.text?.substring(0, 30) || 'Conversation'}
                            </span>
                        </button>
                        <button
                            className="delete-chat-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onDeleteChat) onDeleteChat(chat.id);
                            }}
                            title={t.delete}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <>
            <div
                className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
                onClick={onClose}
            />

            <aside className={`sidebar ${isOpen ? 'open' : ''}`} >
                <div className="sidebar-header">
                    <button className="new-chat-btn" onClick={onNewChat}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <span>{t.newChat}</span>
                    </button>
                </div>

                <div className="sidebar-content">
                    {chatHistory && chatHistory.length > 0 ? (
                        <div className="history-list">
                            {renderHistoryGroup(language === 'ar' ? 'اليوم' : (language === 'de' ? 'Heute' : 'Today'), groupedHistory.today)}
                            {renderHistoryGroup(language === 'ar' ? 'أمس' : (language === 'de' ? 'Gestern' : 'Yesterday'), groupedHistory.yesterday)}
                            {renderHistoryGroup(language === 'ar' ? 'السابقة 7 أيام' : (language === 'de' ? 'Vorherige 7 Tage' : 'Previous 7 Days'), groupedHistory.previous7Days)}
                            {renderHistoryGroup(language === 'ar' ? 'أقدم' : (language === 'de' ? 'Älter' : 'Older'), groupedHistory.older)}
                        </div>
                    ) : (
                        <div className="empty-history">
                            <p>{t.noHistory}</p>
                        </div>
                    )}
                </div>

                <div className="sidebar-footer">
                    <div className="user-profile">
                        <div className="user-avatar">M</div>
                        <div className="user-info">
                            <span className="user-name">Mounir</span>
                            <span className="user-plan">Pro Plan</span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
