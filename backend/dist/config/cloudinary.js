import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';
dotenv.config();
// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
    api_key: process.env.CLOUDINARY_API_KEY || '',
    api_secret: process.env.CLOUDINARY_API_SECRET || '',
});
// Configure Multer storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: 'avatars',
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
            transformation: [{ width: 256, height: 256, crop: 'fill' }],
        };
    },
});
export const uploadAvatar = multer({ storage: storage });
const chatAttachmentStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        if (file.mimetype.startsWith('image/')) {
            return {
                folder: 'chat-attachments',
                resource_type: 'image',
            };
        }
        if (file.mimetype === 'application/pdf') {
            return {
                folder: 'chat-attachments',
                resource_type: 'raw',
            };
        }
        if (file.mimetype.startsWith('video/')) {
            return {
                folder: 'chat-attachments',
                resource_type: 'video',
            };
        }
        if (file.mimetype.startsWith('audio/')) {
            return {
                folder: 'chat-attachments',
                resource_type: 'video', // Cloudinary treats audio as "video" resource_type
            };
        }
        throw new Error('Unsupported file type');
    },
});
export const uploadAttachment = multer({
    storage: chatAttachmentStorage,
    limits: {
        fileSize: 20 * 1024 * 1024,
    }
});
export { cloudinary };
//# sourceMappingURL=cloudinary.js.map