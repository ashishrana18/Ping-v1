import React, { useState } from "react";
import api from "../../services/api.js";

const ChangeAvatarModal = ({ currentAvatar, onClose, onUpload, chatId }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(currentAvatar);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file) {
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
      // Check if chatId is falsy (undefined, null, empty string, etc.)
      if (!chatId) {
        response = await api.post("/user/avatar", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        }); // data.data contains { updatedUser, url }
      } else {
        response = await api.post(`/chat/avatar/${chatId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }
      onUpload(response.data.data); // response.data.data contains { updatedUser, url }
      setLoading(false);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black bg-opacity-50 dark:text-secondary">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Change Profile Picture</h2>
        <div className="flex flex-col items-center">
          <p className="mb-2">Current Avatar:</p>
          <img
            src={currentAvatar}
            alt="Current Avatar"
            className="w-24 h-24 rounded-full mb-4"
          />
          <p className="mb-2">New Avatar Preview:</p>
          <img
            src={preview}
            alt="New Avatar Preview"
            className="w-24 h-24 rounded-full mb-4"
          />
          <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Choose New File
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          <button
            onClick={handleUpload}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            disabled={!selectedFile || loading}
          >
            {loading ? "Uploading..." : "Done"}
          </button>
          <button
            onClick={onClose}
            className="mt-2 text-gray-600 hover:underline dark:text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export { ChangeAvatarModal };
