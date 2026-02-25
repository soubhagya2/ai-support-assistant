import { useState, useRef, useEffect } from "react";
import "../styles/ChatInput.css";

export default function ChatInput({ onSendMessage, disabled }) {
  const [input, setInput] = useState("");
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input);
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <div className="input-wrapper">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your question here... (Shift+Enter for new line)"
          disabled={disabled}
          className="input-field"
          rows="1"
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="send-btn"
          title="Send message (Enter)"
        >
          {disabled ? "Sending..." : "Send"}
        </button>
      </div>
      <p className="input-hint">
        💡 Ask about account, billing, refunds, security, and more!
      </p>
    </form>
  );
}
