const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const env = require('../config/env');
const { uploadBufferToCloudinary } = require('../services/cloudinaryUpload.service');

const uploadImage = asyncHandler(async (req, res) => {
  if (!env.isCloudinaryConfigured) {
    throw ApiError.internal('Image upload is not configured on this server');
  }
  if (!req.file) {
    throw ApiError.badRequest('No image file uploaded');
  }

  const result = await uploadBufferToCloudinary(req.file.buffer, {
    folder: 'mobilesales/uploads',
    publicIdPrefix: req.user._id.toString(),
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

module.exports = { uploadImage };
