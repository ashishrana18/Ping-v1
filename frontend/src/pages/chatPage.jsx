// src/pages/ChatPage.jsx
import { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../services/authContext.jsx";
import Header from "../components/chat/header.jsx";
import AllChats from "../components/chat/allChats.jsx";
import SingleChat from "../components/chat/singleChat.jsx";
import ChatNavbar from "../components/chat/chatNavbar.jsx";
import api from "../services/api.js";

import { FiPlus } from "react-icons/fi";

function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useContext(AuthContext);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const [activeChat, setActiveChat] = useState(location.state?.chat);
  const friend = location.state?.friend;

  // triggered on first mounting and switching btw diff chats
  useEffect(() => {
    if (location.state?.chat) {
      const chatFromState = location.state.chat;
      setActiveChat(chatFromState);

      api
        .get(`/chat/isLocked/${chatFromState.id}`)
        .then((res) => {
          const freshLocked = res.data.data;
          if (freshLocked !== chatFromState.isLocked) {
            // to update the stale data
            setActiveChat((prev) => ({ ...prev, isLocked: freshLocked }));
          }
        })
        .catch((err) => console.error("Failed to refresh lock status", err));
    } else {
      setActiveChat(null);
    }
  }, [location.state?.chat]);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-[rgb(0,17,28)] text-gray-900 dark:text-dark-text">
      <Header onMenuClick={() => setShowSidebar((v) => !v)} />
      {/* Main content area */}
      <div className="flex flex-grow overflow-hidden relative">
        {/* Sidebar for AllChats */}
        <aside
          className={`
            ${showSidebar ? "block" : "hidden"} 
            md:block
            w-full md:w-64 lg:w-80 h-full absolute md:relative z-20
            bg-white dark:bg-gray-900 border-r dark:border-gray-700
          `}
          onClick={() => {
            setShowSidebar(false);
          }}
        >
          <AllChats />
        </aside>

        {/* Chat area */}
        {!showSidebar && (
          <main className="flex flex-col flex-grow min-h-0 overflow-hidden">
            {activeChat ? (
              <>
                {/* Chat Navbar Container */}
                <div className="flex-none">
                  <ChatNavbar
                    chat={activeChat}
                    friend={friend}
                    onUpdateChat={setActiveChat} //will update the activeChat, from returned lockedChat/unlockedChat apis
                  />
                </div>
                {/* Single Chat Container - scrolling handled inside SingleChat */}
                <div className="flex-grow min-h-0">
                  <SingleChat
                    chat={activeChat}
                    friend={friend}
                    onUpdateChat={setActiveChat} //will update the activeChat, from returned lockedChat/unlockedChat apis
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-grow items-center justify-center flex-col space-y-4 dark:text-primary">
                <p>Select or create a chat to view messages.</p>
                <button
                  onClick={() => navigate("/new-chat")}
                  className="p-4 rounded-full bg-blue-500 text-white flex items-center space-x-2 hover:bg-blue-600 dark:bg-info dark:hover:bg-blue-400"
                >
                  <FiPlus className="w-6 h-6" />
                  <span>Create New Chat</span>
                </button>
              </div>
            )}
          </main>
        )}
      </div>
    </div>
  );
}

export default ChatPage;
