const express = require('express');
const wishlistController = require('../controllers/wishlist.controller');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const wishlistValidation = require('../validations/wishlist.validation');

const router = express.Router();

router.use(protect);
router.get('/', wishlistController.getMyWishlist);
router.post('/', validate(wishlistValidation.addToWishlist), wishlistController.addToWishlist);
router.delete('/:mobileId', validate(wishlistValidation.mobileIdParam), wishlistController.removeFromWishlist);

module.exports = router;
