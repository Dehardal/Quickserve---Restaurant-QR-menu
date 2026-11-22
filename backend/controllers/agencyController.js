const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Dish = require('../models/Dish');
const Category = require('../models/Category');
const Order = require('../models/Order');

// @desc    List all client restaurants for the agency / freelancer
// @route   GET /api/agency/restaurants
// @access  Private (SuperAdmin)
const listClients = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().populate('owner', 'name email createdAt role');

    // Attach statistics (dish count, category count, order count)
    const clientData = await Promise.all(
      restaurants.map(async (r) => {
        const dishCount = await Dish.countDocuments({ owner: r.owner?._id });
        const categoryCount = await Category.countDocuments({ owner: r.owner?._id });
        const orderCount = await Order.countDocuments({ restaurant: r.owner?._id });

        return {
          _id: r._id,
          name: r.name,
          slug: r.slug,
          customDomain: r.customDomain || '',
          logo: r.logo || '',
          contactNumber: r.contactNumber,
          address: r.address,
          status: r.status || 'active',
          tables: r.tables || [],
          branding: r.branding,
          features: r.features || {
            posTerminal: true,
            inventoryManagement: true,
            dineInOrdering: true,
            takeawayOrdering: true,
            corporateDelivery: true,
            offersAndPromos: true,
            onlinePayments: true,
            liveKitchenDisplay: true,
          },
          whiteLabel: r.whiteLabel,
          invoiceSettings: r.invoiceSettings,
          owner: r.owner
            ? {
                _id: r.owner._id,
                name: r.owner.name,
                email: r.owner.email,
                createdAt: r.owner.createdAt,
              }
            : null,
          stats: {
            dishes: dishCount,
            categories: categoryCount,
            orders: orderCount,
          },
          createdAt: r.createdAt,
        };
      })
    );

    res.status(200).json({ success: true, count: clientData.length, data: clientData });
  } catch (error) {
    console.error('Agency list clients error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Onboard a new client restaurant + owner user in one click
// @route   POST /api/agency/restaurants
// @access  Private (SuperAdmin)
const createClient = async (req, res) => {
  try {
    const {
      restaurantName,
      ownerName,
      ownerEmail,
      ownerPassword,
      customDomain,
      slug,
      contactNumber,
      address,
      tables,
      primaryColor,
      secondaryColor,
      accentColor,
      features,
      upiId,
    } = req.body;

    if (!restaurantName || !ownerName || !ownerEmail || !ownerPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide restaurantName, ownerName, ownerEmail, and ownerPassword.',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: ownerEmail });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: `An account with email ${ownerEmail} already exists.`,
      });
    }

    // Check custom domain uniqueness if specified
    const cleanDomain = customDomain
      ? customDomain.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim()
      : '';

    if (cleanDomain) {
      const domainExists = await Restaurant.findOne({ customDomain: cleanDomain });
      if (domainExists) {
        return res.status(400).json({
          success: false,
          message: `Custom domain "${cleanDomain}" is already mapped to another client.`,
        });
      }
    }

    // Auto-generate slug if not provided
    const cleanSlug = slug
      ? slug.toLowerCase().replace(/[^a-z0-9-]/g, '').trim()
      : restaurantName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

    // Create owner user
    const owner = await User.create({
      name: ownerName,
      email: ownerEmail,
      password: ownerPassword,
      role: 'owner',
    });

    // Create Restaurant
    const restaurant = await Restaurant.create({
      owner: owner._id,
      name: restaurantName,
      slug: cleanSlug,
      customDomain: cleanDomain || undefined,
      address: address || 'Main City Area',
      contactNumber: contactNumber || '0000000000',
      tables: tables && tables.length ? tables : ['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5'],
      upiId: upiId || 'merchant@okaxis',
      branding: {
        primaryColor: primaryColor || '#4f46e5',
        secondaryColor: secondaryColor || '#312e81',
        accentColor: accentColor || '#06b6d4',
        tagline: 'Freshly Prepared, Served with Love',
        fontFamily: 'Inter',
      },
      features: features || {
        posTerminal: true,
        inventoryManagement: true,
        dineInOrdering: true,
        takeawayOrdering: true,
        corporateDelivery: true,
        offersAndPromos: true,
        onlinePayments: true,
        liveKitchenDisplay: true,
      },
      whiteLabel: {
        hidePlatformBranding: true,
        customFooterText: `© ${new Date().getFullYear()} ${restaurantName}. All rights reserved.`,
      },
      invoiceSettings: {
        businessLegalName: restaurantName,
        currency: '₹',
        invoiceFooterNote: `Thank you for choosing ${restaurantName}!`,
      },
    });

    // Create starter categories
    const starterCategory = await Category.create({
      owner: owner._id,
      name: 'Chef Specials',
    });

    // Create a sample dish so the menu isn't empty
    await Dish.create({
      owner: owner._id,
      category: starterCategory._id,
      name: 'Signature House Platter',
      description: 'Handcrafted signature dish made fresh on order.',
      price: 199,
      isVeg: true,
      isAvailable: true,
      image: '',
    });

    res.status(201).json({
      success: true,
      message: 'Client restaurant onboarded successfully',
      data: {
        restaurant,
        owner: {
          _id: owner._id,
          name: owner.name,
          email: owner.email,
        },
      },
    });
  } catch (error) {
    console.error('Agency create client error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update client details, status, or domain
// @route   PUT /api/agency/restaurants/:id
// @access  Private (SuperAdmin)
const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, customDomain, slug, status, address, contactNumber, upiId, branding, whiteLabel, invoiceSettings } =
      req.body;

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Client restaurant not found' });
    }

    if (customDomain !== undefined) {
      const cleanDomain = customDomain
        ? customDomain.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim()
        : '';

      if (cleanDomain) {
        const domainExists = await Restaurant.findOne({
          customDomain: cleanDomain,
          _id: { $ne: restaurant._id },
        });
        if (domainExists) {
          return res.status(400).json({
            success: false,
            message: `Custom domain "${cleanDomain}" is already in use by another restaurant.`,
          });
        }
      }
      restaurant.customDomain = cleanDomain;
    }

    if (slug !== undefined) {
      const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '').trim();
      if (cleanSlug) {
        const slugExists = await Restaurant.findOne({
          slug: cleanSlug,
          _id: { $ne: restaurant._id },
        });
        if (slugExists) {
          return res.status(400).json({
            success: false,
            message: `Slug "${cleanSlug}" is already in use.`,
          });
        }
        restaurant.slug = cleanSlug;
      }
    }

    if (name) restaurant.name = name;
    if (status) restaurant.status = status;
    if (address) restaurant.address = address;
    if (contactNumber) restaurant.contactNumber = contactNumber;
    if (upiId) restaurant.upiId = upiId;

    if (branding) {
      restaurant.branding = { ...restaurant.branding, ...branding };
    }
    if (whiteLabel) {
      restaurant.whiteLabel = { ...restaurant.whiteLabel, ...whiteLabel };
    }
    if (invoiceSettings) {
      restaurant.invoiceSettings = { ...restaurant.invoiceSettings, ...invoiceSettings };
    }
    if (req.body.features) {
      restaurant.features = { ...restaurant.features, ...req.body.features };
    }

    await restaurant.save();

    res.status(200).json({
      success: true,
      message: 'Client updated successfully',
      data: restaurant,
    });
  } catch (error) {
    console.error('Agency update client error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get DNS setup instructions for client's custom domain
// @route   GET /api/agency/dns-guide/:id
// @access  Private (SuperAdmin)
const getDnsGuide = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const hostDomain = process.env.BASE_HOST_DOMAIN || 'cname.yourserver.com';
    const serverIp = process.env.SERVER_PUBLIC_IP || 'YOUR_SERVER_IP';
    const clientDomain = restaurant.customDomain || 'order.clientdomain.com';

    const isSubdomain = clientDomain.split('.').length > 2;
    const hostRecord = isSubdomain ? clientDomain.split('.')[0] : '@';

    res.status(200).json({
      success: true,
      data: {
        restaurantName: restaurant.name,
        customDomain: restaurant.customDomain,
        dnsRecords: [
          {
            type: isSubdomain ? 'CNAME' : 'A',
            host: hostRecord,
            value: isSubdomain ? hostDomain : serverIp,
            ttl: '3600 (Auto)',
            notes: isSubdomain
              ? `Points ${clientDomain} to your centralized cluster (${hostDomain})`
              : `Root apex domain points to your server IP (${serverIp})`,
          },
        ],
        verificationCheckUrl: `https://${clientDomain}/api/restaurant/resolve-domain?domain=${clientDomain}`,
      },
    });
  } catch (error) {
    console.error('DNS guide error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete client restaurant and associated data
// @route   DELETE /api/agency/restaurants/:id
// @access  Private (SuperAdmin)
const deleteClient = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const ownerId = restaurant.owner;

    // Delete dishes, categories, orders, restaurant, and user
    await Dish.deleteMany({ owner: ownerId });
    await Category.deleteMany({ owner: ownerId });
    await Order.deleteMany({ restaurant: ownerId });
    await Restaurant.findByIdAndDelete(restaurant._id);
    if (ownerId) {
      await User.findByIdAndDelete(ownerId);
    }

    res.status(200).json({
      success: true,
      message: `Client "${restaurant.name}" and all associated data deleted successfully.`,
    });
  } catch (error) {
    console.error('Agency delete client error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Quick toggle client feature flags
// @route   PUT /api/agency/restaurants/:id/features
// @access  Private (SuperAdmin)
const updateClientFeatures = async (req, res) => {
  try {
    const { id } = req.params;
    const { features } = req.body;

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    restaurant.features = { ...restaurant.features, ...features };
    await restaurant.save();

    res.status(200).json({
      success: true,
      message: 'Client features updated successfully',
      data: restaurant.features,
    });
  } catch (error) {
    console.error('Update features error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Impersonate client owner to launch their portal
// @route   POST /api/agency/impersonate/:id
// @access  Private (SuperAdmin)
const impersonateClient = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate('owner');
    if (!restaurant || !restaurant.owner) {
      return res.status(404).json({ success: false, message: 'Restaurant owner not found' });
    }

    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: restaurant.owner._id },
      process.env.JWT_SECRET || 'supersecretjwtkeyforrestaurantqrmenusaas',
      { expiresIn: '12h' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: restaurant.owner._id,
        name: restaurant.owner.name,
        email: restaurant.owner.email,
        role: restaurant.owner.role,
      },
      restaurant: {
        _id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug,
        customDomain: restaurant.customDomain,
        branding: restaurant.branding,
        features: restaurant.features,
      },
    });
  } catch (error) {
    console.error('Impersonate client error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listClients,
  createClient,
  updateClient,
  updateClientFeatures,
  impersonateClient,
  getDnsGuide,
  deleteClient,
};

