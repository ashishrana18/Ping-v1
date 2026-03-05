import React, { useEffect, useContext, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api.js";
import { AuthContext } from "../../services/authContext.jsx";
import { ChangeAvatarModal } from "../modals/changeAvatarModal.jsx";

import { FiPlus, FiCamera, FiLogOut, FiUser, FiMenu } from "react-icons/fi";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import AvatarComponent from "../utils/avatar.jsx";
import { Skeleton } from "primereact/skeleton";
import { useAppHaptics } from "../../utils/useAppHaptics.js";

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
  const { triggerClick, triggerError } = useAppHaptics();

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
    localStorage.removeItem("accessToken");
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
        newUsername: newUsername,
      });
      if (res.data?.data.updatedUser) {
        setUser(res.data.updatedUser);
      }
      setShowChangeUsernameModal(false);
    } catch (err) {
      const message = err.response.data.message;
      setError(message);
      triggerError();
    }
  };

  const profilePicture = user && user.avatar ? user.avatar : null;

  return (
    <>
      <header className="sticky top-0 z-50 p-4 border-b bg-white dark:bg-gray-900 dark:text-primary flex justify-between items-center relative">
        {onMenuClick && (
          <button
            onClick={() => {
              onMenuClick();
              triggerClick();
            }}
            className="md:hidden p-2 mr-2 relative z-50"
            aria-label="Toggle sidebar"
          >
            <FiMenu className="h-6 w-6 text-gray-700 dark:text-gray-200" />
          </button>
        )}
        <div className="flex items-center space-x-4 relative z-50">
          <button
            onClick={() => {
              navigate("/chat", { state: {} });
              triggerClick();
            }}
            className="text-2xl font-bold relative"
          >
            Ping
          </button>
        </div>
        <div className="relative z-50" ref={menuRef}>
          {/* Profile section: current user's avatar and username */}
          <button
            onClick={() => {
              setMenuOpen((prev) => !prev);
              triggerClick();
            }}
            className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Profile Menu"
          >
            {/* Avatar Section: Unified at 48px */}
            <div className="relative shrink-0 w-[48px] h-[48px] mr-3">
              {loading ? (
                <Skeleton
                  shape="circle"
                  size="48px"
                  className="absolute inset-0"
                />
              ) : (
                <AvatarComponent
                  profilePicture={user?.avatar}
                  displayName={user?.username}
                  size="48px"
                  avatarClasses="shrink-0 overflow-hidden"
                  boringAvatarClasses="shrink-0 overflow-hidden rounded-full"
                />
              )}
            </div>

            {/* Username Section: Stable container with large text */}
            <div className="relative h-10 flex items-center min-w-[100px]">
              {loading ? (
                <Skeleton width="104px" height="1.5rem" />
              ) : (
                <span className="text-xl ml-1 font-semibold w-15 text-gray-900 dark:text-white truncate max-w-[100px] ml-1">
                  {user?.username}
                </span>
              )}
            </div>
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded shadow-lg z-50">
              <button
                onClick={() => {
                  handleCreateChat();
                  triggerClick();
                }}
                className="w-full flex items-center text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <FiPlus className="mr-2" size={24} />
                <span>Create Chat</span>
              </button>
              <button
                onClick={() => {
                  handleOpenChangeAvatar();
                  triggerClick();
                }}
                className="w-full flex items-center text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <FiCamera className="mr-2" size={20} />
                <span>Change Avatar</span>
              </button>
              <button
                onClick={() => {
                  handleOpenChangeUsername();
                  triggerClick();
                }}
                className="w-full flex items-center text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <FiUser className="mr-2" size={20} />
                <span>Change Username</span>
              </button>
              <button
                onClick={() => {
                  toggleDarkMode();
                  triggerClick();
                }}
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
                onClick={() => {
                  handleLogout();
                  triggerClick();
                }}
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
          displayName={user?.username}
        />
      )}

      {showChangeUsernameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/40 transition-opacity duration-300">
          <div className="bg-white dark:bg-[rgb(0,7,28)] w-full max-w-sm p-8 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-800 transform transition-all scale-100">
            <h2 className="text-xl font-bold mb-6 dark:text-white">
              Change Username
            </h2>
            {error && (
              <p className="text-red-500 mb-4 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg text-sm text-center font-medium">
                {error}
              </p>
            )}
            <input
              type="text"
              className="w-full px-4 py-3 mb-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 focus:border-[#2196F3] dark:focus:border-[#2196F3] dark:text-white outline-none transition-all duration-300 placeholder-gray-400 font-medium"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Enter new username"
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowChangeUsernameModal(false);
                  triggerClick();
                }}
                className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleUpdateUsername();
                  triggerClick();
                }}
                className="px-6 py-3 bg-[#2196F3] hover:bg-[#1976D2] text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300 active:scale-[0.98]"
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
