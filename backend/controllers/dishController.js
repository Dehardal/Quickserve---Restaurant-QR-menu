const Dish = require('../models/Dish');
const Category = require('../models/Category');
const Restaurant = require('../models/Restaurant');
const { uploadImage } = require('../config/cloudinary');

// @desc    Get all dishes for the logged-in owner
// @route   GET /api/dishes
// @access  Private
const getDishes = async (req, res) => {
  try {
    const dishes = await Dish.find({ owner: req.user._id }).populate('category', 'name');
    res.status(200).json({ success: true, count: dishes.length, data: dishes });
  } catch (error) {
    console.error('Fetch dishes error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all dishes for a public restaurant ID (Available only)
// @route   GET /api/dishes/restaurant/:restaurantId
// @access  Public
const getPublicDishes = async (req, res) => {
  try {
    let ownerId = req.params.restaurantId;
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (restaurant) {
      ownerId = restaurant.owner;
    }

    const dishes = await Dish.find({ owner: ownerId, isAvailable: true }).populate('category', 'name');
    res.status(200).json({ success: true, count: dishes.length, data: dishes });
  } catch (error) {
    console.error('Fetch public dishes error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new dish
// @route   POST /api/dishes
// @access  Private
const createDish = async (req, res) => {
  try {
    const { category, name, image, price, description, isVeg, isAvailable } = req.body;

    if (!category || !name || price === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide category, name, and price' });
    }

    // Verify category belongs to this user
    const checkCategory = await Category.findOne({ _id: category, owner: req.user._id });
    if (!checkCategory) {
      return res.status(400).json({ success: false, message: 'Invalid category associated' });
    }

    // Upload image if provided
    let imageUrl = '';
    if (image) {
      imageUrl = await uploadImage(image);
    }

    const dish = await Dish.create({
      owner: req.user._id,
      category,
      name,
      image: imageUrl,
      price: Number(price),
      description: description || '',
      isVeg: isVeg !== undefined ? isVeg : true,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
    });

    const populatedDish = await Dish.findById(dish._id).populate('category', 'name');
    res.status(201).json({ success: true, data: populatedDish });
  } catch (error) {
    console.error('Create dish error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a dish
// @route   PUT /api/dishes/:id
// @access  Private
const updateDish = async (req, res) => {
  try {
    const { category, name, image, price, description, isVeg, isAvailable } = req.body;
    let dish = await Dish.findById(req.params.id);

    if (!dish) {
      return res.status(404).json({ success: false, message: 'Dish not found' });
    }

    // Make sure dish belongs to user
    if (dish.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to edit this dish' });
    }

    // Verify category if updating
    if (category && category !== dish.category.toString()) {
      const checkCategory = await Category.findOne({ _id: category, owner: req.user._id });
      if (!checkCategory) {
        return res.status(400).json({ success: false, message: 'Invalid category associated' });
      }
      dish.category = category;
    }

    // Process image if changed
    if (image && image !== dish.image) {
      dish.image = await uploadImage(image);
    }

    // Update other fields
    if (name) dish.name = name;
    if (price !== undefined) dish.price = Number(price);
    if (description !== undefined) dish.description = description;
    if (isVeg !== undefined) dish.isVeg = isVeg;
    if (isAvailable !== undefined) dish.isAvailable = isAvailable;

    await dish.save();
    const populatedDish = await Dish.findById(dish._id).populate('category', 'name');

    res.status(200).json({ success: true, data: populatedDish });
  } catch (error) {
    console.error('Update dish error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a dish
// @route   DELETE /api/dishes/:id
// @access  Private
const deleteDish = async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id);

    if (!dish) {
      return res.status(404).json({ success: false, message: 'Dish not found' });
    }

    // Make sure dish belongs to user
    if (dish.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this dish' });
    }

    await dish.deleteOne();
    res.status(200).json({ success: true, message: 'Dish deleted successfully' });
  } catch (error) {
    console.error('Delete dish error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDishes,
  getPublicDishes,
  createDish,
  updateDish,
  deleteDish,
};
