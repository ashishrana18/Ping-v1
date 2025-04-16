import React, { useEffect, useContext, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api.js";
import { AuthContext } from "../../services/authcontext.jsx";
import { FiPlus, FiCamera, FiLogOut } from "react-icons/fi";
import { ChangeAvatarModal } from "./ChangeAvatarModal.jsx";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";

function Header({ onMenuClick }) {
  const { user, setUser, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showChangeAvatarModal, setShowChangeAvatarModal] = useState(false);
  const menuRef = useRef(null);
  const [darkMode, setDarkMode] = useState(false);

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

  const handleLogout = () => {
    api.get("/auth/logout");
    setUser(null);
    navigate("/");
  };

  const handleCreateChat = () => {
    navigate("/new-chat");
    setMenuOpen(false);
  };

  // Instead of navigating, open the modal for changing avatar
  const handleOpenChangeAvatar = () => {
    setShowChangeAvatarModal(true);
    setMenuOpen(false);
  };

  // Use default avatar if user.avatar is missing
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
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded shadow-lg z-50">
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
                onClick={toggleDarkMode}
                className="w-full flex items-center text-left px-2 py-2  dark:border-gray-700 transition-all"
              >
                {darkMode ? (
                  <SunIcon className="h-6 w-6  text-yellow-400" />
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
      {showChangeAvatarModal && (
        <ChangeAvatarModal
          currentAvatar={profilePicture}
          onClose={() => setShowChangeAvatarModal(false)}
          onUpload={(responseData) => {
            if (responseData.updatedUser) {
              setUser(responseData.updatedUser);
            }
            setShowChangeAvatarModal(false);
          }}
        />
      )}
    </>
  );
}

export default Header;
