const express = require('express');
const router = express.Router();
const {
  getDishes,
  getPublicDishes,
  createDish,
  updateDish,
  deleteDish,
} = require('../controllers/dishController');
const { protect } = require('../middleware/authMiddleware');

// Private CRUD routes
router.route('/')
  .get(protect, getDishes)
  .post(protect, createDish);

router.route('/:id')
  .put(protect, updateDish)
  .delete(protect, deleteDish);

// Public route for customers browsing menu by restaurant owner ID
router.get('/restaurant/:restaurantId', getPublicDishes);

module.exports = router;
