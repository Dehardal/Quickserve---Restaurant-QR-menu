const Restaurant = require('../models/Restaurant');
const { uploadImage } = require('../config/cloudinary');
const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');

// Helper to clean host
const cleanHost = (rawHost) => {
  if (!rawHost) return '';
  return rawHost
    .split(':')[0]
    .toLowerCase()
    .replace(/^www\./, '')
    .trim();
};

// @desc    Resolve restaurant tenant by custom domain or slug
// @route   GET /api/restaurant/resolve-domain
// @access  Public
const resolveDomain = async (req, res) => {
  try {
    const rawDomain = req.query.domain || req.headers.host;
    const slug = req.query.slug;
    const hostname = cleanHost(rawDomain);

    let query = [];

    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      query.push({ customDomain: hostname });
      // If subdomain like cafe.myagency.com, also try the prefix
      const subdomain = hostname.split('.')[0];
      if (subdomain && subdomain !== 'www') {
        query.push({ slug: subdomain });
      }
    }

    if (slug) {
      query.push({ slug: slug.toLowerCase().trim() });
    }

    if (query.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No domain or slug provided to resolve tenant',
      });
    }

    const restaurant = await Restaurant.findOne({ $or: query });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: `No restaurant registered under domain/slug: ${hostname || slug}`,
      });
    }

    if (restaurant.status === 'suspended') {
      return res.status(403).json({
        success: false,
        isSuspended: true,
        message: 'This restaurant digital service is currently suspended. Please contact the administrator.',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug,
        customDomain: restaurant.customDomain,
        logo: restaurant.logo,
        address: restaurant.address,
        contactNumber: restaurant.contactNumber,
        openingHours: restaurant.openingHours,
        tables: restaurant.tables,
        upiId: restaurant.upiId,
        branding: restaurant.branding || {
          primaryColor: '#f97316',
          accentColor: '#ea580c',
          tagline: 'Scan, Order & Savor',
          fontFamily: 'Inter',
        },
        whiteLabel: restaurant.whiteLabel || {
          hidePlatformBranding: true,
          customFooterText: '',
          poweredByText: '',
          poweredByUrl: '',
        },
        invoiceSettings: restaurant.invoiceSettings || {
          businessLegalName: restaurant.name,
          currency: '₹',
        },
      },
    });
  } catch (error) {
    console.error('Resolve domain error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get restaurant profile of current logged in user
// @route   GET /api/restaurant/profile
// @access  Private
const getRestaurantProfile = async (req, res) => {
  try {
    let restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
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

// @desc    Update restaurant profile details (White-Label & Domain Settings)
// @route   PUT /api/restaurant/profile
// @access  Private
const updateRestaurantProfile = async (req, res) => {
  try {
    const {
      name,
      address,
      contactNumber,
      openingHours,
      logo,
      tables,
      upiId,
      customDomain,
      slug,
      branding,
      whiteLabel,
      invoiceSettings,
      cashfreeAppId,
      cashfreeSecretKey,
      cashfreeEnvironment,
      cashfreeEnabled,
      developerSplitEnabled,
      developerSplitVendorId,
      developerSplitPercentage,
    } = req.body;

    let restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant profile not found' });
    }

    // Process image logo if provided (base64 string)
    let logoUrl = restaurant.logo;
    if (logo && logo !== restaurant.logo) {
      logoUrl = await uploadImage(logo);
    }

    // Prepare updates
    const updates = {};
    if (name) updates.name = name;
    if (address) updates.address = address;
    if (contactNumber) updates.contactNumber = contactNumber;
    if (openingHours) updates.openingHours = openingHours;
    if (logoUrl !== undefined) updates.logo = logoUrl;
    if (upiId) updates.upiId = upiId;

    if (customDomain !== undefined) {
      const cleanCustomDomain = customDomain
        ? customDomain.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim()
        : '';
      // Check if another restaurant already uses this custom domain
      if (cleanCustomDomain) {
        const domainExists = await Restaurant.findOne({
          customDomain: cleanCustomDomain,
          _id: { $ne: restaurant._id },
        });
        if (domainExists) {
          return res.status(400).json({
            success: false,
            message: `The domain "${cleanCustomDomain}" is already in use by another restaurant.`,
          });
        }
      }
      updates.customDomain = cleanCustomDomain;
    }

    if (slug !== undefined) {
      const cleanSlug = slug
        ? slug.toLowerCase().replace(/[^a-z0-9-]/g, '').trim()
        : '';
      if (cleanSlug) {
        const slugExists = await Restaurant.findOne({
          slug: cleanSlug,
          _id: { $ne: restaurant._id },
        });
        if (slugExists) {
          return res.status(400).json({
            success: false,
            message: `The slug "${cleanSlug}" is already in use.`,
          });
        }
      }
      updates.slug = cleanSlug;
    }

    if (branding) {
      updates.branding = {
        ...restaurant.branding,
        ...branding,
      };
    }

    if (whiteLabel) {
      updates.whiteLabel = {
        ...restaurant.whiteLabel,
        ...whiteLabel,
      };
    }

    if (invoiceSettings) {
      updates.invoiceSettings = {
        ...restaurant.invoiceSettings,
        ...invoiceSettings,
      };
    }

    if (tables && Array.isArray(tables)) {
      updates.tables = tables;
    }

    if (req.body.companies && Array.isArray(req.body.companies)) {
      updates.companies = req.body.companies;
    }

    if (cashfreeAppId !== undefined) updates.cashfreeAppId = cashfreeAppId;
    if (cashfreeSecretKey !== undefined) updates.cashfreeSecretKey = cashfreeSecretKey;
    if (cashfreeEnvironment !== undefined) updates.cashfreeEnvironment = cashfreeEnvironment;
    if (cashfreeEnabled !== undefined) updates.cashfreeEnabled = cashfreeEnabled;
    if (developerSplitEnabled !== undefined) updates.developerSplitEnabled = developerSplitEnabled;
    if (developerSplitVendorId !== undefined) updates.developerSplitVendorId = developerSplitVendorId;
    if (developerSplitPercentage !== undefined) updates.developerSplitPercentage = Number(developerSplitPercentage);

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

// @desc    Generate a QR Code for a specific table or corporate client (Domain-aware)
// @route   GET /api/restaurant/qr
// @access  Private
const generateTableQR = async (req, res) => {
  try {
    const { tableNumber, company } = req.query;
    if (!tableNumber && !company) {
      return res.status(400).json({ success: false, message: 'Please provide a table number or company name' });
    }

    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant profile not found' });
    }

    // Determine target URL for scanning
    // If the restaurant has their own custom domain set, use it!
    let targetBaseUrl = '';
    if (restaurant.customDomain) {
      targetBaseUrl = `https://${restaurant.customDomain}`;
    } else {
      let frontendOrigin = req.headers.origin;
      if (!frontendOrigin && req.headers.referer) {
        try {
          frontendOrigin = new URL(req.headers.referer).origin;
        } catch (e) {}
      }
      if (!frontendOrigin) {
        const hostname = req.hostname === 'localhost' || req.hostname === '127.0.0.1' ? req.hostname : req.hostname;
        frontendOrigin = `http://${hostname}:5173`;
      }
      targetBaseUrl = `${frontendOrigin}/menu/${restaurant._id}`;
    }

    const separator = targetBaseUrl.includes('?') ? '&' : '?';
    let clientUrl = '';
    let token = '';

    if (company) {
      token = jwt.sign(
        {
          restaurantId: restaurant._id.toString(),
          orderType: 'company_delivery',
          companyName: company,
        },
        process.env.JWT_SECRET || 'supersecretjwtkeyforrestaurantqrmenusaas',
        { expiresIn: '365d' }
      );
      clientUrl = `${targetBaseUrl}${separator}type=company_delivery&company=${encodeURIComponent(company)}&token=${token}`;
    } else {
      token = jwt.sign(
        {
          restaurantId: restaurant._id.toString(),
          tableNumber: tableNumber,
          orderType: 'dine_in',
        },
        process.env.JWT_SECRET || 'supersecretjwtkeyforrestaurantqrmenusaas',
        { expiresIn: '365d' }
      );
      clientUrl = `${targetBaseUrl}${separator}table=${encodeURIComponent(tableNumber)}&tableToken=${token}`;
    }

    // Standard high-contrast black QR Code for optimal camera scannability
    const qrDataUrl = await QRCode.toDataURL(clientUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 340,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });

    res.status(200).json({
      success: true,
      data: {
        tableNumber: tableNumber || '',
        companyName: company || '',
        orderType: company ? 'company_delivery' : 'dine_in',
        token,
        tableToken: token,
        targetUrl: clientUrl,
        qrCodeUrl: qrDataUrl,
        hasCustomDomain: Boolean(restaurant.customDomain),
        domainUsed: restaurant.customDomain || 'Default Platform URL',
      },
    });
  } catch (error) {
    console.error('QR code generation error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify if a table token or corporate token is authentic
// @route   GET /api/restaurant/verify-table
// @access  Public
const verifyTableAccess = async (req, res) => {
  try {
    const { restaurantId, table, company, token } = req.query;

    // 1. Corporate delivery token verification
    if (company) {
      if (!token) {
        return res.status(403).json({
          success: false,
          isTampered: true,
          message: 'Corporate delivery access restricted. Please scan the official QR code at your company premises.',
        });
      }
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkeyforrestaurantqrmenusaas');
        if (decoded.companyName !== company || (restaurantId && decoded.restaurantId && decoded.restaurantId !== restaurantId)) {
          return res.status(403).json({
            success: false,
            isTampered: true,
            message: `Tampering Detected: This QR code belongs to "${decoded.companyName}". You cannot switch companies by editing the URL.`,
          });
        }
        return res.status(200).json({
          success: true,
          orderType: 'company_delivery',
          companyName: decoded.companyName,
          verified: true,
        });
      } catch (err) {
        return res.status(403).json({
          success: false,
          isTampered: true,
          message: 'Security Verification Failed: Corporate QR signature is invalid or expired.',
        });
      }
    }

    // 2. Table dine-in token verification
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

      if (decoded.restaurantId !== restaurantId || (decoded.tableNumber && decoded.tableNumber !== table)) {
        return res.status(403).json({
          success: false,
          isTampered: true,
          message: `Access Denied: Table mismatch. Please scan the QR code physically present on ${table}.`,
        });
      }

      return res.status(200).json({
        success: true,
        table: decoded.tableNumber,
        orderType: 'dine_in',
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
  resolveDomain,
  getRestaurantProfile,
  getPublicRestaurantProfile,
  updateRestaurantProfile,
  generateTableQR,
  verifyTableAccess,
};
