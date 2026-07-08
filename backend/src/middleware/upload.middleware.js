const multer = require('multer');
const ApiError = require('../utils/ApiError');

const storage = multer.memoryStorage();

const fileFilterFor = (allowedMimePrefixes) => (req, file, cb) => {
  const isAllowed = allowedMimePrefixes.some((prefix) => file.mimetype.startsWith(prefix));
  if (!isAllowed) {
    return cb(ApiError.badRequest(`Unsupported file type: ${file.mimetype}`));
  }
  cb(null, true);
};

const images = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024, files: 15 },
  fileFilter: fileFilterFor(['image/']),
});

const videos = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024, files: 2 },
  fileFilter: fileFilterFor(['video/']),
});

const voice = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024, files: 1 },
  fileFilter: fileFilterFor(['audio/']),
});

const documents = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: fileFilterFor(['image/', 'application/pdf']),
});

const chatMedia = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024, files: 1 },
  fileFilter: fileFilterFor(['image/', 'audio/']),
});

module.exports = { images, videos, voice, documents, chatMedia };
