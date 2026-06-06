import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import ChatWindow from '../components/ChatWindow';
import MessageInput from '../components/MessageInput';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import ShortcutsModal from '../components/ShortcutsModal';
import UserProfileSetup from '../components/UserProfileSetup';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';

import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';
import useChatHistory from '../hooks/useChatHistory';
import { sendMessage } from '../services/chat';
import '../App.css';

function ChatPage() {
  const { language, t } = useLanguage();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  /* FIX - useRef for latest messages */
  const messagesRef = useRef([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingStatus, setTypingStatus] = useState('');
  const [isCompact, setIsCompact] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [selectedModel, setSelectedModel] = useState('cortex-fast');
  const [focusMode, setFocusMode] = useState(false);
  const [imageMode, setImageMode] = useState(false);
  /* FIX - separate error state */
  const [errorMsg, setErrorMsg] = useState(null);

  /* FIX - useRef for latest messages */
  const updateMessages = (updater) => {
    setMessages(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      messagesRef.current = next;
      return next;
    });
  };

  const needsWebSearch = (text) => {
    const keywords = ['latest', 'today', 'current', 'news', '2024', '2025', '2026', 'who is', 'what happened', 'what is new', 'recent', 'update', 'breaking'];
    const lower = text.toLowerCase();
    return keywords.some(k => lower.includes(k));
  };

  const { chatHistory, saveChat, loadChat, deleteChat, renameChat } = useChatHistory();

  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('cortex_user_profile');
    if (!stored) {
      setShowProfileSetup(true);
    } else {
      try { setUserProfile(JSON.parse(stored)); } catch { /* invalid profile */ }
    }
  }, []);

  const handleProfileSave = (profile) => {
    setUserProfile(profile);
    setShowProfileSetup(false);
  };

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

  const handleSendMessage = async (questionText, modelOverride) => {
    if (!questionText.trim()) return;
    /* FIX - clean user message on error */
    if (loading) return;
    const model = modelOverride || selectedModel;

    /* FIX - separate error state */
    setErrorMsg(null);

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: questionText,
      metadata: null,
      model: null,
    };

    if (imageMode) {
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: '',
        metadata: null,
        model: 'image',
        streaming: true,
      };
      updateMessages(prev => [...prev, userMessage, botMessage]);
      setLoading(true);
      setIsTyping(true);
      setTypingStatus(language === 'ar' ? 'جارٍ توليد الصورة...' : 'Generating image...');

      try {
        const encoded = encodeURIComponent(questionText);
        const imageUrl = `https://image.pollinations.ai/prompt/${encoded}`;
        updateMessages(prev =>
          prev.map(m =>
            m.id === botMessage.id
              ? { ...m, text: imageUrl, streaming: false, isImage: true }
              : m
          )
        );
      } catch {
        updateMessages(prev =>
          prev.map(m =>
            m.id === botMessage.id
              ? { ...m, text: language === 'ar' ? 'فشل توليد الصورة' : 'Image generation failed', streaming: false, error: true }
              : m
          )
        );
      }
      setLoading(false);
      setIsTyping(false);
      setTypingStatus('');
      return;
    }

    const botMessageId = Date.now() + 1;
    const botMessage = {
      id: botMessageId,
      type: 'bot',
      text: '',
      metadata: null,
      model: model,
      streaming: true,
    };

    updateMessages(prev => [...prev, userMessage, botMessage]);
    setLoading(true);
    setIsTyping(true);
    setTypingStatus(t.analyzing || '');

    let webSearchContext = null;

    if (needsWebSearch(questionText)) {
      setTypingStatus(language === 'ar' ? '🔍 جاري البحث في الويب...' : '🔍 Searching web...');
      try {
        const searchRes = await fetch('http://localhost:3001/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: questionText }),
        });
        const searchData = await searchRes.json();
        if (searchData.results && searchData.results.length > 0) {
          webSearchContext = searchData.results;
        }
      } catch {
        // search failed silently
      }
      setTypingStatus(t.analyzing || '');
    }

    /* FIX - sanitize consecutive roles */
    function sanitizeMessages(msgs) {
      const result = [];
      for (const msg of msgs) {
        if (result.length > 0 && result[result.length - 1].role === msg.role) {
          continue;
        }
        result.push(msg);
      }
      return result;
    }

    /* FIX - message order */
    const baseMessages = [...messagesRef.current, userMessage];
    const apiMessages = baseMessages
      .map(m => ({
        role: m.type === 'user' ? 'user' : 'assistant',
        content: m.text,
      }))
      .filter(msg =>
        !(msg.role === 'assistant' && 
          (msg.content?.includes('providers failed') || 
           msg.content?.trim() === ''))
      );  /* FIX - remove empty assistant */

    const chatMessages = sanitizeMessages(apiMessages);

    /* FIX - message order */
    let withSystem = chatMessages;
    if (webSearchContext) {
      const snippets = webSearchContext.map(r => r.content).filter(Boolean).join('\n');
      const systemPrompt = `Here is recent web data: ${snippets}. Use it to answer the user's question.`;
      withSystem = [
        { role: 'system', content: systemPrompt },
        ...chatMessages
      ];
    }

    await sendMessage({
      messages: withSystem,
      model,
      language,
      onFallback: () => {
        showToast(
          language === 'ar' ? 'جاري التبديل للخادم الاحتياطي...' : 'Switching to backup provider...',
          'neutral'
        );
      },
      onToken: (token) => {
        setIsTyping(false);
        setTypingStatus('');
        updateMessages(prev =>
          prev.map(m =>
            m.id === botMessageId
              ? { ...m, text: m.text + token, streaming: true }
              : m
          )
        );
      },
      onDone: () => {
        updateMessages(prev => {
          let updated = prev.map(m =>
            m.id === botMessageId
              ? { ...m, streaming: false, webSources: webSearchContext || undefined }
              : m
          );
          return updated;
        });
        setLoading(false);
        setIsTyping(false);
        setTypingStatus('');
      },
      onError: (errText) => {
        /* FIX - clean user message on error */
        updateMessages(prev => prev.filter(
          m => m.id !== botMessageId && m.id !== userMessage.id
        ));
        setErrorMsg(errText || t.errorMessage);
        setLoading(false);
        setIsTyping(false);
        setTypingStatus('');
      },
    });
  };

  const handleNewChat = () => {
    if (messagesRef.current.length > 0) {
      const chatId = currentChatId || `chat-${Date.now()}`;
      saveChat(messagesRef.current, chatId);
    }
    setCurrentChatId(`chat-${Date.now()}`);
    updateMessages([]);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleSelectSuggestion = (question) => {
    handleSendMessage(question);
  };

  const handleRegenerateResponse = (messageIndex) => {
    const userMessageIndex = messageIndex - 1;
    if (userMessageIndex >= 0 && messagesRef.current[userMessageIndex]?.type === 'user') {
      const userQuestion = messagesRef.current[userMessageIndex].text;
      const prevModel = messagesRef.current[messageIndex]?.model || selectedModel;
      updateMessages(prev => prev.slice(0, messageIndex));
      handleSendMessage(userQuestion, prevModel);
    }
  };

  const handleClearChat = () => {
    if (messagesRef.current.length > 0) {
      const chatId = currentChatId || Date.now();
      saveChat(messagesRef.current, chatId);
    }
    updateMessages([]);
    setCurrentChatId(Date.now());
  };

  const handleToggleFocus = () => {
    setFocusMode(prev => !prev);
  };

  const handleToggleCompact = () => {
    setIsCompact(!isCompact);
    document.body.classList.toggle('compact-mode');
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  useKeyboardShortcuts({
    onClearChat: handleClearChat,
    onShowShortcuts: () => setShowShortcuts(true),
    onToggleSidebar: handleToggleSidebar,
  });

  useEffect(() => {
    if (isCompact) {
      document.body.classList.add('compact-mode');
    } else {
      document.body.classList.remove('compact-mode');
    }
  }, [isCompact]);

  useEffect(() => {
    if (focusMode) {
      document.body.classList.add('focus-mode');
    } else {
      document.body.classList.remove('focus-mode');
    }
  }, [focusMode]);

  /* FIX - separate error state */
  useEffect(() => {
    if (!errorMsg) return;
    const timer = setTimeout(() => setErrorMsg(null), 5000);
    return () => clearTimeout(timer);
  }, [errorMsg]);

  const handleLoadChat = (chat) => {
    if (messagesRef.current.length > 0 && currentChatId && currentChatId !== chat.id) {
      saveChat(messagesRef.current, currentChatId);
    }
    const loadedMessages = loadChat(chat.id);
    if (loadedMessages) {
      updateMessages(loadedMessages);
      setCurrentChatId(chat.id);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    }
  };

  const handleDeleteChat = (chatId) => {
    deleteChat(chatId);
    if (chatId === currentChatId) {
      updateMessages([]);
      setCurrentChatId(Date.now());
    }
  };

  return (
    <div className="app-container">
      {showProfileSetup && (
        <UserProfileSetup onSave={handleProfileSave} initialProfile={userProfile} />
      )}

      {isSidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNewChat={handleNewChat}
        chatHistory={chatHistory}
        onLoadChat={handleLoadChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={renameChat}
        activeChatId={currentChatId}
        onEditProfile={() => setShowProfileSetup(true)}
      />

      <div className="main-content">
        <Header
          onToggleSidebar={handleToggleSidebar}
          onClearChat={handleClearChat}
          onToggleFocus={handleToggleFocus}
          focusMode={focusMode}
          onToggleCompact={handleToggleCompact}
          isCompact={isCompact}
          messages={messages}
        />

        <div className="chat-area">
          <ChatWindow
            messages={messages}
            isTyping={isTyping}
            typingStatus={typingStatus}
            onSelectSuggestion={handleSelectSuggestion}
            onRegenerateResponse={handleRegenerateResponse}
          />
          {/* FIX - separate error state */}
          {errorMsg && (
            <div className="temp-error-banner" role="alert">
              <span>{errorMsg}</span>
              <button
                className="temp-error-dismiss"
                onClick={() => setErrorMsg(null)}
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={loading}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          imageMode={imageMode}
          onImageModeToggle={() => setImageMode(prev => !prev)}
        />

        <Footer />
      </div>

      {focusMode && (
        <button className="focus-exit-btn" onClick={handleToggleFocus} title="Exit Focus Mode">
          ✕
        </button>
      )}

      {showShortcuts && (
        <ShortcutsModal
          onClose={() => setShowShortcuts(false)}
        />
      )}
    </div>
  );
}

export default ChatPage;
