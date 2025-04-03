// src/components/chat/ChatCreation.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api.js";

function ChatCreation({ currentUserId }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ groups: [], users: [] });
  const [chatType, setChatType] = useState("direct"); // "direct" or "group"
  const [groupMembers, setGroupMembers] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const navigate = useNavigate();

  // Fetch search results when the user types
  useEffect(() => {
    if (searchQuery.trim() !== "") {
      api
        .get(`/chat/search?query=${searchQuery}`)
        .then(({ data }) => setSearchResults(data.data))
        .catch((error) => {
          console.error("Error searching:", error);
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

  // Handle click on a direct chat result
  const handleDirectChatClick = async (friend) => {
    const newChatId = [currentUserId, friend.id].sort().join("");
    try {
      const response = await api.post("/chat/create", {
        chatId: newChatId,
        isGroup: false,
        members: [currentUserId, friend.id]
      });
      navigate("/chat", { state: { chat: response.data.data, friend } });
    } catch (error) {
      console.error("Error creating direct chat:", error);
    }
  };

  // Handle click on a group chat result
  const handleGroupChatClick = async (group) => {
    // Assume the group object already has an id if it exists.
    // Simply navigate to the chat page.
    if (group && group.id) {
      console.log(group.name);
      navigate("/chat", { state: { chat: group } });
    } else {
      console.error("Invalid group data");
    }
  };

  // For group chat creation via button
  const handleCreateGroupChat = async () => {
    if (groupMembers.length === 0) {
      console.error("No group members selected");
      return;
    }
    const groupName = prompt("Enter group name:");
    try {
      const response = await api.post("/chat/create", {
        isGroup: true,
        name: groupName,
        members: groupMembers.map((user) => user.id).concat(currentUserId)
      });
      console.log("Group chat response:", response.data);
      navigate("/chat", { state: { chat: response.data.data } });
    } catch (error) {
      console.error("Error creating group chat:", error);
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
                className="flex items-center p-2 border-b cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-600 transition-colors"
              >
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-10 h-10 rounded-full mr-4"
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
                className="p-2 border-b cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-700 dark:text-subtext"
              >
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
                onClick={() => addGroupMember(user)}
                className="p-2 border-b cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-subtext"
              >
                {user.username} ({user.email})
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
                  <li key={member.id}>{member.username}</li>
                ))}
              </ul>
            </div>
          )}
          <button
            onClick={handleCreateGroupChat}
            className="mt-4 p-2 border rounded bg-blue-500 text-white"
          >
            Create Group Chat
          </button>
        </div>
      )}

      <button
        onClick={handleToggle}
        className="mt-2 p-2 border rounded bg-gray-200 dark:bg-slate-950"
      >
        Switch to {chatType === "direct" ? "Group Chat" : "Direct Chat"}
      </button>
    </div>
  );
}

export default ChatCreation;
