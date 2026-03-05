import React, { useEffect, useState, useContext, useRef } from "react";
import api from "../../services/api.js";
import { AuthContext } from "../../services/authContext.jsx";
import { ChangeAvatarModal } from "../modals/changeAvatarModal.jsx";
import { ViewAvatarModal } from "../modals/viewAvatarModal.jsx";
import { LockChatModal } from "../modals/lockChatModal.jsx";
import GroupMembers from "./groupMembers.jsx";
import AvatarComponent from "../utils/avatar.jsx";

import { Skeleton } from "primereact/skeleton";
import {
  FiEye,
  FiLock,
  FiCamera,
  FiMoreVertical,
  FiUnlock,
} from "react-icons/fi";
import { useAppHaptics } from "../../utils/useAppHaptics.js";

function ChatNavbar({ chat, friend, onUpdateChat }) {
  const { setUser } = useContext(AuthContext);
  // Local state for the current chat (for group chats)
  const [currentChat, setCurrentChat] = useState(chat);
  const [onlineStatus, setOnlineStatus] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showChangeAvatarModal, setShowChangeAvatarModal] = useState(false);
  const [showViewAvatarModal, setShowViewAvatarModal] = useState(false);
  const [showSecretChatModal, setShowSecretChatModal] = useState(false);
  const [showLockChatModal, setShowLockChatModal] = useState(false);
  const menuRef = useRef(null);

  const { triggerClick, triggerError } = useAppHaptics();

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
        triggerError();
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
    ? currentChat?.name
    : friend && (friend.nickname || friend.username);
  const profilePicture = isGroup
    ? currentChat?.avatar
    : friend && friend.avatar;

  const handleStartSecretChat = () => {
    if (onlineStatus) {
      setShowSecretChatModal(true);
    } else {
      alert(
        "Friend is offline. Secret chat can only be started when the friend is online.",
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
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-white text-gray-900 dark:bg-[rgb(0,7,28)] dark:text-white">
        <div className="flex items-center">
          <AvatarComponent
            profilePicture={profilePicture}
            displayName={displayName}
            size="48px"
            avatarClasses="shrink-0 mr-1 overflow-hidden shadow-sm"
            boringAvatarClasses="shrink-0 mr-1 overflow-hidden rounded-full"
          />
          <div className="flex flex-col ml-2">
            <h2 className="text-lg ml-[5px] font-bold">{displayName}</h2>
            {!isGroup ? (
              onlineStatus === null ? (
                <Skeleton shape="rectangle" width={54} height={20} />
              ) : (
                <p
                  className={`text-sm ml-[5px] ${
                    onlineStatus ? "text-green-500" : "text-gray-500"
                  }`}
                >
                  {onlineStatus ? "Online" : "Offline"}
                </p>
              )
            ) : (
              <GroupMembers chat={chat} />
            )}
          </div>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => {
              setDropdownOpen((prev) => !prev);
              triggerClick();
            }}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Options"
          >
            <FiMoreVertical size={24} />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded shadow-lg z-20">
              <button
                onClick={() => {
                  setShowViewAvatarModal(true);
                  setDropdownOpen(false);
                  triggerClick();
                }}
                className="w-full flex items-center text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <FiEye className="mr-2" size={20} />
                <span>View Avatar</span>
              </button>
              {isGroup ? (
                <button
                  onClick={() => {
                    handleOpenChangeAvatar();
                    triggerClick();
                  }}
                  className="w-full flex items-center text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <FiCamera className="mr-2" size={20} />
                  <span>Change Avatar</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleStartSecretChat();
                    triggerClick();
                  }}
                  className="w-full flex items-center text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <FiLock className="mr-2" size={20} />
                  <span>Start Secret Chat</span>
                </button>
              )}
              <button
                onClick={() => {
                  setShowLockChatModal(true);
                  setDropdownOpen(false);
                  triggerClick();
                }}
                className="w-full flex items-center text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-red-500"
              >
                {currentChat?.isLocked ? (
                  <FiUnlock
                    className="mr-2"
                    size={20}
                    onClick={() => triggerClick()}
                  />
                ) : (
                  <FiLock
                    className="mr-2"
                    size={20}
                    onClick={() => triggerClick()}
                  />
                )}
                <span>
                  {currentChat?.isLocked ? "Unlock Chat" : "Lock Chat"}
                </span>
              </button>
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
          displayName={displayName}
        />
      )}

      {/* Secret Chat Modal */}
      {showSecretChatModal && (
        <SecretChatModal
          isOpen={showSecretChatModal}
          onClose={() => setShowSecretChatModal(false)}
        />
      )}

      {/* Lock/Unlock Chat Modal */}
      {showLockChatModal && (
        <LockChatModal
          isOpen={showLockChatModal}
          onClose={() => setShowLockChatModal(false)}
          chat={currentChat}
          onUpdate={(updatedChat) => {
            setCurrentChat(updatedChat);
            if (onUpdateChat) onUpdateChat(updatedChat);
          }}
        />
      )}
    </>
  );
}

export default ChatNavbar;
