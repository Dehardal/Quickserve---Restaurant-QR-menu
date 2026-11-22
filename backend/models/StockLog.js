const mongoose = require('mongoose');

const StockLogSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    inventoryItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
    },
    dish: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dish',
    },
    itemName: {
      type: String,
      required: true,
    },
    changeType: {
      type: String,
      enum: ['sale_deduction', 'manual_restock', 'wastage', 'adjustment', 'order_cancelled'],
      required: true,
    },
    quantityChanged: {
      type: Number,
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
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

module.exports = mongoose.model('StockLog', StockLogSchema);
