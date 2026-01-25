import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../../services/api.js";

import { Avatar } from "primereact/avatar";
import { Skeleton } from "primereact/skeleton";

function AllChats() {
  const location = useLocation();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

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
      })
      .finally(() => setLoading(false));
  }, [location.state?.chat?.id]);

  return (
    <div className="p-4 h-full overflow-y-auto">
      <h2 className="text-lg font-bold mb-4 dark:text-success">Chats</h2>
      {loading ? (
        <div className="flex flex-col space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center p-2 border-b">
              <Skeleton
                shape="circle"
                size="40px"
                className="shrink-0 mr-3"
                style={{ backgroundColor: "#e2e8f0" }}
              />
              <Skeleton
                width="70%"
                height="1rem"
                style={{ backgroundColor: "#e2e8f0" }}
              />
            </div>
          ))}
        </div>
      ) : chats.length > 0 ? (
        chats.map((object, index) => {
          // For direct messages, display friend's username; for groups, display group name.
          const displayName = !object.chat.isGroup
            ? object.friend &&
              (object.friend.nickname
                ? object.friend.nickname
                : object.friend.username)
            : object.chat.name;

          return (
            // chat format: [{ chat, friend }, ...]
            <Link
              to="/chat"
              state={{ chat: object.chat, friend: object.friend }}
              key={`${object.chat.id}-${index}`}
              className="block flex items-center z-10 p-2 border-b dark:bg-neutral dark:text-secondary cursor-pointer transition-all duration-200 bg-gray-100 hover:bg-gray-200"
            >
              <Avatar
                image={
                  object.chat.isGroup
                    ? object.chat.avatar
                    : object.friend?.avatar
                }
                label={displayName[0].toUpperCase()}
                shape="circle"
                className="shrink-0 mr-3 overflow-hidden"
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: !(!object.chat.isGroup
                    ? object.friend?.avatar
                    : object.chat.avatar)
                    ? "#2196F3"
                    : "transparent",
                  color: "#ffffff",
                  fontSize: "1.2rem",
                }}
                imagestyle={{
                  objectFit: "cover",
                  width: "100%",
                  height: "100%",
                }}
              />
              <span className="truncate">{displayName}</span>
            </Link>
          );
        })
      ) : (
        <p>No chats available</p>
      )}
    </div>
  );
}

export default AllChats;
