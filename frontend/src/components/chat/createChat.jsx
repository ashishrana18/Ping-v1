// src/components/chat/ChatCreation.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api.js";

import AvatarComponent from "../utils/avatar.jsx";
import { useAppHaptics } from "../../utils/useAppHaptics.js";

function CreateChat({ currentUserId }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ groups: [], users: [] });
  const [chatType, setChatType] = useState("direct"); // "direct" or "group"
  const [groupMembers, setGroupMembers] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const navigate = useNavigate();
  const { triggerClick, triggerError, triggerSelection } = useAppHaptics();

  // Fetch search results when the user types
  useEffect(() => {
    if (searchQuery.trim() !== "") {
      api
        .get(`/chat/search?query=${searchQuery}`)
        .then(({ data }) => setSearchResults(data.data))
        .catch((error) => {
          console.error("Error searching:", error);
          triggerError();
          setSearchResults({ groups: [], users: [] });
        });
    } else {
      setSearchResults({ groups: [], users: [] });
    }
  }, [searchQuery]);

  // Toggle between direct and group chat modes
  const handleToggle = () => {
    setChatType((prev) => (prev === "direct" ? "group" : "direct"));
    setGroupMembers([]);
    setSelectedFriend(null);
  };

  // For group mode, add a selected user to group members
  const addGroupMember = (user) => {
    if (!groupMembers.some((member) => member.id === user.id)) {
      setGroupMembers([...groupMembers, user]);
    }
  };

  const removeGroupMember = (user) => {
    setGroupMembers(groupMembers.filter((member) => member.id !== user.id));
  };

  // Handle click on a direct chat result
  const handleDirectChatClick = async (friend) => {
    const newChatId = [currentUserId, friend.id].sort().join("");
    triggerClick();
    try {
      const response = await api.post("/chat/create", {
        chatId: newChatId,
        isGroup: false,
        members: [currentUserId, friend.id],
      });
      navigate("/chat", { state: { chat: response.data.data, friend } });
    } catch (error) {
      console.error("Error creating direct chat:", error);
      triggerError();
    }
  };

  // Handle click on a group chat result
  const handleGroupChatClick = async (group) => {
    // Assume the group object already has an id if it exists.
    // Simply navigate to the chat page.
    if (group && group.id) {
      console.log(group.name);
      triggerClick();
      navigate("/chat", { state: { chat: group } });
    } else {
      console.error("Invalid group data");
      triggerError();
    }
  };

  // For group chat creation via button
  const handleCreateGroupChat = async () => {
    if (groupMembers.length === 0) {
      console.error("No group members selected");
      triggerError();
      return;
    }
    const groupName = prompt("Enter group name:");
    try {
      const response = await api.post("/chat/create", {
        isGroup: true,
        name: groupName,
        members: groupMembers.map((user) => user.id).concat(currentUserId),
      });
      console.log("Group chat response:", response.data);
      navigate("/chat", { state: { chat: response.data.data } });
    } catch (error) {
      console.error("Error creating group chat:", error);
      triggerError();
    }
  };

  return (
    <div className="p-4 border rounded shadow dark:text-white">
      <input
        type="text"
        placeholder="Search for a friend or group"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setSelectedFriend(null);
        }}
        className="mt-2 p-2 border rounded w-full dark:bg-slate-950"
      />

      {chatType === "direct" && (
        <div className="mt-4">
          <h3 className="font-semibold">Matching Users:</h3>
          {searchResults.users.length > 0 ? (
            searchResults.users.map((user) => (
              <div
                key={user.id}
                onClick={() => handleDirectChatClick(user)}
                className="flex items-center p-2 border-b cursor-pointer hover:bg-blue-100 hover:rounded-md dark:hover:bg-gray-600 transition-colors"
              >
                <AvatarComponent
                  profilePicture={user.avatar}
                  displayName={user.username}
                  size="48px"
                  avatarClasses="shrink-0 mr-1 overflow-hidden"
                  boringAvatarClasses="shrink-0 mr-1 overflow-hidden rounded-full"
                />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-subtext">
                    {user.username}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-subtext">
                    {user.email}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No users found.</p>
          )}
        </div>
      )}

      {chatType === "group" && (
        <div className="mt-4">
          <h3 className="font-semibold">Matching Groups:</h3>
          {searchResults.groups.length > 0 ? (
            searchResults.groups.map((group) => (
              <div
                key={group.id}
                onClick={() => handleGroupChatClick(group)}
                className="flex items-center p-1 cursor-pointer hover:bg-blue-100 hover:rounded-md dark:hover:bg-gray-700 dark:text-subtext"
              >
                <AvatarComponent
                  profilePicture={group.avatar}
                  displayName={group.name}
                  size="48px"
                  avatarClasses="shrink-0 mr-1 overflow-hidden"
                  boringAvatarClasses="shrink-0 mr-1 overflow-hidden rounded-full"
                />
                {group.name}
              </div>
            ))
          ) : (
            <p>No groups found.</p>
          )}
          <h3 className="mt-4 font-semibold">Select Members:</h3>
          {searchResults.users.length > 0 ? (
            searchResults.users.map((user) => (
              <div
                key={user.id}
                onClick={() => {
                  triggerSelection();
                  addGroupMember(user);
                }}
                className="flex items-center p-2 border-b cursor-pointer hover:bg-blue-100 hover:rounded-md dark:hover:bg-gray-600 transition-colors"
              >
                <AvatarComponent
                  profilePicture={user.avatar}
                  displayName={user.username}
                  size="48px"
                  avatarClasses="shrink-0 mr-1 overflow-hidden rounded-full"
                  boringAvatarClasses="shrink-0 mr-1 overflow-hidden rounded-full"
                />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-subtext">
                    {user.username}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-subtext">
                    {user.email}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No users found for selection.</p>
          )}
          {groupMembers.length > 0 && (
            <div className="mt-2">
              <h4 className="font-semibold">Selected Members:</h4>
              <ul>
                {groupMembers.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => {
                      triggerSelection();
                      removeGroupMember(member);
                    }}
                    className="flex items-center p-2 border-b cursor-pointer hover:bg-blue-100 hover:rounded-md dark:hover:bg-gray-600 transition-colors"
                  >
                    <AvatarComponent
                      profilePicture={member.avatar}
                      displayName={member.username}
                      size="48px"
                      avatarClasses="shrink-0 mr-1 overflow-hidden rounded-full"
                      boringAvatarClasses="shrink-0 mr-1 overflow-hidden rounded-full"
                    />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-subtext">
                        {member.username}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-subtext">
                        {member.email}
                      </div>
                    </div>
                  </div>
                ))}
              </ul>
            </div>
          )}
          <button
            onClick={() => {
              triggerClick();
              handleCreateGroupChat();
            }}
            className="mt-4 p-2 border rounded-md bg-blue-500 text-white"
          >
            Create Group Chat
          </button>
        </div>
      )}

      <button
        onClick={() => {
          triggerClick();
          handleToggle();
        }}
        className="mt-2 p-2 border rounded-md bg-gray-200 dark:bg-slate-950"
      >
        Switch to {chatType === "direct" ? "Group Chat" : "Direct Chat"}
      </button>
    </div>
  );
}

export default CreateChat;
