const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Please add a restaurant name'],
      trim: true,
    },
    logo: {
      type: String,
      default: '', // Cloudinary secure URL or base64 data string
    },
    address: {
      type: String,
      required: [true, 'Please add an address'],
    },
    contactNumber: {
      type: String,
      required: [true, 'Please add a contact number'],
    },
    openingHours: {
      type: String,
      default: '09:00 AM - 10:00 PM',
    },
    tables: {
      type: [String],
      default: ['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5'],
    },
    upiId: {
      type: String,
      default: 'merchant@okaxis',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Restaurant', RestaurantSchema);
