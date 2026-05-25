import { useState, useEffect } from 'react';

function useChatHistory() {
    const [chatHistory, setChatHistory] = useState([]);
    const STORAGE_KEY = 'cortex_chat_history';
    const MAX_HISTORY = 50; // ✅ زيادة العدد لـ 50 محادثة

    // Load history from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setChatHistory(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }, []);

    // ✅ دالة Save محسّنة تقبل chatId اختياري
    const saveChat = (messages, chatId = null) => {
        if (!messages || messages.length === 0) return;

        // ✅ استخدم chatId الممرر أو أنشئ واحد جديد
        const finalChatId = chatId || Date.now();
        
        // ✅ البحث عن محادثة موجودة بنفس الـ ID
        const existingChatIndex = chatHistory.findIndex(c => c.id === finalChatId);

        const newChat = {
            id: finalChatId,
            timestamp: new Date().toISOString(),
            messages: messages,
            title: messages[0]?.text?.substring(0, 50) || 'New chat',
            preview: messages[0]?.text?.substring(0, 50) || 'New chat'
        };

        let updatedHistory;

        if (existingChatIndex !== -1) {
            // ✅ تحديث المحادثة الموجودة
            updatedHistory = [...chatHistory];
            updatedHistory[existingChatIndex] = newChat;
        } else {
            updatedHistory = [newChat, ...chatHistory].slice(0, MAX_HISTORY);
        }

        setChatHistory(updatedHistory);

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    };

    // Load specific chat by ID
    const loadChat = (chatId) => {
        const chat = chatHistory.find(c => c.id === chatId);
        return chat ? chat.messages : null;
    };

    // Delete specific chat
    const deleteChat = (chatId) => {
        const updated = chatHistory.filter(c => c.id !== chatId);
        setChatHistory(updated);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error('Error deleting chat:', error);
        }
    };

    // Rename a chat
    const renameChat = (chatId, newTitle) => {
        if (!chatId || !newTitle) return;
        const updated = chatHistory.map(c =>
            c.id === chatId ? { ...c, title: newTitle, preview: newTitle } : c
        );
        setChatHistory(updated);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error('Error renaming chat:', error);
        }
    };

    // Clear all history
    const clearHistory = () => {
        setChatHistory([]);
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Error clearing history:', error);
        }
    };

    return {
        chatHistory,
        saveChat,
        loadChat,
        deleteChat,
        renameChat,
        clearHistory
    };
}

export default useChatHistory;
