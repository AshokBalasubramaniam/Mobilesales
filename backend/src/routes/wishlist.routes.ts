import { Router } from 'express';
import { addToWishlist, removeFromWishlist, getMyWishlist } from '../controllers/wishlist.controller';
import validate from '../middleware/validate.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import * as wishlistValidation from '../validations/wishlist.validation';

const router = Router();

router.get('/', authenticateToken, getMyWishlist);
router.post('/', authenticateToken, validate(wishlistValidation.addToWishlist), addToWishlist);
router.delete('/:mobileId', authenticateToken, validate(wishlistValidation.mobileIdParam), removeFromWishlist);

export default router;
