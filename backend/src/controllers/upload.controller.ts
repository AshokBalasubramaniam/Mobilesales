import type { Request, Response } from "express";
import { convertToApiError } from "../middleware/error.middleware";
import logger from "../utils/logger";
import env from "../config/env";
import { uploadBufferToCloudinary } from "../services/cloudinaryUpload.service";

const sendError = (res: Response, action: string, error: unknown): void => {
  logger.error(`Failed to ${action}`, error);
  const apiError = convertToApiError(error as Error);
  res
    .status(apiError.statusCode)
    .json({ flag: "error", message: apiError.message });
};

export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!env.isCloudinaryConfigured) {
      return res.status(500).json({
        flag: "error",
        message: "Image upload is not configured on this server",
      });
    }
    if (!req.file) {
      return res
        .status(400)
        .json({ flag: "error", message: "No image file uploaded" });
    }

    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: "mobilesales/uploads",
      publicIdPrefix: req.user!._id.toString(),
    });

    res.status(201).json({
      flag: "success",
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      },
      message: "Image uploaded successfully",
    });
  } catch (error) {
    sendError(res, "upload image", error);
  }
};
