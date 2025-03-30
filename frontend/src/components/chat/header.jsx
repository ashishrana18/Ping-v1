import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api.js";
import { AuthContext } from "../../services/authcontext.jsx";

function Header() {
  const { user, setUser, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  return (
    <div>
      <header className="sticky top-0 z-10 p-4 border-b bg-white dark:bg-gray-800 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/chat", { state: {} })}
            className="text-xl font-bold"
          >
            Ping
          </button>
          {/* Plus icon in header to create new chat */}
          <button
            onClick={() => navigate("/new-chat")}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Create New Chat"
          >
            <div className="flex">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                className="w-6 h-6"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 5v14m-7-7h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <h1 className="pl-1">Create chat</h1>
            </div>
          </button>
        </div>
        <div className="flex items-center space-x-4">
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
        </div>
      </header>
    </div>
  );
}

export default Header;
