import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadToCloudinary(localFilePath ) {
    try {
        if(!localFilePath) throw new Error("File path is required");
        const result = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        console.log(result.url)
    } catch (error) {
        fs.unlinkSync(localFilePath);
        return null
    }
}

export default uploadToCloudinary
