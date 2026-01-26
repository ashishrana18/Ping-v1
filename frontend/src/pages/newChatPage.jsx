// src/pages/NewChatPage.jsx
import React, { useContext } from "react";
import CreateChat from "../components/chat/createChat.jsx";
import { AuthContext } from "../services/authContext.jsx";
import Header from "../components/chat/header.jsx";

function NewChatPage() {
  const { user } = useContext(AuthContext);

  return (
    <>
      <Header />
      <div className="min-h-screen p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <h1 className="text-2xl font-bold mb-4">Start a New Chat</h1>
        {user ? (
          <CreateChat currentUserId={user.id} />
        ) : (
          <p>Please log in to start a chat.</p>
        )}
      </div>
    </>
  );
}

export default NewChatPage;
