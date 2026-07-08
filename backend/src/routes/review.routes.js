const express = require('express');
const reviewController = require('../controllers/review.controller');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const reviewValidation = require('../validations/review.validation');

const router = express.Router();

router.get('/my', protect, reviewController.getMyReviews);
router.get('/seller/:id', validate(reviewValidation.idParam), reviewController.getSellerReviews);
router.get('/mobile/:id', validate(reviewValidation.idParam), reviewController.getMobileReviews);

router.post('/', protect, upload.images.array('images', 5), validate(reviewValidation.createReview), reviewController.createReview);
router.patch('/:id/reply', protect, validate(reviewValidation.sellerReply), reviewController.sellerReply);

module.exports = router;
