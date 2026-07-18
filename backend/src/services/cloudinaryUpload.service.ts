import type { UploadApiResponse } from 'cloudinary';
import cloudinary from '../config/cloudinary';

export interface UploadBufferOptions {
  folder?: string;
  publicIdPrefix?: string;
}

/**
 * Streams an in-memory file buffer to Cloudinary and resolves with the
 * upload result (secure_url, public_id, etc.) — no temp files, no Base64.
 */
export const uploadBufferToCloudinary = (buffer: Buffer, { folder = 'mobilesales', publicIdPrefix }: UploadBufferOptions = {}): Promise<UploadApiResponse> =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        public_id: publicIdPrefix ? `${publicIdPrefix}-${Date.now()}` : undefined,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result as UploadApiResponse);
      }
    );
    uploadStream.end(buffer);
  });
