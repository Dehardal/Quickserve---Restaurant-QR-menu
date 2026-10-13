const mongoose = require('mongoose');

const DishSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please associate a category with the dish'],
    },
    name: {
      type: String,
      required: [true, 'Please add a dish name'],
      trim: true,
    },
    image: {
      type: String,
      default: '', // Cloudinary secure URL or base64 data string
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: [0, 'Price must be greater than or equal to 0'],
    },
    description: {
      type: String,
      default: '',
    },
    isVeg: {
      type: Boolean,
      required: [true, 'Please specify if the dish is Veg or Non-Veg'],
      default: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Dish', DishSchema);
