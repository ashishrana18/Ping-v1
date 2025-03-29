// src/components/secretChat/SecretChatInput.jsx
import React, { useState } from "react";
import socket from "../../services/socket.js";
import api from "../../services/api.js";

function SecretChatInput({ secretChatId, setMessages }) {
  const [input, setInput] = useState("");

  const sendSecretMessage = async () => {
    if (input.trim() === "") return;
    const payload = {
      chatId: secretChatId,
      userId: "currentUserId", // Replace with your actual current user ID from context
      msg: input // For a secret chat, you may want to encrypt this before sending
    };

    // Send via Socket.IO
    socket.emit("sendSecretMessage", payload);

    // Call backend to store the message (this resets the TTL on the Redis sorted set)
    try {
      const response = await api.post(`/secret/create`, payload);
      console.log("Secret message saved:", response.data);
      // Optionally, update local state (optimistic UI)
      setMessages((prev) => [...prev, { ...payload, timestamp: Date.now() }]);
      setInput("");
    } catch (error) {
      console.error("Error sending secret message:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendSecretMessage();
  };

  return (
    <div className="flex-shrink-0 p-4 bg-gray-200 dark:bg-gray-700">
      <div className="flex">
        <input
          type="text"
          placeholder="Type a secret message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-grow p-2 rounded-l border border-gray-300"
        />
        <button
          onClick={sendSecretMessage}
          className="px-4 py-2 rounded-r bg-green-500 text-white border border-green-500"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default SecretChatInput;
