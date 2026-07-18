import { Router } from 'express';
import {
  createReview,
  sellerReply,
  getSellerReviews,
  getMobileReviews,
  getMyReviews,
} from '../controllers/review.controller';
import validate from '../middleware/validate.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import { images } from '../middleware/upload.middleware';
import * as reviewValidation from '../validations/review.validation';

const router = Router();

router.get('/my', authenticateToken, getMyReviews);
router.get('/seller/:id', validate(reviewValidation.idParam), getSellerReviews);
router.get('/mobile/:id', validate(reviewValidation.idParam), getMobileReviews);

router.post('/', authenticateToken, images.array('images', 5), validate(reviewValidation.createReview), createReview);
router.patch('/:id/reply', authenticateToken, validate(reviewValidation.sellerReply), sellerReply);

export default router;
