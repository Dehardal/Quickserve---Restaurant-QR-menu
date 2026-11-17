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
      default: 'Table 1',
    },
    orderType: {
      type: String,
      enum: ['dine_in', 'company_delivery', 'takeaway'],
      default: 'dine_in',
    },
    companyName: {
      type: String,
      default: '',
    },
    deliveryAddress: {
      type: String,
      default: '',
    },
    deskNumber: {
      type: String,
      default: '',
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
    discount: {
      type: Number,
      default: 0,
    },
    couponCode: {
      type: String,
      default: '',
    },
    grandTotal: {
      type: Number,
      default: function () {
        return Math.max(0, (this.subtotal || 0) - (this.discount || 0));
      },
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'served', 'completed', 'paid'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'card', 'online_cashfree', 'unpaid'],
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
    cashfreeOrderId: {
      type: String,
      default: '',
    },
    cashfreePaymentSessionId: {
      type: String,
      default: '',
    },
    paymentDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
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
