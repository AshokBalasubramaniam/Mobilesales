import type { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import env from '../config/env';
import { uploadBufferToCloudinary } from '../services/cloudinaryUpload.service';

export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  if (!env.isCloudinaryConfigured) {
    throw ApiError.internal('Image upload is not configured on this server');
  }
  if (!req.file) {
    throw ApiError.badRequest('No image file uploaded');
  }

  const result = await uploadBufferToCloudinary(req.file.buffer, {
    folder: 'mobilesales/uploads',
    publicIdPrefix: req.user!._id.toString(),
  });

  new ApiResponse(
    201,
    {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    },
    'Image uploaded successfully'
  ).send(res);
});
