import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure Cloudinary once for your module
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET
});

async function uploadCloudinary(localFilePath) {
  try {
    // Upload an image
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      public_id: localFilePath
    });
    fs.unlinkSync(localFilePath);
    return uploadResult.url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    fs.unlinkSync(localFilePath);
    throw error;
  }
}

async function deleteCloudinary(cloudinaryURL) {
  try {
    const parts = cloudinaryURL.split("/");
    const lastPart = parts[parts.length - 1]; // e.g., "avatar-1743370517062-672123298.jpg"
    const uploadIndex = parts.indexOf("upload");
    let subParts = parts.slice(uploadIndex + 1, parts.length - 1);

    if (subParts[0] && /^v\d+$/.test(subParts[0])) {
      subParts.shift();
    }

    const publicId = subParts.join("/") + "/" + lastPart.split(".")[0];

    const url = await cloudinary.uploader.destroy(publicId);
    return url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
}

export { uploadCloudinary, deleteCloudinary };
