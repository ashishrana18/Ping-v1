// src/components/secretChat/SecretChatMessages.jsx
import React, { useEffect, useRef } from "react";
import Message from "./Message.jsx"; // A component to display an individual message

function SecretChatMessages({ messages }) {
  const containerRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="flex-grow overflow-y-auto px-4 pt-4 bg-gray-100 dark:bg-gray-800 space-y-2 pb-24"
    >
      {messages.map((msg, index) => (
        <Message key={index} message={msg} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default SecretChatMessages;
