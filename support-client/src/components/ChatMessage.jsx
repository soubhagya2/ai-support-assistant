import "../styles/ChatMessage.css";

export default function ChatMessage({ message }) {
  const isUser = message.role === "user";
  const timestamp = new Date(message.created_at).toLocaleTimeString();

  return (
    <div className={`message ${isUser ? "user-message" : "assistant-message"}`}>
      <div className="message-avatar">{isUser ? "👤" : "🤖"}</div>
      <div className="message-content">
        <div className="message-header">
          <span className="message-role">{isUser ? "You" : "Assistant"}</span>
          <span className="message-time">{timestamp}</span>
        </div>
        <div className="message-text">{message.content}</div>
        {message.tokensUsed && (
          <div className="message-meta">Tokens used: {message.tokensUsed}</div>
        )}
      </div>
    </div>
  );
}
