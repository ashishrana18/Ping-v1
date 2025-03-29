// src/components/secretChat/Message.jsx
import React from "react";
import { formatDistanceToNow } from "date-fns";

function Message({ message }) {
  return (
    <div className="flex flex-col">
      <div className="px-4 py-2 rounded-lg bg-blue-500 text-white max-w-xs break-words">
        {message.text}
      </div>
      <span className="text-xs text-gray-500 mt-1">
        {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
      </span>
    </div>
  );
}

export default Message;
