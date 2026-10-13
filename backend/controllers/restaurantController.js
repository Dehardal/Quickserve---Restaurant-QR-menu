const Restaurant = require('../models/Restaurant');
const { uploadImage } = require('../config/cloudinary');
const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');

// @desc    Get restaurant profile of current logged in user
// @route   GET /api/restaurant/profile
// @access  Private
const getRestaurantProfile = async (req, res) => {
  try {
    let restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      // Auto create if not found
      restaurant = await Restaurant.create({
        owner: req.user._id,
        name: 'My Restaurant',
        address: 'Edit Address',
        contactNumber: '0000000000',
      });
    }
    res.status(200).json({ success: true, data: restaurant });
  } catch (error) {
    console.error('Fetch restaurant profile error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get restaurant profile by ID (Public for customers scanning QR)
// @route   GET /api/restaurant/:id/public
// @access  Public
const getPublicRestaurantProfile = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    res.status(200).json({ success: true, data: restaurant });
  } catch (error) {
    console.error('Fetch public restaurant profile error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update restaurant profile details
// @route   PUT /api/restaurant/profile
// @access  Private
const updateRestaurantProfile = async (req, res) => {
  try {
    const { name, address, contactNumber, openingHours, logo, tables } = req.body;
    let restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant profile not found' });
    }

    // Process image logo if provided (base64 string)
    let logoUrl = restaurant.logo;
    if (logo && logo !== restaurant.logo) {
      // Upload using helper which handles Cloudinary / Base64 fallback gracefully
      logoUrl = await uploadImage(logo);
    }

    // Prepare updates
    const updates = {
      name: name || restaurant.name,
      address: address || restaurant.address,
      contactNumber: contactNumber || restaurant.contactNumber,
      openingHours: openingHours || restaurant.openingHours,
      logo: logoUrl,
    };

    // If tables are provided, update them
    if (tables && Array.isArray(tables)) {
      updates.tables = tables;
    }

    restaurant = await Restaurant.findByIdAndUpdate(
      restaurant._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: restaurant });
  } catch (error) {
    console.error('Update restaurant profile error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate a QR Code for a specific table
// @route   GET /api/restaurant/qr
// @access  Private
const generateTableQR = async (req, res) => {
  try {
    const { tableNumber } = req.query;
    if (!tableNumber) {
      return res.status(400).json({ success: false, message: 'Please provide a table number' });
    }

    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant profile not found' });
    }

    // Generate a tamper-proof cryptographic token for this specific table
    const tableToken = jwt.sign(
      {
        restaurantId: restaurant._id.toString(),
        tableNumber: tableNumber,
      },
      process.env.JWT_SECRET || 'supersecretjwtkeyforrestaurantqrmenusaas',
      { expiresIn: '365d' }
    );

    // Target URL for scanning (Point to Customer Menu Frontend Page on port 4000)
    let frontendOrigin = req.headers.origin;
    if (!frontendOrigin && req.headers.referer) {
      try {
        frontendOrigin = new URL(req.headers.referer).origin;
      } catch (e) {}
    }
    if (!frontendOrigin) {
      const hostname = req.hostname === 'localhost' || req.hostname === '127.0.0.1' ? req.hostname : req.hostname;
      frontendOrigin = `http://${hostname}:4000`;
    }

    const clientUrl = `${frontendOrigin}/menu/${restaurant._id}?table=${encodeURIComponent(tableNumber)}&tableToken=${tableToken}`;

    // Generate QR Code as a Data URL
    const qrDataUrl = await QRCode.toDataURL(clientUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 320,
      color: {
        dark: '#1e293b', // slate-800
        light: '#ffffff',
      },
    });

    res.status(200).json({
      success: true,
      data: {
        tableNumber,
        tableToken,
        targetUrl: clientUrl,
        qrCodeUrl: qrDataUrl,
      },
    });
  } catch (error) {
    console.error('QR code generation error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify if a table token is authentic for a requested table
// @route   GET /api/restaurant/verify-table
// @access  Public
const verifyTableAccess = async (req, res) => {
  try {
    const { restaurantId, table, token } = req.query;

    if (!restaurantId || !table) {
      return res.status(400).json({ success: false, message: 'Restaurant and table number are required.' });
    }

    if (!token) {
      return res.status(403).json({
        success: false,
        isTampered: true,
        message: 'No table verification token found. Please scan the QR code physically present on your table.',
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkeyforrestaurantqrmenusaas');
      
      if (decoded.restaurantId !== restaurantId || decoded.tableNumber !== table) {
        return res.status(403).json({
          success: false,
          isTampered: true,
          message: `Access Denied: You cannot switch to ${table} by modifying the URL. Please scan the physical QR code on ${table}.`,
        });
      }

      return res.status(200).json({
        success: true,
        table: decoded.tableNumber,
        verified: true,
      });
    } catch (err) {
      return res.status(403).json({
        success: false,
        isTampered: true,
        message: 'Security Verification Failed: QR signature is invalid or tampered.',
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getRestaurantProfile,
  getPublicRestaurantProfile,
  updateRestaurantProfile,
  generateTableQR,
  verifyTableAccess,
};
