// src/components/chat/Message.jsx
import React from "react";
import { formatDistanceToNow } from "date-fns";

function Message({ message, isOwnMessage }) {
  return (
    <div
      className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}
    >
      <div
        className={`px-4 py-2 rounded-lg max-w-xs break-words ${
          isOwnMessage ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-900"
        }`}
      >
        <p>{message.text}</p>
      </div>
      <span className="text-xs text-gray-500 mt-1">
        {formatDistanceToNow(new Date(message.sentAt || message.createdAt), {
          addSuffix: true
        })}
      </span>
    </div>
  );
}

export default Message;
