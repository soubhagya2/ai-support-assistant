import { useState, useEffect, useRef } from "react";
import "./App.css";
import ChatMessage from "./components/ChatMessage";
import ChatInput from "./components/ChatInput";
import SessionPanel from "./components/SessionPanel";
import { sendMessage, getMessages } from "./api/chatApi";
import { getOrCreateSessionId, setNewSession } from "./utils/sessionManager";

function App() {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef(null);

  // Initialize session on mount
  useEffect(() => {
    const id = getOrCreateSessionId();
    setSessionId(id);
    loadMessages(id);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async (id) => {
    try {
      setError(null);
      const response = await getMessages(id);
      setMessages(response.messages || []);
    } catch (err) {
      console.error("Failed to load messages:", err);
      setError("Failed to load chat history");
    }
  };

  const handleSendMessage = async (text) => {
    if (!text.trim() || !sessionId) return;

    // Add user message to UI immediately
    const userMessage = {
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      // Send message to backend
      const response = await sendMessage(sessionId, text);

      // Add assistant message
      const assistantMessage = {
        role: "assistant",
        content: response.reply,
        created_at: response.timestamp,
        tokensUsed: response.tokensUsed,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Failed to send message:", err);
      setError(err.message || "Failed to send message");

      // Remove the user message if sending failed
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    const newSessionId = setNewSession();
    setSessionId(newSessionId);
    setMessages([]);
    setError(null);
  };

  const handleDeleteChat = async (requestedSessionId) => {
    if (requestedSessionId === sessionId) {
      handleNewChat();
    }
  };

  return (
    <div className="app">
      <div className="app-container">
        {/* Sidebar */}
        <SessionPanel
          currentSessionId={sessionId}
          isOpen={showSidebar}
          onToggle={() => setShowSidebar(!showSidebar)}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
        />

        {/* Main Chat Area */}
        <div className="chat-container">
          {/* Header */}
          <div className="chat-header">
            <button
              className="menu-btn"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              ☰
            </button>
            <div className="header-content">
              <h1>AI Support Assistant</h1>
              <p className="session-info">
                Session: {sessionId?.slice(0, 16)}...
              </p>
            </div>
            <button className="new-chat-btn" onClick={handleNewChat}>
              New Chat
            </button>
          </div>

          {/* Messages Area */}
          <div className="messages-area">
            {messages.length === 0 && (
              <div className="empty-state">
                <h2>👋 Welcome to AI Support Assistant</h2>
                <p>Ask me anything about our products and services!</p>
                <div className="suggestions">
                  <p className="s-title">Try asking:</p>
                  <button
                    className="suggestion-btn"
                    onClick={() =>
                      handleSendMessage("How do I reset my password?")
                    }
                  >
                    How do I reset my password?
                  </button>
                  <button
                    className="suggestion-btn"
                    onClick={() =>
                      handleSendMessage("What's your refund policy?")
                    }
                  >
                    What's your refund policy?
                  </button>
                  <button
                    className="suggestion-btn"
                    onClick={() =>
                      handleSendMessage("How do I contact support?")
                    }
                  >
                    How do I contact support?
                  </button>
                </div>
              </div>
            )}

            {messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}

            {loading && (
              <div className="loading-message">
                <div className="dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <p>AI is thinking...</p>
              </div>
            )}

            {error && (
              <div className="error-message">
                <p>⚠️ {error}</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <ChatInput onSendMessage={handleSendMessage} disabled={loading} />
        </div>
      </div>
    </div>
  );
}

export default App;
