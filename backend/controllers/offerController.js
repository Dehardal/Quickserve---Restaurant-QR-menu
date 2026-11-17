const Offer = require('../models/Offer');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');

// @desc    Get all offers for the logged-in restaurant owner
// @route   GET /api/offers
// @access  Private (Owner)
const getOffers = async (req, res) => {
  try {
    const offers = await Offer.find({ restaurant: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: offers.length, data: offers });
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ success: false, message: 'Server error fetching offers' });
  }
};

// @desc    Get active offers for customers (Public)
// @route   GET /api/offers/active
// @access  Public
const getActiveOffers = async (req, res) => {
  try {
    const { restaurantId, orderType } = req.query;
    if (!restaurantId) {
      return res.status(400).json({ success: false, message: 'Restaurant ID required' });
    }

    // Resolve owner user ID if restaurant document ID was passed
    let ownerId = restaurantId;
    const restDoc = await Restaurant.findById(restaurantId);
    if (restDoc) {
      ownerId = restDoc.owner;
    }

    const now = new Date();
    const query = {
      restaurant: ownerId,
      isActive: true,
      $or: [{ endDate: null }, { endDate: { $gte: now } }],
    };

    if (orderType) {
      query.$and = [{ $or: [{ applicableFor: 'all' }, { applicableFor: orderType }] }];
    }

    const offers = await Offer.find(query).sort({ discountValue: -1, createdAt: -1 });
    res.status(200).json({ success: true, count: offers.length, data: offers });
  } catch (error) {
    console.error('Error fetching active offers:', error);
    res.status(500).json({ success: false, message: 'Server error fetching active offers' });
  }
};

// @desc    Validate a promo code for customer checkout
// @route   POST /api/offers/validate
// @access  Public
const validateOffer = async (req, res) => {
  try {
    const { code, subtotal, customerMobile, restaurantId, orderType } = req.body;

    if (!code || !restaurantId) {
      return res.status(400).json({ success: false, message: 'Promo code and Restaurant ID are required' });
    }

    // Resolve owner user ID
    let ownerId = restaurantId;
    const restDoc = await Restaurant.findById(restaurantId);
    if (restDoc) {
      ownerId = restDoc.owner;
    }

    const cleanCode = code.trim().toUpperCase();
    const offer = await Offer.findOne({
      restaurant: ownerId,
      code: cleanCode,
      isActive: true,
    });

    if (!offer) {
      return res.status(404).json({ success: false, message: `Coupon "${cleanCode}" is invalid or expired.` });
    }

    // Check expiry
    const now = new Date();
    if (offer.endDate && new Date(offer.endDate) < now) {
      return res.status(400).json({ success: false, message: `Coupon "${cleanCode}" has expired.` });
    }

    // Check minimum order value
    const orderSubtotal = Number(subtotal) || 0;
    if (orderSubtotal < offer.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value of ₹${offer.minOrderValue} required to apply coupon "${cleanCode}".`,
      });
    }

    // Check applicable order channel
    if (offer.applicableFor !== 'all' && orderType && offer.applicableFor !== orderType) {
      return res.status(400).json({
        success: false,
        message: `This coupon is only applicable for ${offer.applicableFor.replace('_', ' ')} orders.`,
      });
    }

    // Clean customer mobile (last 10 digits to match any +91 or prefix formatting)
    const mobileDigits = customerMobile ? String(customerMobile).trim().replace(/\D/g, '').slice(-10) : '';

    // Check Customer Eligibility (First Order vs Regular / Loyalty Customers)
    if (offer.targetAudience && offer.targetAudience !== 'all') {
      if (!mobileDigits) {
        return res.status(400).json({
          success: false,
          requiresMobile: true,
          message: offer.targetAudience === 'first_order'
            ? 'Please enter your mobile number in the bucket below to verify your 1st-Time Customer discount.'
            : 'Please enter your mobile number in the bucket below to claim this Loyalty discount.',
        });
      }

      // Check past orders placed by this mobile number at this restaurant
      const pastOrdersCount = await Order.countDocuments({
        restaurant: ownerId,
        customerMobile: { $regex: mobileDigits + '$' },
        status: { $ne: 'cancelled' },
      });

      if (offer.targetAudience === 'first_order' && pastOrdersCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Coupon "${cleanCode}" is exclusively for new customers placing their first order. (Previous orders detected for this mobile number)`,
        });
      }

      if (offer.targetAudience === 'repeat_customers' && pastOrdersCount === 0) {
        return res.status(400).json({
          success: false,
          message: `Coupon "${cleanCode}" is an exclusive reward for returning customers. Place your first order to unlock it!`,
        });
      }
    }

    // Check usage limit per user (e.g. 1 time per mobile number)
    if (offer.usageLimitPerUser && offer.usageLimitPerUser > 0 && mobileDigits) {
      const pastUsage = await Order.countDocuments({
        restaurant: ownerId,
        customerMobile: { $regex: mobileDigits + '$' },
        couponCode: cleanCode,
        status: { $ne: 'cancelled' },
      });

      if (pastUsage >= offer.usageLimitPerUser) {
        return res.status(400).json({
          success: false,
          message: `You have already used coupon "${cleanCode}" the maximum allowed times (${offer.usageLimitPerUser}x) on this mobile number.`,
        });
      }
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (offer.discountType === 'percentage') {
      discountAmount = (orderSubtotal * offer.discountValue) / 100;
      if (offer.maxDiscount && discountAmount > offer.maxDiscount) {
        discountAmount = offer.maxDiscount;
      }
    } else {
      // Flat discount
      discountAmount = Math.min(offer.discountValue, orderSubtotal);
    }

    discountAmount = Math.round(discountAmount * 100) / 100;
    const finalAmount = Math.max(0, orderSubtotal - discountAmount);

    res.status(200).json({
      success: true,
      message: `Coupon "${offer.code}" applied! You save ₹${discountAmount}.`,
      data: {
        code: offer.code,
        title: offer.title,
        discountType: offer.discountType,
        discountValue: offer.discountValue,
        discountAmount,
        subtotal: orderSubtotal,
        finalAmount,
      },
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ success: false, message: 'Server error validating coupon' });
  }
};

// @desc    Create a new offer
// @route   POST /api/offers
// @access  Private (Owner)
const createOffer = async (req, res) => {
  try {
    const {
      title,
      code,
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      applicableFor,
      badgeText,
      bannerColor,
      startDate,
      endDate,
      targetAudience,
      usageLimitPerUser,
    } = req.body;

    if (!title || !code || discountValue === undefined) {
      return res.status(400).json({ success: false, message: 'Title, code, and discount value are required' });
    }

    const cleanCode = code.trim().toUpperCase();

    // Check duplicate code
    const existing = await Offer.findOne({ restaurant: req.user._id, code: cleanCode });
    if (existing) {
      return res.status(400).json({ success: false, message: `An offer with code "${cleanCode}" already exists.` });
    }

    const offer = await Offer.create({
      restaurant: req.user._id,
      title,
      code: cleanCode,
      description,
      discountType: discountType || 'percentage',
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue) || 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      applicableFor: applicableFor || 'all',
      badgeText: badgeText || 'SPECIAL OFFER',
      bannerColor: bannerColor || 'orange',
      startDate: startDate || new Date(),
      endDate: endDate || null,
      targetAudience: targetAudience || 'all',
      usageLimitPerUser: usageLimitPerUser !== undefined ? Number(usageLimitPerUser) : 1,
    });

    res.status(201).json({ success: true, data: offer });
  } catch (error) {
    console.error('Create offer error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an offer
// @route   PUT /api/offers/:id
// @access  Private (Owner)
const updateOffer = async (req, res) => {
  try {
    let offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    if (offer.restaurant.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to edit this offer' });
    }

    if (req.body.code) {
      req.body.code = req.body.code.trim().toUpperCase();
      const existing = await Offer.findOne({
        restaurant: req.user._id,
        code: req.body.code,
        _id: { $ne: offer._id },
      });
      if (existing) {
        return res.status(400).json({ success: false, message: `Code "${req.body.code}" is in use by another offer.` });
      }
    }

    offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: offer });
  } catch (error) {
    console.error('Update offer error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle offer active status
// @route   PATCH /api/offers/:id/toggle
// @access  Private (Owner)
const toggleOfferStatus = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    if (offer.restaurant.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    offer.isActive = !offer.isActive;
    await offer.save();

    res.status(200).json({ success: true, data: offer });
  } catch (error) {
    console.error('Toggle offer status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete an offer
// @route   DELETE /api/offers/:id
// @access  Private (Owner)
const deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    if (offer.restaurant.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await offer.deleteOne();
    res.status(200).json({ success: true, message: 'Offer deleted successfully' });
  } catch (error) {
    console.error('Delete offer error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getOffers,
  getActiveOffers,
  validateOffer,
  createOffer,
  updateOffer,
  toggleOfferStatus,
  deleteOffer,
};

