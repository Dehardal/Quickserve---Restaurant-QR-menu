const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../.env') });

const createOrUpdateSuperAdmin = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/qr-menu';

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB:', mongoUri);

    const email = process.argv[2] || 'admin@agency.com';
    const password = process.argv[3] || 'admin123456';
    const name = process.argv[4] || 'Developer Admin';

    let user = await User.findOne({ email });

    if (user) {
      user.role = 'superadmin';
      if (process.argv[3]) {
        user.password = password; // Will be hashed in pre-save hook
      }
      await user.save();
      console.log(`✓ Existing user "${email}" promoted to SuperAdmin role!`);
    } else {
      user = await User.create({
        name,
        email,
        password,
        role: 'superadmin',
      });
      console.log(`✓ New SuperAdmin user created successfully!`);
    }

    console.log('--------------------------------------------------');
    console.log('Super Admin Credentials:');
    console.log('Email:', email);
    console.log('Role:', user.role);
    console.log('Login at: /login -> Access Master Console at: /agency');
    console.log('--------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Error creating SuperAdmin:', error.message);
    process.exit(1);
  }
};

createOrUpdateSuperAdmin();
