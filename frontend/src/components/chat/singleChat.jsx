// src/components/chat/SingleChat.jsx
import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  useDebugValue
} from "react";
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
  const [member, setMember] = useState(null);
  const [isFriendTyping, setIsFriendTyping] = useState(false);
  const [typingChatId, setTypingChatId] = useState(null); // this is to check, in group chats, is current chat same as in which user is typing

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
      setMessages((prev) => [...prev, message]);
    };
    socket.on("receiveMessage", messageHandler);
    return () => {
      socket.off("receiveMessage", messageHandler);
    };
  }, []);

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
      setTypingChatId(chatId);
      if (userId !== currentUserId) setIsFriendTyping(true);
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
  }, [currentUserId]);

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
            isOwnMessage={msg.senderId === currentUserId}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box fixed at bottom */}
      <div className="flex-shrink-0 p-2 bg-gray-200 dark:bg-panel">
        {chat.id == typingChatId && isFriendTyping && (
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
