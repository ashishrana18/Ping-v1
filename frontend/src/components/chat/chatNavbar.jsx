/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import api from "../../services/api.js";

function ChatNavbar({ chat, friend }) {
  const [onlineStatus, setOnlineStatus] = useState(null);
  const [showModal, setShowModal] = useState(false);

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

  const isGroup = chat.isGroup;
  const displayName = isGroup
    ? chat.name || "Unnamed Group"
    : (friend && (friend.nickname || friend.username)) || "Unnamed Chat";
  const profilePicture = isGroup
    ? chat.avatar ||
      "https://png.pngtree.com/png-clipart/20190620/original/pngtree-vector-leader-of-group-icon-png-image_4022100.jpg"
    : (friend && friend.avatar) ||
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTItQjUALs6-IkOWnOAMl8i3zrGqQWsaL5aVQ&s";

  const handleOnClick = () => {
    if (onlineStatus) {
      setShowModal(true);
    } else {
      alert(
        "Friend is offline. Secret chat can only be started when the friend is online."
      );
    }
  };

  return (
    <>
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-white dark:bg-gray-800">
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
        <div className="relative">
          <button
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={handleOnClick}
          >
            {/* Using a refined vertical three-dots icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              className="w-6 h-6"
              viewBox="0 0 24 24"
            >
              <path d="M12 7a2 2 0 110-4 2 2 0 010 4zm0 2a2 2 0 100 4 2 2 0 000-4zm0 6a2 2 0 110 4 2 2 0 010-4z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-md max-w-sm">
            <h2 className="text-xl font-bold mb-4">
              Secret Chat Under Construction
            </h2>
            <p className="mb-4">
              This feature is currently under construction.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 flex bg-gray-300 rounded hover:bg-gray-400"
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
