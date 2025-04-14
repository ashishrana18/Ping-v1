// src/components/chat/SingleChat.jsx
import React, { useEffect, useState, useRef, useContext } from "react";
import api from "../../services/api.js";
import socket from "../../services/socket.js";
import Message from "./Message.jsx";
import { AuthContext } from "../../services/authcontext.jsx";
import { ApiError } from "../../../../backend/src/utils/ApiError.js";

function SingleChat({ chat, friend }) {
  const { user } = useContext(AuthContext);
  const currentUserId = user?.id;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const containerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);
  const [member, setMember] = useState(null); //to display which member is typing in grp
  const [isFriendTyping, setIsFriendTyping] = useState(false); //to display friend is typing or not
  const [reactionsPopup, setReactionsPopup] = useState(null);

  useEffect(() => {
    if (chat && chat.id && currentUserId) {
      socket.emit("joinRoom", { chatId: chat.id, userId: currentUserId });
    }
  }, [chat, currentUserId]);

  useEffect(() => {
    const handleReconnect = () => {
      if (chat && chat.id && currentUserId) {
        console.log("Socket reconnected, rejoining room:", chat.id);
        socket.emit("joinRoom", { chatId: chat.id, userId: currentUserId });
      }
    };

    socket.on("connect", handleReconnect);

    return () => {
      socket.off("connect", handleReconnect);
    };
  }, [chat, currentUserId]);

  useEffect(() => {
    if (chat && chat.id) {
      api
        .get(`/messages/${chat.id}`)
        .then((response) => {
          if (response.data && response.data.data) {
            setMessages(response.data.data);
          }
        })
        .catch((err) => console.error("Error fetching messages:", err));
    }
  }, [chat]);

  useEffect(() => {
    const messageHandler = (message) => {
      if (message.chatId !== chat.id) return;
      setMessages((prev) => [...prev, message]);
    };
    socket.on("receiveMessage", messageHandler);
    return () => {
      socket.off("receiveMessage", messageHandler);
    };
  }, [chat.id]);

  // Auto-scroll logic on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (input.trim() !== "" && chat && chat.id && currentUserId) {
      socket.emit("sendMessage", {
        chatId: chat.id,
        text: input,
        senderId: currentUserId
      });
      setInput("");
      // Optionally scroll after sending
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    setInput(""); // Clear input whenever the chat changes
  }, [chat]);

  const handleInputChange = (e) => {
    setInput(e.target.value);

    // notify server we’re typing
    socket.emit("typing", { chatId: chat.id, userId: currentUserId });

    clearTimeout(typingTimeout.current);
    // after 1.5s of no keystrokes, emit stopTyping
    typingTimeout.current = setTimeout(() => {
      socket.emit("stopTyping", { chatId: chat.id, userId: currentUserId });
    }, 1500);
  };

  useEffect(() => {
    const onTyping = ({ userId, chatId }) => {
      // if typing isnt in current chat, or its me who is typing, then do nothing.
      if (userId === currentUserId || chatId !== chat.id) return;

      api
        .get(`/user/profile/${userId}`)
        .then((response) => {
          if (response.data && response.data.data) {
            setMember(response.data.data);
          }
        })
        .catch((error) => {
          throw new ApiError(400, "User not fetched!", error);
        });
      setIsFriendTyping(true);
    };
    const onStop = ({ userId }) => {
      if (userId !== currentUserId) setIsFriendTyping(false);
    };

    socket.on("userTyping", onTyping);
    socket.on("userStopTyping", onStop);
    return () => {
      socket.off("userTyping", onTyping);
      socket.off("userStopTyping", onStop);
    };
  }, [currentUserId, chat]);

  useEffect(() => {
    socket.on("reaction-added", ({ messageId, emoji, user }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) => {
          if (msg.id !== messageId) return msg;

          return {
            ...msg,
            reactions: [...(msg.reactions || []), { emoji, user }]
          };
        })
      );
    });

    return () => socket.off("reaction-added");
  }, []);

  useEffect(() => {
    socket.on("reaction-updated", ({ messageId, emoji, user, action }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== messageId) return msg;
          let reactions = msg.reactions || [];
          if (action === "removed") {
            reactions = reactions.filter((r) => !(r.user.id === user.id));
          } else {
            // replace existing or add
            reactions = [
              ...reactions.filter((r) => r.user.id !== user.id),
              { emoji, user }
            ];
          }
          return { ...msg, reactions };
        })
      );
    });
    return () => {
      socket.off("reaction-updated");
    };
  }, []);

  const handleReaction = async (messageId, emoji) => {
    try {
      await api.post(`/messages/${messageId}/${currentUserId}`, {
        reactionType: emoji
      });
    } catch (err) {
      console.error("Failed to react:", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages container */}
      <div
        ref={containerRef}
        className="flex-grow overflow-y-auto pl-5 pr-6 pt-5 pb-3 bg-gray-100 dark:bg-[#212529]  space-y-2 pb-24 "
      >
        {messages.map((msg, index) => (
          <Message
            key={`${msg.id}-${index}`}
            message={msg}
            isGroup={chat.isGroup}
            isOwnMessage={msg.senderId === currentUserId}
            onReact={handleReaction}
            onShowReactions={(messageId) => setReactionsPopup(messageId)}
          />
        ))}
        <div ref={messagesEndRef} />
        {reactionsPopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 dark:text-white p-6 rounded-lg max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-4">Reactions</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {messages
                  .find((m) => m.id === reactionsPopup)
                  ?.reactions.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-md"
                    >
                      <img
                        src={r.user.avatar}
                        alt={r.user.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="font-medium text-white">
                        {r.user.username}
                      </span>
                      <span className="text-2xl ml-auto">{r.emoji}</span>
                    </div>
                  ))}
              </div>
              <button
                className="mt-4 px-4 py-2 bg-gray-200 rounded dark:text-black"
                onClick={() => setReactionsPopup(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Input Box fixed at bottom */}
      <div className="flex-shrink-0 p-2 bg-gray-200 dark:bg-panel">
        {isFriendTyping && (
          <div className="mx-4 mb-1 text-sm italic text-gray-600 dark:text-green-500 ">
            {chat.isGroup
              ? member && `${member.username} is typing…`
              : `${friend.username} typing…`}
          </div>
        )}
        <div className="flex">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="flex-grow p-2 dark:bg-slate-600 dark:text-white rounded-full mr-2 text-base"
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 rounded-full bg-green-600 dark:text-black text-white text-base"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default SingleChat;
