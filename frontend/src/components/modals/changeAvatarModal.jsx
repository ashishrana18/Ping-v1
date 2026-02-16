import React, { useState, useEffect } from "react";
import api from "../../services/api.js";
import AvatarComponent from "../utils/avatar.jsx";
import { FiX, FiCamera, FiCheck, FiUpload } from "react-icons/fi";

const ChangeAvatarModal = ({
  currentAvatar,
  onClose,
  onUpload,
  chatId,
  displayName,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(currentAvatar);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", selectedFile);
      let response = null;
      if (!chatId) {
        response = await api.post("/user/avatar", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await api.post(`/chat/avatar/${chatId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      onUpload(response.data.data);
      handleClose();
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/40 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`bg-white dark:bg-[rgb(0,7,28)] w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden transition-all duration-300 transform border border-gray-100 dark:border-gray-800 ${
          isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-2 flex justify-between items-center transition-colors">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Profile Photo
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-all duration-200"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center">
          {/* Avatar Preview Section */}
          <div className="relative group cursor-pointer mb-8">
            <div className="absolute inset-0 rounded-full bg-[#2196F3]/10 scale-110 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative mx-auto rounded-full p-1.5 bg-gradient-to-tr from-[#8b5cf6] to-[#d946ef] aspect-square shrink-0 flex items-center justify-center">
              <AvatarComponent
                profilePicture={preview}
                displayName={displayName}
                size={144}
                avatarClasses="shadow-lg shrink-0 aspect-square overflow-hidden"
                boringAvatarClasses="shrink-0 overflow-hidden rounded-full shadow-lg"
              />
              <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-[2px]">
                <FiCamera
                  size={24}
                  className="mb-1 transform group-hover:scale-110 transition-transform duration-300"
                />
                <span className="text-[10px] font-bold tracking-wider">
                  CHANGE
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          <div className="w-full space-y-3">
            {!selectedFile ? (
              <label className="flex items-center justify-center gap-2 w-full py-4 px-4 bg-gray-50 dark:bg-gray-800/40 text-gray-600 dark:text-gray-300 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-[#2196F3] dark:hover:border-[#2196F3] hover:bg-blue-50/30 dark:hover:bg-blue-500/5 cursor-pointer transition-all duration-300 group">
                <FiUpload className="text-lg group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm">Choose a Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            ) : (
              <button
                onClick={handleUpload}
                disabled={loading}
                className={`flex items-center justify-center gap-2 w-full py-4 px-4 bg-[#2196F3] hover:bg-[#1976D2] text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-[0.98] transition-all duration-300 ${
                  loading ? "opacity-90 cursor-wait" : ""
                }`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <FiCheck size={20} />
                    Update Profile Photo
                  </>
                )}
              </button>
            )}

            <button
              onClick={handleClose}
              disabled={loading}
              className="w-full py-3 px-4 text-gray-500 dark:text-gray-400 font-bold text-sm hover:text-gray-800 dark:hover:text-white transition-colors duration-200"
            >
              Skip for now
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/20 text-center border-t border-gray-100 dark:border-gray-800">
          <p className="text-[10px] uppercase tracking-[0.1em] text-gray-400 dark:text-gray-500 font-black">
            Visible to your contacts & groups
          </p>
        </div>
      </div>
    </div>
  );
};

export { ChangeAvatarModal };
