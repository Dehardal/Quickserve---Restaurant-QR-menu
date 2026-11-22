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
    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    customDomain: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
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
    companies: [
      {
        name: { type: String, required: true },
        address: { type: String, default: '' },
        contactPerson: { type: String, default: '' },
        phone: { type: String, default: '' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    upiId: {
      type: String,
      default: 'merchant@okaxis',
    },
    // White-Label & Client Custom Branding
    branding: {
      primaryColor: {
        type: String,
        default: '#4f46e5', // Brand Primary
      },
      secondaryColor: {
        type: String,
        default: '#312e81', // Brand Secondary
      },
      accentColor: {
        type: String,
        default: '#06b6d4', // Brand Accent
      },
      tagline: {
        type: String,
        default: 'Scan, Order & Savor',
      },
      banner: {
        type: String,
        default: '',
      },
      favicon: {
        type: String,
        default: '',
      },
      fontFamily: {
        type: String,
        default: 'Inter',
      },
    },
    // Feature Flags & Module Entitlements per Client
    features: {
      posTerminal: {
        type: Boolean,
        default: true,
      },
      inventoryManagement: {
        type: Boolean,
        default: true,
      },
      dineInOrdering: {
        type: Boolean,
        default: true,
      },
      takeawayOrdering: {
        type: Boolean,
        default: true,
      },
      corporateDelivery: {
        type: Boolean,
        default: true,
      },
      offersAndPromos: {
        type: Boolean,
        default: true,
      },
      onlinePayments: {
        type: Boolean,
        default: true,
      },
      liveKitchenDisplay: {
        type: Boolean,
        default: true,
      },
    },
    whiteLabel: {
      hidePlatformBranding: {
        type: Boolean,
        default: true,
      },
      customFooterText: {
        type: String,
        default: '',
      },
      poweredByText: {
        type: String,
        default: '',
      },
      poweredByUrl: {
        type: String,
        default: '',
      },
    },
    invoiceSettings: {
      businessLegalName: {
        type: String,
        default: '',
      },
      gstNumber: {
        type: String,
        default: '',
      },
      fssaiNumber: {
        type: String,
        default: '',
      },
      invoiceFooterNote: {
        type: String,
        default: 'Thank you for dining with us! Please visit again.',
      },
      currency: {
        type: String,
        default: '₹',
      },
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'maintenance'],
      default: 'active',
    },
    // Cashfree Payment Gateway Settings
    cashfreeAppId: {
      type: String,
      default: '',
    },
    cashfreeSecretKey: {
      type: String,
      default: '',
    },
    cashfreeEnvironment: {
      type: String,
      enum: ['sandbox', 'production'],
      default: 'sandbox',
    },
    cashfreeEnabled: {
      type: Boolean,
      default: true,
    },
    // Developer / Platform Fee Split Settings (Easy Split)
    developerSplitEnabled: {
      type: Boolean,
      default: false,
    },
    developerSplitVendorId: {
      type: String,
      default: '',
    },
    developerSplitPercentage: {
      type: Number,
      default: 5, // e.g. 5% developer cut
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Helper to sanitize slug
RestaurantSchema.pre('save', function (next) {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  if (this.customDomain) {
    // Normalize custom domain: remove http://, https://, trailing slash, and lowercase
    this.customDomain = this.customDomain
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '')
      .trim();
  }
  next();
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);
