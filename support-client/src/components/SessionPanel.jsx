import { useEffect, useState } from "react";
import "../styles/SessionPanel.css";
import { getSessions, deleteSession } from "../api/chatApi";

export default function SessionPanel({
  currentSessionId,
  isOpen,
  onToggle,
  onNewChat,
  onDeleteChat,
}) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const response = await getSessions();
      setSessions(response.sessions || []);
    } catch (error) {
      console.error("Failed to load sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();

    if (confirm("Are you sure you want to delete this chat?")) {
      try {
        await deleteSession(sessionId);
        setSessions(sessions.filter((s) => s.id !== sessionId));
        onDeleteChat(sessionId);
      } catch (error) {
        console.error("Failed to delete session:", error);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    // Hours ago
    if (diff < 3600000) {
      const mins = Math.floor(diff / 60000);
      return mins === 0 ? "now" : `${mins}m ago`;
    }

    // Today
    if (diff < 86400000) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // This week
    if (diff < 604800000) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    }

    // Older
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h2>Chat History</h2>
          <button className="close-btn" onClick={onToggle}>
            ✕
          </button>
        </div>

        <button className="new-chat-btn-sidebar" onClick={onNewChat}>
          + New Chat
        </button>

        {/* Sessions List */}
        <div className="sessions-list">
          {loading ? (
            <p className="loading">Loading...</p>
          ) : sessions.length === 0 ? (
            <p className="empty">No previous chats</p>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={`session-item ${
                  session.id === currentSessionId ? "active" : ""
                }`}
                onClick={onNewChat} // Could implement session switching here
              >
                <div className="session-info">
                  <p className="session-id">Chat {session.id.slice(8, 14)}</p>
                  <p className="session-meta">
                    {session.messageCount || 0} messages ·{" "}
                    {formatDate(session.updated_at)}
                  </p>
                </div>
                <button
                  className="delete-btn"
                  onClick={(e) => handleDeleteSession(session.id, e)}
                  title="Delete chat"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>

        <div className="sidebar-footer">
          <p className="footer-text">🤖 AI Support Assistant</p>
          <p className="footer-version">v1.0.0</p>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onToggle} />}
    </>
  );
}
