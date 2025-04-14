import React from "react";
import EmojiPicker from "emoji-picker-react";
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";

export default function Message({
  message,
  isOwnMessage,
  isGroup,
  onReact,
  onShowReactions
}) {
  const time = format(new Date(message.sentAt || message.createdAt), "hh:mm a");

  const reactions = message.reactions ?? [];
  const counts = reactions.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});

  const [showPicker, setShowPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ x: 0, y: 0 });
  const [pickerStyles, setPickerStyles] = useState({ top: 0, left: 0 });
  const pickerRef = useRef(null);

  // When showPicker or initial position changes, adjust to stay on-screen
  useEffect(() => {
    if (!showPicker || !pickerRef.current) return;

    const { offsetWidth: w, offsetHeight: h } = pickerRef.current;
    let x = pickerPosition.x;
    let y = pickerPosition.y;

    // clamp horizontally
    if (x + w > window.innerWidth - 8) {
      x = window.innerWidth - w - 8;
    }
    if (x < 8) x = 8;

    // clamp vertically
    if (y + h > window.innerHeight - 8) {
      y = window.innerHeight - h - 8;
    }
    if (y < 8) y = 8;

    setPickerStyles({ top: y, left: x });
  }, [showPicker, pickerPosition]);

  const handleContextMenu = (e) => {
    e.preventDefault();
    setPickerPosition({ x: e.clientX, y: e.clientY });
    setShowPicker(true);
  };

  const handleEmojiClick = (emojiData) => {
    onReact(message.id, emojiData.emoji); // call the parent to handle DB update
    setShowPicker(false);
  };

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
        onContextMenu={handleContextMenu}
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
        {showPicker && (
          <div
            ref={pickerRef}
            onClick={(e) => e.stopPropagation()}
            style={{
              top: pickerStyles.top,
              left: pickerStyles.left
            }}
            className=" bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2"
          >
            {/* close button */}
            <button
              onClick={() => setShowPicker(false)}
              className="absolute top-1 right-1 h-7 w-7 z-20 flex items-center justify-center bg-red-500 text-white hover:text-gray-200 text-2xl rounded"
            >
              &times;
            </button>
            <EmojiPicker onEmojiClick={handleEmojiClick} className="z-10" />
          </div>
        )}
        {Object.keys(counts).length > 0 && (
          <div
            className="flex items-center space-x-1 ml-2 mt-2 cursor-pointer"
            onClick={() => onShowReactions(message.id)}
          >
            {Object.entries(counts).map(([emoji, cnt]) => (
              <span
                key={emoji}
                className="flex items-center px-2 py-0.5 bg-gray-600 rounded-full text-sm"
              >
                <span className="mr-1">{emoji}</span>
                <span>{cnt}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
