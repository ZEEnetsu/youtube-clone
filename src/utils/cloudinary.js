import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

cloudinary.config({ 
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (localFilePath) =>{
   try {
     const res = await cloudinary.uploader.upload(localFilePath, {
        resource_type: "auto",
     });
     return res.secure_url;
   } catch (error) {
     fs.unlinkSync(localFilePath);
     throw new Error("Failed to upload image to Cloudinary");
   }
}

export {uploadToCloudinary};