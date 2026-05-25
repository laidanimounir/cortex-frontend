import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

function Sidebar({ isOpen, onClose, onNewChat, chatHistory, onLoadChat, onDeleteChat, onRenameChat, activeChatId, onEditProfile }) {
    const { language, t } = useLanguage();
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState('');

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
                            {editingId === chat.id ? (
                                <input
                                    className="history-rename-input"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    onBlur={() => {
                                        if (editTitle.trim()) {
                                            onRenameChat(chat.id, editTitle.trim());
                                        }
                                        setEditingId(null);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.target.blur();
                                        } else if (e.key === 'Escape') {
                                            setEditingId(null);
                                        }
                                    }}
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                />
                            ) : (
                                <span
                                    className="history-text"
                                    onDoubleClick={() => {
                                        setEditingId(chat.id);
                                        setEditTitle(chat.title || '');
                                    }}
                                >
                                    {chat.title || chat.messages?.[0]?.text?.substring(0, 30) || 'Conversation'}
                                </span>
                            )}
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

    // ✅ دالة معدّلة لزر New Chat تغلق القائمة في الهاتف
    const handleNewChat = () => {
        onNewChat(); // استدعاء دالة بدء محادثة جديدة
        if (window.innerWidth < 768 && onClose) {
            onClose(); // إغلاق القائمة في الهاتف بعد النقر
        }
    };

    return (
        <>
            {/* Mobile Overlay - لا نحتاجه هنا، موجود في App.jsx */}
            
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    {/* ✅ الزر المصحح */}
                    <button className="new-chat-btn" onClick={handleNewChat}>
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
                            {renderHistoryGroup(language === 'ar' ? 'اليوم' : 'Today', groupedHistory.today)}
                            {renderHistoryGroup(language === 'ar' ? 'أمس' : 'Yesterday', groupedHistory.yesterday)}
                            {renderHistoryGroup(language === 'ar' ? 'السابقة 7 أيام' : 'Previous 7 Days', groupedHistory.previous7Days)}
                            {renderHistoryGroup(language === 'ar' ? 'أقدم' : 'Older', groupedHistory.older)}
                        </div>
                    ) : (
                        <div className="empty-history">
                            <p>{t.noHistory}</p>
                        </div>
                    )}
                </div>

                <div className="sidebar-footer">
                    {onEditProfile && (
                        <button className="edit-profile-btn" onClick={onEditProfile}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            <span>{language === 'ar' ? 'تعديل الملف الشخصي' : 'Edit Profile'}</span>
                        </button>
                    )}
                    <div className="user-profile">
                        <div className="user-avatar">
                          {language === 'ar' ? 'ز' : 'G'}
                        </div>
                        <div className="user-info">
                            <span className="user-name">
                              {language === 'ar' ? 'زائر' : 'Guest'}
                            </span>
                            <span className="user-plan">Cortex Free</span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
