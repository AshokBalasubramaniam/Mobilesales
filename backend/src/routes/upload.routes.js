const express = require('express');
const uploadController = require('../controllers/upload.controller');
const { protect } = require('../middleware/auth.middleware');
const cloudinaryUpload = require('../middleware/cloudinaryUpload.middleware');

const router = express.Router();

router.post('/image', protect, cloudinaryUpload.single('image'), uploadController.uploadImage);

module.exports = router;
