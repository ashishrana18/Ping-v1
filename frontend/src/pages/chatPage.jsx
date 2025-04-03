// src/pages/ChatPage.jsx
import { useContext, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { AuthContext } from "../services/authContext.jsx";
import Header from "../components/chat/header.jsx";
import AllChats from "../components/chat/AllChats.jsx";
import SingleChat from "../components/chat/SingleChat.jsx";
import ChatNavbar from "../components/chat/ChatNavbar.jsx";

function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useContext(AuthContext);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const activeChat = location.state?.chat;
  const friend = location.state?.friend;

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-[rgb(0,17,28)] text-gray-900 dark:text-dark-text">
      <Header />
      {/* Main content area */}
      <div className="flex flex-grow overflow-hidden">
        {/* Sidebar for AllChats */}
        <aside className="w-[300px] flex-shrink-0 border-r overflow-y-auto">
          <AllChats />
        </aside>

        {/* Chat area */}
        <main className="flex flex-col flex-grow h-full overflow-hidden">
          {activeChat ? (
            <>
              {/* Chat Navbar Container */}
              <div className="flex-none">
                <ChatNavbar chat={activeChat} friend={friend} />
              </div>
              {/* Single Chat Container with scroll */}
              <div className="flex-grow overflow-y-auto">
                <SingleChat chat={activeChat} />
              </div>
            </>
          ) : (
            <div className="flex flex-grow items-center justify-center flex-col space-y-4 dark:text-primary">
              <p>Select or create a chat to view messages.</p>
              <button
                onClick={() => navigate("/new-chat")}
                className="p-4 rounded-full bg-blue-500 text-white flex items-center space-x-2 hover:bg-blue-600 dark:bg-info dark:hover:bg-blue-400"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 5v14m-7-7h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Create New Chat</span>
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default ChatPage;
