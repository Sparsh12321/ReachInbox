import React, { useState } from "react";
import "./ReplyModal.css";
import Spinner from "./Spinner";
function ReplyModal({ email, isOpen, message, suggestion, onMessageChange, onAISuggest, onSend, onClose, onInsertSuggestion }) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleKeyDown = (e) => {
    if (e.key === "Tab" && suggestion) {
      e.preventDefault();
      onInsertSuggestion();
    }
  };

  const handleAISuggestClick = async () => {
    setIsLoading(true);
    await onAISuggest(); // assumes onAISuggest returns a Promise
    setIsLoading(false);
  };

  return (
    <div className="reply-modal-overlay">
      <div className="reply-modal">
        <div className="reply-modal-header">
          <h3>Reply to {email.from}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="reply-modal-body">
          <textarea
            placeholder={suggestion || "Type your reply..."}
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="ai-btn"
            onClick={handleAISuggestClick}
            title="AI Suggestion"
            disabled={isLoading}
          >
            {isLoading ?<Spinner size={18} /> : "🤖"}
          </button>
        </div>
        <div className="reply-modal-footer">
          <button className="btn cancel" onClick={onClose}>Cancel</button>
          <button className="btn send" onClick={onSend}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default ReplyModal;
