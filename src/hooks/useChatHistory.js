import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

function useChatHistory() {
    const [chatHistory, setChatHistory] = useState([]);
    const STORAGE_KEY = 'cortex_chat_history';
    const MAX_HISTORY = 50;

    useEffect(() => {
        async function loadFromSupabase() {
            if (supabase) {
                try {
                    const { data, error } = await supabase
                        .from('conversations')
                        .select('*')
                        .order('updated_at', { ascending: false })
                        .limit(MAX_HISTORY);
                    if (!error && data) {
                        const mapped = data.map(row => ({
                            id: row.id,
                            timestamp: row.updated_at || row.created_at,
                            title: row.title,
                            preview: row.title,
                            messages: row.messages || [],
                        }));
                        setChatHistory(mapped);
                        return true;
                    }
                } catch {
                    // fall through
                }
            }
            return false;
        }
        (async () => {
            const loaded = await loadFromSupabase();
            if (!loaded) {
                try {
                    const stored = localStorage.getItem(STORAGE_KEY);
                    if (stored) {
                        setChatHistory(JSON.parse(stored));
                    }
                } catch (error) {
                    console.error('Error loading chat history:', error);
                }
            }
        })();
    }, []);

    const saveToSupabase = async (chat) => {
        if (!supabase) return false;
        try {
            const { error } = await supabase
                .from('conversations')
                .upsert({
                    id: chat.id,
                    title: chat.title,
                    messages: chat.messages,
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'id' });
            return !error;
        } catch {
            return false;
        }
    };

    const deleteFromSupabase = async (chatId) => {
        if (!supabase) return false;
        try {
            const { error } = await supabase
                .from('conversations')
                .delete()
                .eq('id', chatId);
            return !error;
        } catch {
            return false;
        }
    };

    const saveChat = async (messages, chatId = null) => {
        if (!messages || messages.length === 0) return;

        const finalChatId = chatId || Date.now();
        const existingChatIndex = chatHistory.findIndex(c => c.id === finalChatId);

        const newChat = {
            id: finalChatId,
            timestamp: new Date().toISOString(),
            messages: messages,
            title: messages[0]?.text?.substring(0, 50) || 'New chat',
            preview: messages[0]?.text?.substring(0, 50) || 'New chat',
        };

        let updatedHistory;

        if (existingChatIndex !== -1) {
            updatedHistory = [...chatHistory];
            updatedHistory[existingChatIndex] = newChat;
        } else {
            updatedHistory = [newChat, ...chatHistory].slice(0, MAX_HISTORY);
        }

        setChatHistory(updatedHistory);

        const saved = await saveToSupabase(newChat);
        if (!saved) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
            } catch (error) {
                console.error('Error saving chat history:', error);
            }
        }
    };

    const loadChat = (chatId) => {
        const chat = chatHistory.find(c => c.id === chatId);
        return chat ? chat.messages : null;
    };

    const deleteChat = async (chatId) => {
        const updated = chatHistory.filter(c => c.id !== chatId);
        setChatHistory(updated);

        const deleted = await deleteFromSupabase(chatId);
        if (!deleted) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            } catch (error) {
                console.error('Error deleting chat:', error);
            }
        }
    };

    const renameChat = async (chatId, newTitle) => {
        if (!chatId || !newTitle) return;
        const updated = chatHistory.map(c =>
            c.id === chatId ? { ...c, title: newTitle, preview: newTitle } : c
        );
        setChatHistory(updated);

        const saved = await saveToSupabase({ id: chatId, title: newTitle, messages: updated.find(c => c.id === chatId)?.messages || [] });
        if (!saved) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            } catch (error) {
                console.error('Error renaming chat:', error);
            }
        }
    };

    const clearHistory = async () => {
        setChatHistory([]);
        if (supabase) {
            try {
                await supabase.from('conversations').delete().neq('id', 'none');
            } catch {
                // ignore
            }
        }
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch {
            // ignore
        }
    };

    return {
        chatHistory,
        saveChat,
        loadChat,
        deleteChat,
        renameChat,
        clearHistory,
    };
}

export default useChatHistory;
