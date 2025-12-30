// src/pages/ChatPage.jsx
import { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../services/authContext.jsx";
import api from "../services/api.js";
import Header from "../components/chat/header.jsx";
import AllChats from "../components/chat/allChats.jsx";
import SingleChat from "../components/chat/singleChat.jsx";
import ChatNavbar from "../components/chat/chatNavbar.jsx";

function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useContext(AuthContext);
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeChat, setActiveChat] = useState(location.state?.chat);
  const [friend, setFriend] = useState(location.state?.friend);

  // Update state when location.state changes (important for same-route navigation)
  useEffect(() => {
    console.log("ChatPage: location.state changed", location.state);
    console.log("ChatPage: location.state?.friend?.nickname", location.state?.friend?.nickname);
    if (location.state) {
      setActiveChat(location.state.chat);
      setFriend(location.state.friend);
    } else {
      // If no location.state (e.g., after refresh), reset state
      setActiveChat(null);
      setFriend(null);
    }
  }, [location.state, location.key]); // location.key ensures updates on same route

  // Listen for nickname updates to refresh the current friend data
  useEffect(() => {
    const handleNicknameUpdate = () => {
      console.log("nicknameUpdated event received in ChatPage");
      // Re-fetch the chat to get updated data
      if (activeChat && friend) {
        api
          .get("/user/allChats")
          .then((response) => {
            const data = response.data.data;
            const updatedFriend = data.find(
              (item) => item.chat.id === activeChat.id
            )?.friend;
            
            console.log("Updated friend from backend:", updatedFriend);
            console.log("Current friend before update:", friend);
            
            if (updatedFriend) {
              setFriend(updatedFriend);
            }
          })
          .catch((error) => {
            console.error("Error fetching updated chats:", error);
          });
      }
    };
    
    window.addEventListener('nicknameUpdated', handleNicknameUpdate);
    
    return () => {
      window.removeEventListener('nicknameUpdated', handleNicknameUpdate);
    };
  }, [activeChat, friend]);

  // Debug: Log friend changes
  useEffect(() => {
    console.log("Friend prop changed in ChatPage:", friend);
  }, [friend]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  // On mount, if there's no state, fetch the initial chat data
  useEffect(() => {
    if (!location.state && user) {
      // If there's no location state (like after refresh), we can't fetch the exact chat
      // but we'll let AllChats handle the initial load
      // The user will need to click a chat to load it
    }
  }, []);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-[rgb(0,17,28)] text-gray-900 dark:text-dark-text">
      <Header onMenuClick={() => setShowSidebar((v) => !v)} />
      {/* Main content area */}
      <div className="flex flex-grow overflow-hidden">
        {/* Sidebar for AllChats */}
        <aside
          className={`
            ${showSidebar ? "block" : "hidden"} 
            md:block
            w-full md:w-64 lg:w-80 h-full fixed md:relative z-50
          `}
          onClick={() => {
            setShowSidebar(false);
          }}
        >
          <AllChats />
        </aside>

        {/* Chat area */}
        {!showSidebar && (
          <main className="flex flex-col flex-grow h-full overflow-hidden">
            {activeChat ? (
              <>
                {/* Chat Navbar Container */}
                <div className="flex-none">
                  <ChatNavbar chat={activeChat} friend={friend} />
                </div>
                {/* Single Chat Container with scroll */}
                <div className="flex-grow overflow-y-auto">
                  <SingleChat chat={activeChat} friend={friend} />
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
        )}
      </div>
    </div>
  );
}

export default ChatPage;
