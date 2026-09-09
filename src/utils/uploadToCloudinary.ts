import cloudinary from '../config/cloudinary.js';
import { CLOUDINARY_FOLDER } from '../config.js';

export const uploadToCloudinary = (fileBuffer: Buffer, folder = CLOUDINARY_FOLDER): Promise<string> => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'image' },
            (error, result) => {
                if (error || !result) return reject(error);
                resolve(result.secure_url);
            },
        );
        stream.end(fileBuffer);
    });
};