const mongoose = require('mongoose');

const InventoryItemSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide an item or ingredient name'],
      trim: true,
    },
    sku: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      enum: ['Dairy', 'Bakery', 'Produce', 'Beverages', 'Spices & Staples', 'Packaging', 'Meat & Seafood', 'General'],
      default: 'General',
    },
    unit: {
      type: String,
      enum: ['kg', 'grams', 'liters', 'ml', 'pcs', 'packets', 'boxes', 'cans'],
      default: 'pcs',
    },
    currentStock: {
      type: Number,
      required: [true, 'Please set current stock quantity'],
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    minStockThreshold: {
      type: Number,
      default: 5,
      min: [0, 'Threshold cannot be negative'],
    },
    costPerUnit: {
      type: Number,
      default: 0,
      min: [0, 'Unit cost cannot be negative'],
    },
    supplierName: {
      type: String,
      default: '',
    },
    supplierContact: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual property for low stock warning
InventoryItemSchema.virtual('isLowStock').get(function () {
  return this.currentStock <= this.minStockThreshold;
});

InventoryItemSchema.set('toJSON', { virtuals: true });
InventoryItemSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('InventoryItem', InventoryItemSchema);
