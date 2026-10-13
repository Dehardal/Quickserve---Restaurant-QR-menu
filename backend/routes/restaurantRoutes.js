const express = require('express');
const router = express.Router();
const {
  getRestaurantProfile,
  getPublicRestaurantProfile,
  updateRestaurantProfile,
  generateTableQR,
  verifyTableAccess,
} = require('../controllers/restaurantController');
const { protect } = require('../middleware/authMiddleware');

// Private routes
router.get('/profile', protect, getRestaurantProfile);
router.put('/profile', protect, updateRestaurantProfile);
router.get('/qr', protect, generateTableQR);

// Public routes for customers scanning QR
router.get('/verify-table', verifyTableAccess);
router.get('/:id/public', getPublicRestaurantProfile);

module.exports = router;
