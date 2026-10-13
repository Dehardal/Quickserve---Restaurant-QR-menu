const express = require('express');
const router = express.Router();
const {
  getCategories,
  getPublicCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');

// Private CRUD routes
router.route('/')
  .get(protect, getCategories)
  .post(protect, createCategory);

router.route('/:id')
  .put(protect, updateCategory)
  .delete(protect, deleteCategory);

// Public route for customers browsing menu by restaurant owner ID
router.get('/restaurant/:restaurantId', getPublicCategories);

module.exports = router;
