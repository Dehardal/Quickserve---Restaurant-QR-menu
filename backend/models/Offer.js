const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide an offer title'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Please provide a coupon/promo code'],
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'flat'],
      default: 'percentage',
    },
    discountValue: {
      type: Number,
      required: [true, 'Please specify discount value'],
      min: [1, 'Discount value must be at least 1'],
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: [0, 'Minimum order value cannot be negative'],
    },
    maxDiscount: {
      type: Number,
      default: null, // Maximum discount cap for percentage offers
    },
    applicableFor: {
      type: String,
      enum: ['all', 'dine_in', 'company_delivery', 'takeaway'],
      default: 'all',
    },
    badgeText: {
      type: String,
      default: 'SPECIAL OFFER',
      trim: true,
    },
    bannerColor: {
      type: String,
      enum: ['orange', 'amber', 'emerald', 'indigo', 'purple', 'rose'],
      default: 'orange',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null, // Null means perpetual until manually deactivated
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    targetAudience: {
      type: String,
      enum: ['all', 'first_order', 'repeat_customers'],
      default: 'all',
    },
    usageLimitPerUser: {
      type: Number,
      default: 1, // 1 = once per phone number, 0 = unlimited
    },
    usageCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness of offer code per restaurant
OfferSchema.index({ restaurant: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Offer', OfferSchema);

