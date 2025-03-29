// // src/pages/ChatPage.jsx
// import { useContext, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { AuthContext } from "../services/authContext.jsx";
// import api from "../services/api.js";
// import AllChats from "../components/chat/allChats.jsx";
// import SingleChat from "../components/chat/singleChat.jsx";
// import ChatNavbar from "../components/chat/chatNavbar.jsx";

// function ChatPage() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { user, setUser, loading } = useContext(AuthContext);

//   useEffect(() => {
//     if (!loading && !user) {
//       navigate("/");
//     }
//   }, [user, loading, navigate]);

//   // Get active chat from location state if available
//   const activeChat = location.state?.chat;
//   const friendName = location.state?.friend;

//   return (
//     <div className="h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
//       {/* Fixed header */}
//       <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 p-4 flex justify-between items-center border-b">
//         <h1 className="text-xl font-bold">Ping</h1>
//         <button
//           onClick={() => {
//             api.get("/auth/logout");
//             setUser(null);
//             navigate("/");
//           }}
//           className="p-2 border rounded"
//         >
//           Logout
//         </button>
//       </header>
//       {/* Main content area */}
//       <div className="flex h-screen overflow-hidden">
//         {/* Sidebar for AllChats */}
//         <div className="w-[300px] flex-shrink-0 border-r overflow-y-auto">
//           <AllChats />
//         </div>
//         {/* Chat area */}
//         <div className="flex flex-col flex-grow h-full">
//           {activeChat ? (
//             <>
//               <ChatNavbar chat={activeChat} friend={friendName} />
//               <SingleChat chat={activeChat} />
//             </>
//           ) : (
//             <div className="flex flex-grow items-center justify-center">
//               <p>Select or create a chat to view messages.</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ChatPage;

// src/pages/ChatPage.jsx
import { useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../services/authContext.jsx";
import api from "../services/api.js";
import AllChats from "../components/chat/AllChats.jsx";
import SingleChat from "../components/chat/SingleChat.jsx";
import ChatNavbar from "../components/chat/ChatNavbar.jsx";

function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser, loading } = useContext(AuthContext);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const activeChat = location.state?.chat;
  const friend = location.state?.friend;

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Fixed header */}
      <header className="sticky top-0 z-10 p-4 border-b bg-white dark:bg-gray-800 flex justify-between items-center">
        <button
          className="text-xl font-bold onClick"
          onClick={() => {
            navigate("/chat", { state: {} });
          }}
        >
          Ping
        </button>
        <button
          onClick={() => {
            api.get("/auth/logout");
            setUser(null);
            navigate("/");
          }}
          className="p-2 border rounded"
        >
          Logout
        </button>
      </header>

      {/* Main content area */}
      <div className="flex flex-grow overflow-hidden">
        {/* Sidebar for AllChats */}
        <aside className="w-[300px] flex-shrink-0 border-r overflow-y-auto">
          <AllChats />
        </aside>

        {/* Chat area */}
        <main className="flex flex-col flex-grow h-full overflow-hidden">
          {activeChat ? (
            <>
              {/* Chat Navbar Container */}
              <div className="flex-none">
                <ChatNavbar chat={activeChat} friend={friend} />
              </div>
              {/* Single Chat Container with scroll */}
              <div className="flex-grow overflow-y-auto">
                <SingleChat chat={activeChat} />
              </div>
            </>
          ) : (
            <div className="flex flex-grow items-center justify-center">
              <p>Select or create a chat to view messages.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default ChatPage;
