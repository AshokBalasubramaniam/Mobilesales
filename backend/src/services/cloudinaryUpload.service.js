const cloudinary = require('../config/cloudinary');

/**
 * Streams an in-memory file buffer to Cloudinary and resolves with the
 * upload result (secure_url, public_id, etc.) — no temp files, no Base64.
 */
const uploadBufferToCloudinary = (buffer, { folder = 'mobilesales', publicIdPrefix } = {}) =>
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
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });

module.exports = { uploadBufferToCloudinary };
