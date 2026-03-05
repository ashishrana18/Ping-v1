import React, { useState, useEffect } from "react";
import api from "../../services/api.js";
import { FiLock, FiUnlock, FiX } from "react-icons/fi";
import { useAppHaptics } from "../../utils/useAppHaptics.js";

export const LockChatModal = ({ isOpen, onClose, chat, onUpdate }) => {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { triggerError } = useAppHaptics();

  useEffect(() => {
    if (isOpen) setIsVisible(true);
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!isOpen) return null;

  const isLocked = chat?.isLocked;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (passcode.length !== 4) {
      triggerError();
      setError("Passcode must be 4 digits");
      return;
    }

    setLoading(true);
    try {
      let response;
      if (isLocked) {
        response = await api.post(`/chat/unlock/${chat.id}`, { passcode });
      } else {
        response = await api.post(`/chat/lock/${chat.id}`, { passcode });
      }

      // lockChat returns: { lockedChat }
      // unlockChat returns: { unlockedChat }

      const updatedChat =
        response.data.data.lockedChat || response.data.data.unlockedChat;

      // Keep activeChat in sync after lock/unlock to keep navbar and singleChat in sync
      if (onUpdate) {
        onUpdate(updatedChat);
      }
      handleClose();
    } catch (err) {
      triggerError();
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/40 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white dark:bg-[rgb(0,7,28)] w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden transition-all duration-300 transform border border-gray-100 dark:border-gray-800 ${
          isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - repositioned for consistency */}
        <div className="px-6 pt-6 pb-2 flex justify-between items-center">
          <h2 className="text-xl font-bold dark:text-white">
            {isLocked ? "Unlock Chat" : "Lock Chat"}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-all duration-200"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center">
          <div
            className={`p-4 rounded-full mb-6 shadow-lg transform transition-transform duration-300 ${
              isLocked
                ? "bg-gradient-to-tr from-green-400 to-emerald-600 text-white"
                : "bg-gradient-to-tr from-rose-400 to-red-600 text-white"
            }`}
          >
            {isLocked ? <FiUnlock size={32} /> : <FiLock size={32} />}
          </div>

          <p className="text-center text-gray-600 dark:text-gray-300 mb-8 font-medium">
            {isLocked
              ? "Enter your passcode to view messages."
              : "Secure this chat with a 4-digit passcode."}
          </p>

          <form onSubmit={handleSubmit} className="w-full">
            <div className="mb-6">
              <input
                type="password"
                maxLength={4}
                value={passcode}
                onChange={(e) =>
                  setPasscode(e.target.value.replace(/[^0-9]/g, ""))
                }
                className="w-full text-center text-4xl tracking-[0.5em] py-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 focus:border-[#2196F3] dark:focus:border-[#2196F3] dark:text-white outline-none transition-all duration-300 placeholder-gray-300 dark:placeholder-gray-600 font-mono"
                placeholder="••••"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center mb-4 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg font-semibold animate-pulse">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || passcode.length !== 4}
              className={`w-full py-4 rounded-2xl text-white font-bold shadow-lg transition-all duration-300 active:scale-[0.98] ${
                isLocked
                  ? "bg-green-500 hover:bg-green-600 shadow-green-500/30"
                  : "bg-red-500 hover:bg-red-600 shadow-red-500/30"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : isLocked ? (
                "Unlock Chat"
              ) : (
                "Lock Chat"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
