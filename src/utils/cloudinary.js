import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (localFilePath) => {
  console.log("Cloudinary config:", {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    secret_exists: !!process.env.CLOUDINARY_API_SECRET,
  });
  console.log("Uploading file:", localFilePath); //
  try {
    const res = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("Cloudinary upload response:", res); //
    return res.secure_url;
  } catch (error) {
    console.log("Cloudinary error:", error);
    fs.unlinkSync(localFilePath);
    throw new Error("Failed to upload image to Cloudinary");
  }
};

export { uploadToCloudinary };
