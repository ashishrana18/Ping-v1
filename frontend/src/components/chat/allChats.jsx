import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAppHaptics } from "../../utils/useAppHaptics.js";
import api from "../../services/api.js";

import AvatarComponent from "../utils/avatar.jsx";
import { Skeleton } from "primereact/skeleton";

function AllChats() {
  const location = useLocation();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { triggerClick, triggerError } = useAppHaptics();

  useEffect(() => {
    api
      .get("/user/allChats")
      .then((response) => {
        console.log("All chats raw response:", response.data);
        const data = response.data.data; // Expected format: [{ chat, friend }, ...]

        // Use reduce to deduplicate chats based on chat.id
        const uniqueChats = data.reduce((acc, item) => {
          if (item.chat && item.chat.id) {
            // If the chat isn't already in the accumulator, add it.
            if (!acc.some((i) => i.chat.id === item.chat.id)) {
              acc.push(item);
            }
          }
          return acc;
        }, []);
        setChats(uniqueChats);
      })
      .catch((error) => {
        console.error("Error fetching chats:", error);
        triggerError();
      })
      .finally(() => setLoading(false));
  }, [location.state?.chat?.id]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r dark:border-gray-800">
      <div className="p-4 pb-2">
        <h2 className="text-2xl font-bold dark:text-white tracking-tight">
          Chats
        </h2>
      </div>
      <div className="flex-grow overflow-y-auto px-2 py-2 space-y-1">
        {loading ? (
          <div className="flex flex-col space-y-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center p-3 rounded-2xl bg-gray-50/50 dark:bg-gray-800/10"
              >
                <Skeleton
                  shape="circle"
                  size="48px"
                  className="shrink-0 mr-3"
                />
                <div className="flex flex-col gap-2 w-full">
                  <Skeleton width="40%" height="1.25rem" borderRadius="8px" />
                  <Skeleton width="60%" height="1rem" borderRadius="8px" />
                </div>
              </div>
            ))}
          </div>
        ) : chats.length > 0 ? (
          chats.map((object, index) => {
            const avatar = object.chat.isGroup
              ? object.chat.avatar
              : object.friend?.avatar || null;
            // For direct messages, display friend's username; for groups, display group name.
            const displayName =
              (!object.chat.isGroup
                ? object.friend?.nickname || object.friend?.username
                : object.chat.name) || "Unknown";

            return (
              // chat format: [{ chat, friend }, ...]
              <Link
                to="/chat"
                state={{ chat: object.chat, friend: object.friend }}
                key={`${object.chat.id}-${index}`}
                onClick={() => triggerClick()}
                className={`group flex items-center p-3 rounded-2xl transition-all duration-300 relative
                ${
                  location.state?.chat?.id === object.chat.id
                    ? "bg-blue-50 dark:bg-blue-500/10"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800/50"
                }
              `}
              >
                {/* Active Indicator Bar */}
                {location.state?.chat?.id === object.chat.id && (
                  <div className="absolute left-0 w-1 h-8 bg-blue-500 rounded-r-full" />
                )}

                <AvatarComponent
                  profilePicture={avatar}
                  displayName={displayName}
                  size="48px"
                  avatarClasses="shrink-0 mr-3 shadow-sm"
                  boringAvatarClasses="shrink-0 mr-3 overflow-hidden rounded-full shadow-sm"
                />
                <div className="flex flex-col min-w-0">
                  <span
                    className={`truncate font-bold text-base transition-colors duration-200
                  ${
                    location.state?.chat?.id === object.chat.id
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-900 dark:text-gray-100 group-hover:text-blue-500"
                  }
                `}
                  >
                    {displayName}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {object.chat.isGroup ? "Group Chat" : "Direct Message"}
                  </span>
                </div>
              </Link>
            );
          })
        ) : (
          <p>No chats available</p>
        )}
      </div>
    </div>
  );
}

export default AllChats;
