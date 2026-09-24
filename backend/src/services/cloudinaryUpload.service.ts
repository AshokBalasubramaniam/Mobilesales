import type { UploadApiResponse } from 'cloudinary';
import cloudinary from '../config/cloudinary';
import { convertToWebp } from './image.service';

export interface UploadBufferOptions {
  folder?: string;
  publicIdPrefix?: string;
  mimetype?: string;
}

/**
 * Converts the image to WebP, then streams the buffer to Cloudinary and
 * resolves with the upload result (secure_url, public_id, etc.) — no temp
 * files, no Base64.
 */
export const uploadBufferToCloudinary = async (
  rawBuffer: Buffer,
  { folder = 'mobilesales', publicIdPrefix, mimetype }: UploadBufferOptions = {},
): Promise<UploadApiResponse> => {
  const { buffer } = await convertToWebp(rawBuffer, mimetype);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        public_id: publicIdPrefix ? `${publicIdPrefix}-${Date.now()}` : undefined,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        format: 'webp',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result as UploadApiResponse);
      }
    );
    uploadStream.end(buffer);
  });
};
