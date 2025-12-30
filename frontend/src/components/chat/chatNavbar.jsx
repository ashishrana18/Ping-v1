import { useEffect, useState, useContext, useRef } from "react";
import api from "../../services/api.js";
import { FiEye, FiLock, FiCamera, FiMoreVertical, FiTag } from "react-icons/fi";
import { AuthContext } from "../../services/authContext.jsx";
import { ChangeAvatarModal } from "./changeAvatarModal.jsx";
import { ViewAvatarModal } from "./viewAvatarModal.jsx";

function ChatNavbar({ chat, friend }) {
  const { setUser } = useContext(AuthContext);
  // Local state for the current chat (for group chats)
  const [currentChat, setCurrentChat] = useState(chat);
  const [currentFriend, setCurrentFriend] = useState(friend);
  const [onlineStatus, setOnlineStatus] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showChangeAvatarModal, setShowChangeAvatarModal] = useState(false);
  const [showViewAvatarModal, setShowViewAvatarModal] = useState(false);
  const [showSecretChatModal, setShowSecretChatModal] = useState(false);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [newNickname, setNewNickname] = useState("");
  const menuRef = useRef(null);

  // Update local chat state when the prop changes
  useEffect(() => {
    setCurrentChat(chat);
  }, [chat]);

  // Update local friend state when the prop changes
  useEffect(() => {
    console.log("ChatNavbar: friend prop changed:", friend);
    console.log("ChatNavbar: Current currentFriend:", currentFriend);
    setCurrentFriend(friend);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friend]);

  useEffect(() => {
    async function fetchOnlineStatus() {
      try {
        const response = await api.get(`/user/online/${currentFriend?.id}`);
        setOnlineStatus(response.data);
      } catch (error) {
        console.error("Error fetching online status:", error);
      }
    }
    if (currentFriend && currentFriend.id) {
      fetchOnlineStatus();
      const intervalId = setInterval(fetchOnlineStatus, 10000);
      return () => clearInterval(intervalId);
    }
  }, [currentFriend]);

  // Use currentChat for groups; for one-on-one chats, use currentFriend
  const isGroup = currentChat?.isGroup;
  const displayName = isGroup
    ? currentChat?.name || "Unnamed Group"
    : (currentFriend &&
        (currentFriend.nickname
          ? currentFriend.nickname
          : currentFriend.username)) ||
      "Unnamed Chat";
  const profilePicture = isGroup
    ? currentChat?.avatar ||
      "https://png.pngtree.com/png-clipart/20190620/original/pngtree-vector-leader-of-group-icon-png-image_4022100.jpg"
    : (currentFriend && currentFriend.avatar) ||
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

  const handleOpenNicknameModal = () => {
    setNewNickname(currentFriend?.nickname || "");
    setShowNicknameModal(true);
    setDropdownOpen(false);
  };

  const handleUpdateNickname = async () => {
    try {
      const response = await api.post("/chat/nickname", {
        chatId: currentChat?.id,
        userId: currentFriend?.id,
        nickname: newNickname || null
      });
      
      if (response.data?.data?.chatMember) {
        // Update the local friend state with the new nickname
        setCurrentFriend({
          ...currentFriend,
          nickname: newNickname || null
        });
        setShowNicknameModal(false);
        setNewNickname("");
        
        // Dispatch event to notify AllChats to re-fetch
        window.dispatchEvent(new CustomEvent('nicknameUpdated'));
      }
    } catch (error) {
      console.error("Error updating nickname:", error);
      alert("Failed to update nickname");
    }
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
                <>
                  <button
                    onClick={handleOpenNicknameModal}
                    className="w-full flex items-center text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                    title="Add or change a nickname for this contact (only visible in this chat)"
                  >
                    <FiTag className="mr-2" size={20} />
                    <span>Change Nickname</span>
                  </button>
                  <button
                    onClick={handleStartSecretChat}
                    className="w-full flex items-center text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <FiLock className="mr-2" size={20} />
                    <span>Start Secret Chat</span>
                  </button>
                </>
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

      {/* Nickname Modal */}
      {showNicknameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:text-info backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-md max-w-sm w-full mx-4">
            <h2 className="text-xl font-bold mb-2 dark:text-white">Change Nickname</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              A nickname is only visible in this chat and helps you identify this contact easily.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                Current Username: <span className="font-bold">{currentFriend?.username}</span>
              </label>
              <input
                type="text"
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
                placeholder="Enter nickname (leave empty to remove)"
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Leave empty to show their username instead
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowNicknameModal(false);
                  setNewNickname("");
                }}
                className="px-4 py-2 border rounded hover:bg-gray-100 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateNickname}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatNavbar;
