// src/components/secretChat/SecretChatHeader.jsx
import React from "react";

function SecretChatHeader({ recipient }) {
  return (
    <header className="sticky top-0 z-10 p-4 border-b bg-white dark:bg-gray-800 flex items-center justify-between">
      <div className="flex items-center">
        <img
          src={recipient.avatar || "https://via.placeholder.com/40"}
          alt={recipient.username}
          className="w-10 h-10 rounded-full mr-4"
        />
        <div className="flex flex-col">
          <h2 className="text-lg font-bold">{recipient.username}</h2>
          <p className="text-sm text-red-500">Secret Chat (expires if idle)</p>
        </div>
      </div>
      <button className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
        {/* Use a refined three-dot icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          className="w-6 h-6"
          viewBox="0 0 24 24"
        >
          <path d="M12 7a2 2 0 110-4 2 2 0 010 4zm0 2a2 2 0 100 4 2 2 0 000-4zm0 6a2 2 0 110 4 2 2 0 010-4z" />
        </svg>
      </button>
    </header>
  );
}

export default SecretChatHeader;
