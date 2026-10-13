const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  dish: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dish',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
});

const OrderSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tableNumber: {
      type: String,
      required: [true, 'Please specify a table number'],
    },
    customerName: {
      type: String,
      required: [true, 'Please add a customer name'],
    },
    customerMobile: {
      type: String,
      required: [true, 'Please add a customer mobile number'],
    },
    specialInstructions: {
      type: String,
      default: '',
    },
    items: [OrderItemSchema],
    subtotal: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'served', 'completed', 'paid'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'card', 'unpaid'],
      default: 'unpaid',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    transactionId: {
      type: String,
      default: '',
    },
    paidAt: {
      type: Date,
    },
    billRequested: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', OrderSchema);
