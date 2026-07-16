import multer, { type FileFilterCallback } from 'multer';
import type { Request } from 'express';
import ApiError from '../utils/ApiError';

const storage = multer.memoryStorage();

const fileFilterFor = (allowedMimePrefixes: string[]) => (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  const isAllowed = allowedMimePrefixes.some((prefix) => file.mimetype.startsWith(prefix));
  if (!isAllowed) {
    return cb(ApiError.badRequest(`Unsupported file type: ${file.mimetype}`));
  }
  cb(null, true);
};

export const images = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024, files: 15 },
  fileFilter: fileFilterFor(['image/']),
});

export const videos = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024, files: 2 },
  fileFilter: fileFilterFor(['video/']),
});

export const voice = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024, files: 1 },
  fileFilter: fileFilterFor(['audio/']),
});

export const documents = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: fileFilterFor(['image/', 'application/pdf']),
});

export const chatMedia = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024, files: 1 },
  fileFilter: fileFilterFor(['image/', 'audio/']),
});
