import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import ChatWindow from '../components/ChatWindow';
import MessageInput from '../components/MessageInput';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import ShortcutsModal from '../components/ShortcutsModal';
import { translations } from '../utils/translations';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';
import useChatHistory from '../hooks/useChatHistory';
import '../App.css';
import { askQuestion, createNewSession, clearSession, getStats } from '../services/api';

function ChatPage() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [language, setLanguage] = useState('en');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingStatus, setTypingStatus] = useState('');
  const [isCompact, setIsCompact] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [currentChatId, setCurrentChatId] = useState(null);
  
  const { chatHistory, saveChat, loadChat, deleteChat, renameChat } = useChatHistory();


  useEffect(() => {
    const savedLang = localStorage.getItem('selectedLanguage') || 'en';
    setLanguage(savedLang);
    document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = savedLang;
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getStats();
        setStats(data);
        console.log('System stats:', data);
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    }
    loadStats();
  }, []);

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('selectedLanguage', newLanguage);
    document.documentElement.dir = newLanguage === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLanguage;
  };

  const handleSendMessage = async (questionText) => {
    if (!questionText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: questionText,
      metadata: null,
      isDeepThink: false,
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setIsTyping(true);
    setTypingStatus(translations[language].analyzing || '');

    try {
      const response = await askQuestion(questionText);
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: response.answer || 'No answer received.',
        metadata: {
          confidence: response.confidence,
          source: response.source,
          engine: response.engine,
          hasContext: response.has_context,
        },
        isDeepThink: false,
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: 'عذراً، حدث خطأ في الاتصال. تأكد من تشغيل الخادم.',
        metadata: null,
        isDeepThink: false,
        error: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setIsTyping(false);
      setTypingStatus('');
    }
  };

  const handleNewChat = async () => {
    if (messages.length > 0) {
      const chatId = currentChatId || `chat-${Date.now()}`;
      saveChat(messages, chatId);
    }
    
    const newChatId = `chat-${Date.now()}`;
    setCurrentChatId(newChatId);
    setMessages([]);
    
    try {
      await clearSession();
      await createNewSession();
      
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    } catch (error) {
      console.error('Error starting new chat:', error);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    }
  };

  const handleDeepThink = async (questionText) => {
    const t = translations[language];
    const userMessage = { type: 'user', text: questionText, metadata: null, isDeepThink: true };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    setTypingStatus(t.deepThinking);

    try {
      const response = await askQuestion(questionText);
      const botMessage = {
        type: 'bot',
        text: response.answer || 'No answer received.',
        metadata: { confidence: response.confidence, question: response.question },
        isDeepThink: true
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        type: 'bot',
        text: `Deep Think Error: ${error.message}`,
        metadata: null,
        isDeepThink: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setTypingStatus('');
    }
  };

  const handleSelectSuggestion = (question) => {
    handleSendMessage(question);
  };

  const handleRegenerateResponse = async (messageIndex) => {
    const userMessageIndex = messageIndex - 1;
    if (userMessageIndex >= 0 && messages[userMessageIndex]?.type === 'user') {
      const userQuestion = messages[userMessageIndex].text;
      const wasDeepThink = messages[messageIndex]?.isDeepThink;
      setMessages(prev => prev.slice(0, messageIndex));
      if (wasDeepThink) {
        await handleDeepThink(userQuestion);
      } else {
        await handleSendMessage(userQuestion);
      }
    }
  };

  const handleClearChat = () => {
    if (messages.length > 0) {
      const chatId = currentChatId || Date.now();
      saveChat(messages, chatId);
    }
    setMessages([]);
    setCurrentChatId(Date.now());
  };

  const handleToggleCompact = () => {
    setIsCompact(!isCompact);
    document.body.classList.toggle('compact-mode');
  };

  useKeyboardShortcuts({
    onClearChat: handleClearChat,
    onShowShortcuts: () => setShowShortcuts(true)
  });

  useEffect(() => {
    if (isCompact) {
      document.body.classList.add('compact-mode');
    } else {
      document.body.classList.remove('compact-mode');
    }
  }, [isCompact]);

  const handleLoadChat = (chat) => {
    if (messages.length > 0 && currentChatId && currentChatId !== chat.id) {
      saveChat(messages, currentChatId);
    }
    
    const loadedMessages = loadChat(chat.id);
    if (loadedMessages) {
      setMessages(loadedMessages);
      setCurrentChatId(chat.id);
      
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    }
  };

  const handleDeleteChat = (chatId) => {
    deleteChat(chatId);
    
    if (chatId === currentChatId) {
      setMessages([]);
      setCurrentChatId(Date.now());
    }
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <div className="app-container">
      {isSidebarOpen && (
        <div 
          className="mobile-overlay" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar 
        language={language}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNewChat={handleNewChat}
        chatHistory={chatHistory}
        onLoadChat={handleLoadChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={renameChat}
        activeChatId={currentChatId}
      />

      <div className="main-content">
        <Header
          language={language}
          onLanguageChange={handleLanguageChange}
          onToggleSidebar={handleToggleSidebar}
          onClearChat={handleClearChat}
          onToggleCompact={handleToggleCompact}
          isCompact={isCompact}
        />

        <div className="chat-area">
          <ChatWindow
            messages={messages}
            language={language}
            isTyping={isTyping}
            typingStatus={typingStatus}
            onSelectSuggestion={handleSelectSuggestion}
            onRegenerateResponse={handleRegenerateResponse}
          />
        </div>

        <MessageInput
          onSendMessage={handleSendMessage}
          onDeepThink={handleDeepThink}
          language={language}
          disabled={loading}
        />

        <Footer language={language} />
      </div>

      {showShortcuts && (
        <ShortcutsModal 
          language={language}
          onClose={() => setShowShortcuts(false)}
        />
      )}
    </div>
  );
}

export default ChatPage;
