import React from "react";
import { format } from "date-fns";

export default function Message({ message, isOwnMessage, isGroup }) {
  const time = format(new Date(message.sentAt || message.createdAt), "hh:mm a");

  return (
    <div
      className={`flex items-end gap-2 mb-1 px-2 ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
    >
      {/* Avatar for group messages */}
      {!isOwnMessage && isGroup && (
        <img
          src={message.senderAvatar}
          alt={message.senderName}
          className="w-8 h-8 rounded-full shrink-0"
        />
      )}

      <div
        className={`relative px-3 py-2 rounded-xl max-w-[80%] w-fit
          ${
            isOwnMessage
              ? "bg-blue-500 dark:bg-[#219ebc] text-white rounded-br-none"
              : "bg-green-700 dark:bg-accent text-white text-white rounded-bl-none"
          }
        `}
        style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
      >
        {/* Sender name for group chat */}
        {isGroup && !isOwnMessage && (
          <div className="text-base font-semibold text-rose-300 mb-0.5">
            {message.senderName}
          </div>
        )}
        <div className="flex flex-wrap items-baseline gap-1 break-words whitespace-pre-wrap">
          <div className="text-base">{message.text}</div>
          <span className="text-[11px] text-gray-300 ml-2 mt-0.5">{time}</span>
        </div>
      </div>
    </div>
  );
}
