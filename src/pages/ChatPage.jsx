import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import ChatWindow from '../components/ChatWindow';
import MessageInput from '../components/MessageInput';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import ShortcutsModal from '../components/ShortcutsModal';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';
import useChatHistory from '../hooks/useChatHistory';
import { sendMessage } from '../services/chat';
import '../App.css';

function ChatPage() {
  const { language, setLanguage, t } = useLanguage();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingStatus, setTypingStatus] = useState('');
  const [isCompact, setIsCompact] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [selectedModel, setSelectedModel] = useState('cortex-fast');

  const { chatHistory, saveChat, loadChat, deleteChat, renameChat } = useChatHistory();

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
    const model = modelOverride || selectedModel;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: questionText,
      metadata: null,
      model: null,
    };

    const botMessageId = Date.now() + 1;
    const botMessage = {
      id: botMessageId,
      type: 'bot',
      text: '',
      metadata: null,
      model: model,
      streaming: true,
    };

    setMessages(prev => [...prev, userMessage, botMessage]);
    setLoading(true);
    setIsTyping(true);
    setTypingStatus(translations[language].analyzing || '');

    const chatMessages = [...messages, userMessage].map(m => ({
      role: m.type === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));

    await sendMessage({
      messages: chatMessages,
      model,
      language,
      onToken: (token) => {
        setIsTyping(false);
        setTypingStatus('');
        setMessages(prev =>
          prev.map(m =>
            m.id === botMessageId
              ? { ...m, text: m.text + token, streaming: true }
              : m
          )
        );
      },
      onDone: () => {
        setMessages(prev =>
          prev.map(m =>
            m.id === botMessageId
              ? { ...m, streaming: false }
              : m
          )
        );
        setLoading(false);
        setIsTyping(false);
        setTypingStatus('');
      },
      onError: (errorMsg) => {
        setMessages(prev =>
          prev.map(m =>
            m.id === botMessageId
              ? {
                  ...m,
                  text: errorMsg || t.errorMessage,
                  streaming: false,
                  error: true,
                }
              : m
          )
        );
        setLoading(false);
        setIsTyping(false);
        setTypingStatus('');
      },
    });
  };

  const handleNewChat = () => {
    if (messages.length > 0) {
      const chatId = currentChatId || `chat-${Date.now()}`;
      saveChat(messages, chatId);
    }
    setCurrentChatId(`chat-${Date.now()}`);
    setMessages([]);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleSelectSuggestion = (question) => {
    handleSendMessage(question);
  };

  const handleRegenerateResponse = (messageIndex) => {
    const userMessageIndex = messageIndex - 1;
    if (userMessageIndex >= 0 && messages[userMessageIndex]?.type === 'user') {
      const userQuestion = messages[userMessageIndex].text;
      const prevModel = messages[messageIndex]?.model || selectedModel;
      setMessages(prev => prev.slice(0, messageIndex));
      handleSendMessage(userQuestion, prevModel);
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
          onToggleSidebar={handleToggleSidebar}
          onClearChat={handleClearChat}
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
        </div>

        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={loading}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />

        <Footer />
      </div>

      {showShortcuts && (
        <ShortcutsModal
          onClose={() => setShowShortcuts(false)}
        />
      )}
    </div>
  );
}

export default ChatPage;
