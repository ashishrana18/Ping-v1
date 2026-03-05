import React, { useContext } from "react";
import { AuthContext } from "../../services/authContext.jsx";
import { useNavigate } from "react-router-dom";
import api from "../../services/api.js";

import { FiX } from "react-icons/fi";
import { FaArrowRight } from "react-icons/fa";
import AvatarComponent from "../utils/avatar.jsx";
import { useAppHaptics } from "../../utils/useAppHaptics.js";

const GroupMembersModal = ({ members, onClose }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { triggerClick, triggerError, triggerSelection } = useAppHaptics();

  const handleDirectChatClick = async (member) => {
    triggerSelection();
    onClose();
    const newChatId = [user.id, member.id].sort().join("");
    try {
      const response = await api.post("/chat/create", {
        chatId: newChatId,
        isGroup: false,
        members: [user.id, member.id],
      });
      navigate("/chat", {
        state: { chat: response.data.data, friend: member },
      });
    } catch (error) {
      console.error("Error creating direct chat:", error);
      triggerError();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-20 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-lg w-full max-w-sm max-h-[80vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            onClose();
            triggerClick();
          }}
          className="absolute top-4 right-4 p-2 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
          title="Close"
        >
          <FiX size={20} />
        </button>
        <h2 className="text-xl font-bold mb-4 dark:text-secondary">
          Group Members
        </h2>
        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.id} className="flex items-center space-x-3 w-full">
              <AvatarComponent
                profilePicture={member.avatar}
                displayName={member.username}
                size={48}
                avatarClasses={
                  "mr-2 shrink-0 text-lg font-medium overflow-hidden bg-gray-200 text-gray-900 dark:text-gray-200"
                }
                boringAvatarClasses={
                  "shrink-0 mr-2 overflow-hidden rounded-full border border-gray-200 dark:border-gray-700"
                }
              />
              <div className="flex items-center flex-1 min-w-0 justify-between">
                <div className="flex flex-col text-gray-800 dark:text-gray-200 font-medium min-w-0 pr-2">
                  <span className="truncate">{member.username}</span>
                  <span className="text-sm truncate text-gray-500 dark:text-gray-400">
                    {member.email}
                  </span>
                </div>
                <FaArrowRight
                  size={36}
                  className="ml-auto text-green-600 cursor-pointer p-2"
                  onClick={() => handleDirectChatClick(member)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { GroupMembersModal };
