import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api.js";

function AllChats() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChatId, setActiveChatId] = useState(null);

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
  }, []);

  return (
    <div className="p-4 border-r h-full overflow-y-auto">
      <h2 className="text-lg font-bold mb-4 dark:text-success">Chats</h2>
      {loading ? (
        <p className="dark:text-success">Loading chats...</p>
      ) : chats.length > 0 ? (
        chats.map((object, index) => {
          // For direct messages, display friend's username; for groups, display group name.
          const displayName = !object.chat.isGroup
            ? (object.friend &&
                (object.friend.nickname
                  ? object.friend.nickname
                  : object.friend.username)) ||
              "Unnamed Chat"
            : object.chat.name || "Unnamed Group";

          return (
            // chat format: [{ chat, friend }, ...]
            <Link
              to="/chat"
              state={{ chat: object.chat, friend: object.friend }}
              key={`${object.chat.id}-${index}`}
              onClick={() => setActiveChatId(object.chat.id)} // Set active chat on click
              className={`block p-2 border-b dark:bg-neutral dark:text-secondary cursor-pointer transition-all duration-200 ${
                object.chat.id === activeChatId
                  ? "bg-gray-800 text-white" // Highlight active chat
                  : "bg-gray-100 hover:bg-gray-200" // Normal hover effect
              }`}
            >
              {displayName}
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
