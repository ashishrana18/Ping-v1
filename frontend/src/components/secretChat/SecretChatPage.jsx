// src/pages/SecretChatPage.jsx
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SecretChatHeader from "./secretChatHeader.jsx";
import SecretChatMessages from "./SecretChatMessages.jsx";
import SecretChatInput from "./SecretChatInput.jsx";
import api from "../../services/api.js";
import socket from "../../services/socket.js";
import { AuthContext } from "../../services/authcontext.jsx";

function SecretChatPage({ secretChatId, recipient, ...props }) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);

  // Fetch secret messages once on mount (messages are also updated via socket)
  useEffect(() => {
    async function fetchMessages() {
      try {
        const response = await api.get(`/secret/${secretChatId}`);
        setMessages(response.data.data || []);
      } catch (error) {
        console.error("Error fetching secret messages:", error);
      }
    }
    if (secretChatId) {
      fetchMessages();
    }
  }, [secretChatId]);

  // Setup Socket.IO listener for secret messages
  useEffect(() => {
    const messageHandler = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    socket.on("receiveSecretMessage", messageHandler);
    return () => {
      socket.off("receiveSecretMessage", messageHandler);
    };
  }, []);

  useEffect(() => {
    if (secretChatId && user?.id) {
      socket.emit("joinRoom", { chatId: secretChatId, userId: user?.id });
    }
  }, [secretChatId, user?.id]);

  //   Long Polling for cleanup: call the cleanup endpoint every 10 seconds.
  useEffect(() => {
    if (!secretChatId) return;
    const intervalId = setInterval(async () => {
      try {
        const response = await api.delete(`/secret/${secretChatId}`);
        if (!response.data.data || response.data.data.length === 0) {
          navigate("/chat");
        }
      } catch (err) {
        console.error("Error cleaning up secret messages:", err);
      }
    }, 10000);
    return () => clearInterval(intervalId);
  }, [secretChatId, navigate]);

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <SecretChatHeader recipient={recipient} secretChatId={secretChatId} />
      <SecretChatMessages messages={messages} />
      <SecretChatInput secretChatId={secretChatId} setMessages={setMessages} />
    </div>
  );
}

export default SecretChatPage;
