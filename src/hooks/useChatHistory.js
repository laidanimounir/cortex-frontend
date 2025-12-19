import { useState, useEffect } from 'react';


function useChatHistory() {
    const [chatHistory, setChatHistory] = useState([]);
    const STORAGE_KEY = 'cortex_chat_history';
    const MAX_HISTORY = 10;

    
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

   
    const saveChat = (messages) => {
        if (messages.length <= 1) return; 

        const newChat = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            messages: messages,
            preview: messages[1]?.text?.substring(0, 50) || 'New chat'
        };

        const updatedHistory = [newChat, ...chatHistory].slice(0, MAX_HISTORY);
        setChatHistory(updatedHistory);

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    };

    
    const loadChat = (chatId) => {
        const chat = chatHistory.find(c => c.id === chatId);
        return chat ? chat.messages : null;
    };

   
    const deleteChat = (chatId) => {
        const updated = chatHistory.filter(c => c.id !== chatId);
        setChatHistory(updated);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error('Error deleting chat:', error);
        }
    };

   
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
        clearHistory
    };
}

export default useChatHistory;
