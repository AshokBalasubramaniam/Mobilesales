import multer, { type FileFilterCallback } from 'multer';
import type { Request } from 'express';
import ApiError from '../utils/ApiError';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const storage = multer.memoryStorage();

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(ApiError.badRequest(`Unsupported file type: ${file.mimetype}. Allowed formats: jpg, jpeg, png, webp`));
  }
  cb(null, true);
};

const cloudinaryUpload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter,
});

export default cloudinaryUpload;
