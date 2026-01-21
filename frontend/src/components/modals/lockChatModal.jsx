import React, { useState } from "react";
import api from "../../services/api.js";
import { FiLock, FiUnlock, FiX } from "react-icons/fi";

export const LockChatModal = ({ isOpen, onClose, chat, onUpdate }) => {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const isLocked = chat?.isLocked;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (passcode.length !== 4) {
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
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-sm shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <FiX size={24} />
        </button>

        <div className="flex flex-col items-center mb-6">
          <div
            className={`p-3 rounded-full mb-4 ${isLocked ? "bg-green-100 text-green-500" : "bg-red-100 text-red-500"}`}
          >
            {isLocked ? <FiUnlock size={32} /> : <FiLock size={32} />}
          </div>
          <h2 className="text-xl font-bold dark:text-white">
            {isLocked ? "Unlock Chat" : "Lock Chat"}
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mt-2">
            {isLocked
              ? "Enter usage passcode to unlock this chat."
              : "Set a 4-digit passcode to lock this chat."}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="password"
              maxLength={4}
              value={passcode}
              onChange={(e) =>
                setPasscode(e.target.value.replace(/[^0-9]/g, ""))
              }
              className="w-full text-center text-3xl tracking-[1em] py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none transition-colors"
              placeholder="••••"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center mb-4 bg-red-50 dark:bg-red-900/20 p-2 rounded">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || passcode.length !== 4}
            className={`w-full py-3 rounded-lg text-white font-medium transition-colors ${
              isLocked
                ? "bg-green-500 hover:bg-green-600"
                : "bg-red-500 hover:bg-red-600"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? "Processing..." : isLocked ? "Unlock" : "Lock"}
          </button>
        </form>
      </div>
    </div>
  );
};
