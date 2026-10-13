const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please add a category name'],
      trim: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compounding index to prevent duplicate category names for the same owner
CategorySchema.index({ owner: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Category', CategorySchema);
