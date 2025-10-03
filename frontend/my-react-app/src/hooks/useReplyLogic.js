import { useState } from "react";
import { GoogleGenAI } from "@google/genai";
export default function useReplyLogic(bodyText) {
  const [message, setMessage] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_GEMINI_KEY });

  const handleAISuggest = async () => {
    if (!bodyText) return;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Write a professional reply for the following email:\n\n${bodyText} and return just the text without any additional commentary int max of 30 words.`,
      });
      setSuggestion(response.text);
    } catch (err) {
      console.error(err);
      setSuggestion("Could not generate suggestion");
    }
  };

  const handleInsertSuggestion = () => {
    if (suggestion) {
      setMessage(suggestion);
      setSuggestion("");
    }
  };

  const handleSend = (onSendCallback, onCloseCallback) => {
    if (message.trim() === "") return;
    onSendCallback(message);
    setMessage("");
    onCloseCallback();
  };

  return {
    message,
    suggestion,
    setMessage,
    handleAISuggest,
    handleInsertSuggestion,
    handleSend,
  };
}
