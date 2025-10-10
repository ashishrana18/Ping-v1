import React, { useEffect, useContext, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api.js";
import { AuthContext } from "../../services/authContext.jsx";
import { FiPlus, FiCamera, FiLogOut, FiUser } from "react-icons/fi";
import { ChangeAvatarModal } from "./changeAvatarModal.jsx";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";

function Header({ onMenuClick }) {
  const { user, setUser, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showChangeAvatarModal, setShowChangeAvatarModal] = useState(false);
  const [showChangeUsernameModal, setShowChangeUsernameModal] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || "");
  const menuRef = useRef(null);
  const [darkMode, setDarkMode] = useState(false);
  const [error, setError] = useState("");

  // Check local storage for theme preference on initial load and apply dark mode if set
  // This runs only once when the component mounts
  // and sets the initial dark mode state based on localStorage
  // This is useful for maintaining the user's theme preference across sessions
  // This ensures that the dark mode is applied immediately when the app loads
  // and the user doesn't see a flash of light mode before the theme is applied
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await api.get("/auth/logout");
    setUser(null);
    navigate("/");
  };

  const handleCreateChat = () => {
    navigate("/new-chat");
    setMenuOpen(false);
  };

  const handleOpenChangeAvatar = () => {
    setShowChangeAvatarModal(true);
    setMenuOpen(false);
  };

  const handleOpenChangeUsername = () => {
    setNewUsername(user?.username || "");
    setShowChangeUsernameModal(true);
    setMenuOpen(false);
  };

  const handleUpdateUsername = async () => {
    try {
      const res = await api.post("/user/updateUsername", {
        newUsername: newUsername
      });
      if (res.data?.data.updatedUser) {
        setUser(res.data.updatedUser);
      }
      setShowChangeUsernameModal(false);
    } catch (err) {
      if (err.response?.status === 400) {
        setError(err.response.data?.data?.message || "Username already exists!");
      } else {
        setError("Failed to update username");
      }
    }
  };

  const profilePicture =
    user && user.avatar
      ? user.avatar
      : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTItQjUALs6-IkOWnOAMl8i3zrGqQWsaL5aVQ&s";

  return (
    <>
      <header className="sticky top-0 z-100 p-4 border-b bg-white dark:bg-gray-800 dark:text-primary flex justify-between items-center">
        {onMenuClick && (
          <button
            className="md:hidden p-2 mr-2"
            onClick={onMenuClick}
            aria-label="Toggle sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-700 dark:text-gray-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        )}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/chat", { state: {} })}
            className="text-xl font-bold"
          >
            Ping
          </button>
        </div>
        <div className="relative" ref={menuRef}>
          {/* Profile section: current user's avatar and username */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Profile Menu"
          >
            <img
              src={profilePicture}
              alt={user ? user.username : "User"}
              className="w-10 h-10 rounded-full mr-2"
            />
            <span className="text-lg font-medium text-gray-900 dark:text-white">
              {user ? user.username : "User"}
            </span>
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded shadow-lg z-50">
              <button
                onClick={handleCreateChat}
                className="w-full flex items-center text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <FiPlus className="mr-2" size={24} />
                <span>Create Chat</span>
              </button>
              <button
                onClick={handleOpenChangeAvatar}
                className="w-full flex items-center text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <FiCamera className="mr-2" size={20} />
                <span>Change Avatar</span>
              </button>
              <button
                onClick={handleOpenChangeUsername}
                className="w-full flex items-center text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <FiUser className="mr-2" size={20} />
                <span>Change Username</span>
              </button>
              <button
                onClick={toggleDarkMode}
                className="w-full flex items-center text-left px-2 py-2 dark:border-gray-700 transition-all"
              >
                {darkMode ? (
                  <SunIcon className="h-6 w-6 text-yellow-400" />
                ) : (
                  <MoonIcon className="h-6 w-6 text-gray-800" />
                )}
                <span className="pl-2">Change Theme</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center text-left px-4 py-2 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <FiLogOut className="mr-2" size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Modals */}
      {showChangeAvatarModal && (
        <ChangeAvatarModal
          currentAvatar={profilePicture}
          onClose={() => setShowChangeAvatarModal(false)}
          onUpload={(responseData) => {
            if (responseData.updatedUser) setUser(responseData.updatedUser);
            setShowChangeAvatarModal(false);
          }}
        />
      )}

      {showChangeUsernameModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white dark:bg-gray-700 p-6 rounded shadow-lg w-80">
            <h2 className="text-lg font-semibold mb-4 dark:text-white">
              Change Username
            </h2>
            {error && <p className="text-red-500 mb-2">{error}</p>}
            <input
              type="text"
              className="w-full px-3 py-2 mb-4 border rounded dark:bg-gray-600 dark:text-white"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Enter new username"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowChangeUsernameModal(false)}
                className="px-4 py-2 border rounded text-black dark:text-white bg-white dark:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUsername}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
