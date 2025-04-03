import React, { useEffect, useState, useContext, useRef } from "react";
import api from "../../services/api.js";
import { FiEye, FiLock, FiCamera, FiMoreVertical } from "react-icons/fi";
import { AuthContext } from "../../services/authcontext.jsx";
import { ChangeAvatarModal } from "./ChangeAvatarModal.jsx";
import { ViewAvatarModal } from "./ViewAvatarModal.jsx";

function ChatNavbar({ chat, friend }) {
  const { setUser } = useContext(AuthContext);
  // Local state for the current chat (for group chats)
  const [currentChat, setCurrentChat] = useState(chat);
  const [onlineStatus, setOnlineStatus] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showChangeAvatarModal, setShowChangeAvatarModal] = useState(false);
  const [showViewAvatarModal, setShowViewAvatarModal] = useState(false);
  const [showSecretChatModal, setShowSecretChatModal] = useState(false);
  const menuRef = useRef(null);

  // Update local chat state when the prop changes
  useEffect(() => {
    setCurrentChat(chat);
  }, [chat]);

  useEffect(() => {
    async function fetchOnlineStatus() {
      try {
        const response = await api.get(`/user/online/${friend.id}`);
        setOnlineStatus(response.data);
      } catch (error) {
        console.error("Error fetching online status:", error);
      }
    }
    if (friend && friend.id) {
      fetchOnlineStatus();
      const intervalId = setInterval(fetchOnlineStatus, 10000);
      return () => clearInterval(intervalId);
    }
  }, [friend]);

  // Use currentChat for groups; for one-on-one chats, use friend
  const isGroup = currentChat?.isGroup;
  const displayName = isGroup
    ? currentChat?.name || "Unnamed Group"
    : (friend && (friend.nickname || friend.username)) || "Unnamed Chat";
  const profilePicture = isGroup
    ? currentChat?.avatar ||
      "https://png.pngtree.com/png-clipart/20190620/original/pngtree-vector-leader-of-group-icon-png-image_4022100.jpg"
    : (friend && friend.avatar) ||
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTItQjUALs6-IkOWnOAMl8i3zrGqQWsaL5aVQ&s";

  const handleStartSecretChat = () => {
    if (onlineStatus) {
      setShowSecretChatModal(true);
    } else {
      alert(
        "Friend is offline. Secret chat can only be started when the friend is online."
      );
    }
    setDropdownOpen(false);
  };

  const handleOpenChangeAvatar = () => {
    setShowChangeAvatarModal(true);
    setDropdownOpen(false);
  };

  // Close dropdown if clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="top-0 z-10 flex items-center justify-between p-4 border-b bg-white text-gray-900 dark:bg-[rgb(0,7,28)] dark:text-white">
        <div className="flex items-center">
          <img
            src={profilePicture}
            alt={displayName}
            className="w-10 h-10 rounded-full mr-4"
          />
          <div className="flex flex-col">
            <h2 className="text-lg font-bold">{displayName}</h2>
            {!isGroup && onlineStatus !== null && (
              <p
                className={`text-sm ${
                  onlineStatus ? "text-green-500" : "text-gray-500"
                }`}
              >
                {onlineStatus ? "Online" : "Offline"}
              </p>
            )}
          </div>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Options"
          >
            <FiMoreVertical size={24} />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded shadow-lg z-50">
              <button
                onClick={() => {
                  setShowViewAvatarModal(true);
                  setDropdownOpen(false);
                }}
                className="w-full flex items-center text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <FiEye className="mr-2" size={20} />
                <span>View Avatar</span>
              </button>
              {isGroup ? (
                <button
                  onClick={handleOpenChangeAvatar}
                  className="w-full flex items-center text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <FiCamera className="mr-2" size={20} />
                  <span>Change Avatar</span>
                </button>
              ) : (
                <button
                  onClick={handleStartSecretChat}
                  className="w-full flex items-center text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <FiLock className="mr-2" size={20} />
                  <span>Start Secret Chat</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* View Avatar Modal */}
      {showViewAvatarModal && (
        <ViewAvatarModal
          currentAvatar={profilePicture}
          onClose={() => setShowViewAvatarModal(false)}
          displayName={displayName}
        />
      )}

      {/* Change Avatar Modal */}
      {showChangeAvatarModal && (
        <ChangeAvatarModal
          currentAvatar={profilePicture}
          onClose={() => setShowChangeAvatarModal(false)}
          onUpload={(responseData) => {
            if (isGroup && responseData.updatedChat) {
              setCurrentChat(responseData.updatedChat);
            } else if (!isGroup && responseData.updatedUser) {
              setUser(responseData.updatedUser);
            }
            setShowChangeAvatarModal(false);
          }}
          chatId={isGroup ? currentChat.id : null}
        />
      )}

      {/* Secret Chat Modal */}
      {showSecretChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:text-info backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-md max-w-sm">
            <h2 className="text-xl font-bold mb-4">
              Secret Chat Under Construction
            </h2>
            <p className="mb-4">
              This feature is currently under construction.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowSecretChatModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 dark:text-black"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatNavbar;
