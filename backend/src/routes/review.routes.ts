import { Router } from 'express';
import {
  createReview,
  sellerReply,
  getSellerReviews,
  getMobileReviews,
  getMyReviews,
} from '../controllers/review.controller';
import validate from '../middleware/validate.middleware';
import { protect } from '../middleware/auth.middleware';
import { images } from '../middleware/upload.middleware';
import * as reviewValidation from '../validations/review.validation';

const router = Router();

router.get('/my', protect, getMyReviews);
router.get('/seller/:id', validate(reviewValidation.idParam), getSellerReviews);
router.get('/mobile/:id', validate(reviewValidation.idParam), getMobileReviews);

router.post('/', protect, images.array('images', 5), validate(reviewValidation.createReview), createReview);
router.patch('/:id/reply', protect, validate(reviewValidation.sellerReply), sellerReply);

export default router;
