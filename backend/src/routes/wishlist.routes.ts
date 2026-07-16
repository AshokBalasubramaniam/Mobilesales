import { Router } from 'express';
import { addToWishlist, removeFromWishlist, getMyWishlist } from '../controllers/wishlist.controller';
import validate from '../middleware/validate.middleware';
import { protect } from '../middleware/auth.middleware';
import * as wishlistValidation from '../validations/wishlist.validation';

const router = Router();

router.use(protect);
router.get('/', getMyWishlist);
router.post('/', validate(wishlistValidation.addToWishlist), addToWishlist);
router.delete('/:mobileId', validate(wishlistValidation.mobileIdParam), removeFromWishlist);

export default router;
