const Category = require('../models/Category');
const Dish = require('../models/Dish');
const Restaurant = require('../models/Restaurant');

// @desc    Get all categories for the logged-in owner
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ owner: req.user._id }).sort({ displayOrder: 1, createdAt: -1 });
    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    console.error('Fetch categories error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all categories for a public restaurant ID
// @route   GET /api/categories/restaurant/:restaurantId
// @access  Public
const getPublicCategories = async (req, res) => {
  try {
    let ownerId = req.params.restaurantId;
    // Resolve owner ID from restaurant document if restaurantId was provided
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (restaurant) {
      ownerId = restaurant.owner;
    }

    const categories = await Category.find({ owner: ownerId }).sort({ displayOrder: 1, createdAt: -1 });
    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    console.error('Fetch public categories error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res) => {
  try {
    const { name, displayOrder } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Please add a category name' });
    }

    // Check if category already exists for this owner
    const existing = await Category.findOne({ owner: req.user._id, name: name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category name already exists' });
    }

    const category = await Category.create({
      owner: req.user._id,
      name: name.trim(),
      displayOrder: displayOrder || 0,
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    console.error('Create category error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = async (req, res) => {
  try {
    const { name, displayOrder } = req.body;
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Make sure category belongs to logged in user
    if (category.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to edit this category' });
    }

    // Verify duplicate name if changing name
    if (name && name.trim() !== category.name) {
      const existing = await Category.findOne({ owner: req.user._id, name: name.trim() });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Category name already exists' });
      }
      category.name = name.trim();
    }

    if (displayOrder !== undefined) {
      category.displayOrder = displayOrder;
    }

    await category.save();
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    console.error('Update category error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a category & associated dishes
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Make sure category belongs to logged in user
    if (category.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this category' });
    }

    // Remove the category
    await category.deleteOne();

    // Delete all dishes associated with this category
    await Dish.deleteMany({ category: req.params.id });

    res.status(200).json({ success: true, message: 'Category and all associated dishes deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCategories,
  getPublicCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
