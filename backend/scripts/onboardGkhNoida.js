const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Category = require('../models/Category');
const Dish = require('../models/Dish');

// High-resolution SVG Data URI of the GKH NOIDA circular seal logo
const gkhLogoSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="%23262626"/>
      <stop offset="70%" stop-color="%23171717"/>
      <stop offset="100%" stop-color="%230a0a0a"/>
    </radialGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23fef08a"/>
      <stop offset="30%" stop-color="%23f59e0b"/>
      <stop offset="70%" stop-color="%23d97706"/>
      <stop offset="100%" stop-color="%23b45309"/>
    </linearGradient>
    <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23ef4444"/>
      <stop offset="100%" stop-color="%23991b1b"/>
    </linearGradient>
  </defs>
  <!-- Outer Decorative Ring -->
  <circle cx="200" cy="200" r="192" fill="%23171717" stroke="url(%23goldGrad)" stroke-width="7"/>
  <circle cx="200" cy="200" r="178" fill="none" stroke="%23991b1b" stroke-width="4" stroke-dasharray="6,4"/>
  <circle cx="200" cy="200" r="168" fill="url(%23bgGrad)" stroke="url(%23goldGrad)" stroke-width="3"/>
  
  <!-- Arched Top Banner Text -->
  <path id="curveTop" d="M 60 200 A 140 140 0 0 1 340 200" fill="none"/>
  <text fill="url(%23goldGrad)" font-size="20" font-family="Arial, sans-serif" font-weight="900" letter-spacing="3">
    <textPath href="%23curveTop" startOffset="50%" text-anchor="middle">
      PURE PUNJABI TASTE
    </textPath>
  </text>
  
  <!-- Central Badge with GKH -->
  <rect x="70" y="125" width="260" height="115" rx="20" fill="%230a0a0a" stroke="url(%23goldGrad)" stroke-width="3"/>
  <text x="200" y="195" font-family="Arial Black, Impact, sans-serif" font-size="62" font-weight="900" fill="url(%23goldGrad)" text-anchor="middle" letter-spacing="4">
    GKH
  </text>
  <!-- NOIDA Ribbon inside badge -->
  <rect x="110" y="210" width="180" height="26" rx="6" fill="url(%23redGrad)" stroke="url(%23goldGrad)" stroke-width="1.5"/>
  <text x="200" y="228" font-family="Arial, sans-serif" font-size="16" font-weight="900" fill="%23ffffff" text-anchor="middle" letter-spacing="5">
    NOIDA
  </text>
  
  <!-- Arched Bottom Banner Text -->
  <path id="curveBottom" d="M 50 200 A 150 150 0 0 0 350 200" fill="none"/>
  <text fill="url(%23goldGrad)" font-size="18" font-family="Arial, sans-serif" font-weight="900" letter-spacing="2">
    <textPath href="%23curveBottom" startOffset="50%" text-anchor="middle">
      VEG &amp; NON-VEG Family Restaurant
    </textPath>
  </text>
</svg>`;

const categoriesData = [
  {
    name: 'Tandoori Breads',
    dishes: [
      { name: 'Plain Tandoori Roti', price: 20, isVeg: true },
      { name: 'Butter Tandoori Roti', price: 30, isVeg: true },
      { name: 'Lachha Paratha', price: 80, isVeg: true },
      { name: 'Aloo Paratha', price: 99, isVeg: true },
      { name: 'Aloo Payaz Paratha', price: 120, isVeg: true },
      { name: 'Paneer Paratha', price: 150, isVeg: true },
      { name: 'Stuffed Paratha', price: 180, isVeg: true },
      { name: 'Missi Roti', price: 40, isVeg: true },
      { name: 'Plain Naan', price: 100, isVeg: true },
      { name: 'Butter Naan', price: 120, isVeg: true },
      { name: 'Garlic Naan', price: 150, isVeg: true },
      { name: 'Stuffed Naan', price: 180, isVeg: true },
      { name: 'Garlic Ajwain Naan', price: 180, isVeg: true },
      { name: 'Rumali Roti', price: 30, isVeg: true },
      { name: 'Chicken Keema Naan', price: 280, isVeg: false },
      { name: 'Chicken Egg Paratha', price: 300, isVeg: false },
    ],
  },
  {
    name: 'Salads & Papad',
    dishes: [
      { name: 'Onion Salad', price: 120, isVeg: true },
      { name: 'Tomato Salad', price: 120, isVeg: true },
      { name: 'Green Salad', price: 150, isVeg: true },
      { name: 'Cucumber Salad', price: 200, isVeg: true },
      { name: 'Papad', price: 50, isVeg: true },
      { name: 'Masala Papad', price: 100, isVeg: true },
      { name: 'Fried Masala Papad', price: 120, isVeg: true },
    ],
  },
  {
    name: 'Veg Rice & Biryani',
    dishes: [
      { name: 'Plain Rice', price: 120, isVeg: true },
      { name: 'Jeera Rice', price: 150, isVeg: true },
      { name: 'Veg Fried Rice', price: 250, isVeg: true },
      { name: 'Paneer Fried Rice', price: 250, isVeg: true },
      { name: 'Chilli Garlic Fried Rice', price: 280, isVeg: true },
      { name: 'Veg Schezwan Fried Rice', price: 280, isVeg: true },
      { name: 'Paneer Schezwan Rice', price: 250, isVeg: true },
      { name: 'Mushroom Fried Rice', price: 250, isVeg: true },
      { name: 'Veg Pulao', price: 200, isVeg: true },
      { name: 'Veg Biryani', price: 250, isVeg: true },
    ],
  },
  {
    name: 'Non-Veg Rice & Biryani',
    dishes: [
      { name: 'Egg Fried Rice', price: 220, isVeg: false },
      { name: 'Chicken Fried Rice', price: 280, isVeg: false },
      { name: 'Egg + Chicken Fried Rice', price: 280, isVeg: false },
      { name: 'Chicken Triple Schezwan Rice', price: 300, isVeg: false },
      { name: 'Chicken Schezwan Fried Rice', price: 280, isVeg: false },
      { name: 'Egg Biryani', price: 250, isVeg: false },
      { name: 'Chicken Biryani', price: 300, isVeg: false },
      { name: 'Chicken Pulao', price: 280, isVeg: false },
      { name: 'Mutton Pulao', price: 350, isVeg: false },
      { name: 'Mutton Biryani', price: 400, isVeg: false },
    ],
  },
  {
    name: 'Special Thalis',
    dishes: [
      {
        name: 'Normal Thali',
        description: 'Dal Tadka, Mix Veg, Boondi Raita, Jeera Rice, 4 Butter Roti, Papad, Salad, 1 Pc Sweet',
        price: 350,
        isVeg: true,
      },
      {
        name: 'GKH Special Thali',
        description: 'Dal Makhani, Paneer Lababdar, Boondi Raita, Veg Pulao, 2 Butter Naan, Papad, Salad, 1 Pc Sweet',
        price: 400,
        isVeg: true,
      },
      {
        name: 'Non-Veg Thali',
        description: '1 Pc Chicken Curry, 1 Pc Egg Curry, Jeera Rice, 4 Butter Tandoori Roti, Salad, Papad, 1 Pc Sweet',
        price: 400,
        isVeg: false,
      },
      {
        name: 'Chicken Special Thali',
        description: '1 Pc Butter Chicken, 1 Pc Egg Masala, 2 Butter Naan, Chicken Biryani, Plain Raita, Salad, Papad, 1 Pc Sweet',
        price: 480,
        isVeg: false,
      },
    ],
  },
  {
    name: 'Beverages & Shakes',
    dishes: [
      { name: 'Cold Coffee', price: 160, isVeg: true },
      { name: 'Cold Coffee with Ice Cream', price: 180, isVeg: true },
      { name: 'Kesar Badam Shake', price: 180, isVeg: true },
      { name: 'Kiwi Shake', price: 160, isVeg: true },
      { name: 'Chocolate Milk Shake', price: 160, isVeg: true },
      { name: 'Vanilla Milk Shake', price: 160, isVeg: true },
      { name: 'Strawberry Milk Shake', price: 160, isVeg: true },
      { name: 'Choco Oreo Milk Shake', price: 160, isVeg: true },
      { name: 'Kitkat Milk Shake', price: 160, isVeg: true },
      { name: 'Butter Scotch Milk Shake', price: 160, isVeg: true },
      { name: 'Chocolate Brownie Shake', price: 160, isVeg: true },
      { name: 'Pista Shake', price: 160, isVeg: true },
      { name: 'Black Currant Shake', price: 160, isVeg: true },
      { name: 'Blueberry Shake', price: 160, isVeg: true },
      { name: 'Litchi Shake', price: 160, isVeg: true },
    ],
  },
  {
    name: 'Mocktails',
    dishes: [
      { name: 'Classic Mint Mojito', price: 160, isVeg: true },
      { name: 'Blue Lagoon Mocktail', price: 160, isVeg: true },
      { name: 'Pink Bubble Gum', price: 160, isVeg: true },
      { name: 'Fruit Beer', price: 160, isVeg: true },
      { name: 'Green Apple', price: 160, isVeg: true },
      { name: 'Water Melon', price: 160, isVeg: true },
      { name: 'Masala Lemon Soda', price: 160, isVeg: true },
      { name: 'Shikanji', price: 160, isVeg: true },
      { name: 'Cola Jeera', price: 160, isVeg: true },
      { name: 'Peach Ice Tea', price: 160, isVeg: true },
      { name: 'Lemon Ice Tea', price: 160, isVeg: true },
    ],
  },
  {
    name: 'Desserts',
    dishes: [
      { name: 'Gulab Jamun (1 Pc)', price: 40, isVeg: true },
      { name: 'Rasgulla (1 Pc)', price: 40, isVeg: true },
      { name: 'Special Kheer', price: 99, isVeg: true },
    ],
  },
  {
    name: 'Soups & Thukpa',
    dishes: [
      { name: 'Cream of Tomato Soup', price: 150, isVeg: true },
      { name: 'Veg Sweet Corn Soup', price: 200, isVeg: true },
      { name: 'Veg Manchow Soup', price: 180, isVeg: true },
      { name: 'Hot & Sour Soup', price: 200, isVeg: true },
      { name: 'Chicken Clear Soup', price: 220, isVeg: false },
      { name: 'Chicken Manchow Soup', price: 250, isVeg: false },
      { name: 'Mushroom Soup', price: 220, isVeg: true },
      { name: 'Veg Thukpa', price: 250, isVeg: true },
      { name: 'Chicken Thukpa', price: 300, isVeg: false },
    ],
  },
  {
    name: 'Veg Chinese Snacks',
    dishes: [
      { name: 'Veg Manchurian', price: 220, isVeg: true },
      { name: 'Chilli Paneer', price: 320, isVeg: true },
      { name: 'Chilli Potato', price: 250, isVeg: true },
      { name: 'Honey Chili Potato', price: 280, isVeg: true },
      { name: 'Mushroom Chili', price: 300, isVeg: true },
      { name: 'Veg Spring Roll', price: 300, isVeg: true },
      { name: 'French Fries', price: 200, isVeg: true },
      { name: 'Crispy Baby Corn', price: 300, isVeg: true },
      { name: 'Chilli Garlic Baby Corn', price: 350, isVeg: true },
      { name: 'Peri Peri Masala Fries', price: 250, isVeg: true },
    ],
  },
  {
    name: 'Non-Veg Chinese Snacks',
    dishes: [
      { name: 'Chilli Chicken', price: 350, isVeg: false },
      { name: 'Chicken Manchurian', price: 400, isVeg: false },
      { name: 'Chicken 65', price: 350, isVeg: false },
      { name: 'Chilli Garlic Chicken', price: 350, isVeg: false },
      { name: 'Chicken Lollipop', price: 600, isVeg: false },
    ],
  },
  {
    name: 'Noodles & Pasta',
    dishes: [
      { name: 'Veg Noodles', price: 200, isVeg: true },
      { name: 'Chilli Garlic Noodles', price: 220, isVeg: true },
      { name: 'Hakka Noodles', price: 220, isVeg: true },
      { name: 'Paneer Chowmein', price: 230, isVeg: true },
      { name: 'Singapuri Chowmein', price: 250, isVeg: true },
      { name: 'Veg Schezwan Noodles', price: 250, isVeg: true },
      { name: 'Paneer Schezwan Noodles', price: 250, isVeg: true },
      { name: 'Paneer Noodles', price: 220, isVeg: true },
      { name: 'Egg Noodles', price: 220, isVeg: false },
      { name: 'Egg + Chicken Noodles', price: 250, isVeg: false },
      { name: 'Chicken Hakka Noodles', price: 250, isVeg: false },
      { name: 'Chicken Singapuri Noodles', price: 250, isVeg: false },
      { name: 'Chicken Egg Schezwan Noodles', price: 250, isVeg: false },
      { name: 'White Sauce Pasta', price: 300, isVeg: true },
      { name: 'Red Sauce Pasta', price: 300, isVeg: true },
      { name: 'Mix Sauce Pasta with Extra Cheese', price: 350, isVeg: true },
    ],
  },
  {
    name: 'Tandoori Chaap & Tikka (Veg)',
    dishes: [
      { name: 'Masala Chaap', price: 300, isVeg: true },
      { name: 'Malai Chaap', price: 350, isVeg: true },
      { name: 'Achari Chaap', price: 300, isVeg: true },
      { name: 'Afgani Chaap', price: 350, isVeg: true },
      { name: 'Lemon Chaap', price: 350, isVeg: true },
      { name: 'Garlic Chaap', price: 350, isVeg: true },
      { name: 'Stuffed Masala Chaap', price: 400, isVeg: true },
      { name: 'Paneer Tikka', price: 450, isVeg: true },
      { name: 'Paneer Malai Tikka', price: 450, isVeg: true },
      { name: 'Mushroom Masala Tikka', price: 450, isVeg: true },
      { name: 'Paneer Tandoori Chatpata', price: 400, isVeg: true },
      { name: 'Mushroom Malai Tikka', price: 350, isVeg: true },
    ],
  },
  {
    name: 'Tandoori Non-Veg',
    dishes: [
      { name: 'Tandoori Chicken (Half 4 Pcs)', price: 300, isVeg: false },
      { name: 'Tandoori Chicken (Full 8 Pcs)', price: 590, isVeg: false },
      { name: 'Chicken Tikka', price: 590, isVeg: false },
      { name: 'Chicken Malai Tikka', price: 650, isVeg: false },
      { name: 'Chicken Seekh Kabab', price: 600, isVeg: false },
      { name: 'Mutton Seekh Kabab', price: 700, isVeg: false },
      { name: 'Chicken Tangri Kabab', price: 750, isVeg: false },
    ],
  },
  {
    name: 'Rolls',
    dishes: [
      { name: 'Veg Roll', price: 200, isVeg: true },
      { name: 'Paneer Tikka Roll', price: 220, isVeg: true },
      { name: 'Chilli Paneer Roll', price: 250, isVeg: true },
      { name: 'Masala Chaap Roll', price: 210, isVeg: true },
      { name: 'Afgani Chaap Roll', price: 220, isVeg: true },
      { name: 'Malai Chaap Roll', price: 250, isVeg: true },
      { name: 'Malai Paneer Tikka Roll', price: 250, isVeg: true },
      { name: 'Achari Chaap Roll', price: 230, isVeg: true },
      { name: 'Egg Masala Roll', price: 250, isVeg: false },
      { name: 'Chicken Egg Roll', price: 280, isVeg: false },
      { name: 'Chicken Tikka Masala Roll', price: 280, isVeg: false },
      { name: 'Chicken Masala Roll', price: 280, isVeg: false },
      { name: 'Chicken Malai Special Roll', price: 300, isVeg: false },
    ],
  },
  {
    name: 'Veg Main Course',
    dishes: [
      { name: 'Dal Fry', price: 199, isVeg: true },
      { name: 'Dal Tadka', price: 220, isVeg: true },
      { name: 'Dal Makhani', price: 250, isVeg: true },
      { name: 'Paneer Butter Masala', price: 350, isVeg: true },
      { name: 'Paneer Pasanda', price: 400, isVeg: true },
      { name: 'Paneer Patiala', price: 450, isVeg: true },
      { name: 'Handi Special Paneer', price: 400, isVeg: true },
      { name: 'Kadhai Paneer', price: 400, isVeg: true },
      { name: 'Shahi Paneer', price: 350, isVeg: true },
      { name: 'Paneer Tikka Masala', price: 450, isVeg: true },
      { name: 'Malai Paneer Tikka Masala', price: 500, isVeg: true },
      { name: 'Butter Chaap Masala', price: 350, isVeg: true },
      { name: 'Afgani Malai Chaap Masala', price: 400, isVeg: true },
      { name: 'Paneer Bhurji', price: 400, isVeg: true },
      { name: 'Mutter Mushroom', price: 350, isVeg: true },
      { name: 'Mushroom Baby Corn', price: 400, isVeg: true },
      { name: 'Methi Malai Matar', price: 400, isVeg: true },
      { name: 'Chana Masala', price: 300, isVeg: true },
      { name: 'Mix Veg', price: 300, isVeg: true },
      { name: 'Aloo Gobhi', price: 280, isVeg: true },
      { name: 'Veg Kolhapuri', price: 300, isVeg: true },
      { name: 'Paneer Do Pyaza', price: 350, isVeg: true },
      { name: 'Mushroom Do Pyaza', price: 300, isVeg: true },
      { name: 'Kadhai Mushroom Adraki', price: 350, isVeg: true },
      { name: 'Palak Baby Corn Masala', price: 350, isVeg: true },
    ],
  },
  {
    name: 'Non-Veg Main Course (Chicken)',
    dishes: [
      { name: 'Chicken Curry (Homestyle) Half', price: 350, isVeg: false },
      { name: 'Chicken Curry (Homestyle) Full', price: 700, isVeg: false },
      { name: 'Handi Special Chicken Half', price: 400, isVeg: false },
      { name: 'Handi Special Chicken Full', price: 800, isVeg: false },
      { name: 'Kadhai Chicken Half', price: 400, isVeg: false },
      { name: 'Kadhai Chicken Full', price: 800, isVeg: false },
      { name: 'Butter Chicken Half', price: 450, isVeg: false },
      { name: 'Butter Chicken Full', price: 900, isVeg: false },
      { name: 'Butter Chicken (Boneless) Half', price: 480, isVeg: false },
      { name: 'Butter Chicken (Boneless) Full', price: 950, isVeg: false },
      { name: 'Chicken Tikka Masala Half', price: 500, isVeg: false },
      { name: 'Chicken Tikka Masala Full', price: 980, isVeg: false },
      { name: 'Tawa Special Chicken Half', price: 450, isVeg: false },
      { name: 'Tawa Special Chicken Full', price: 900, isVeg: false },
      { name: 'Chicken Keema Masala Half', price: 480, isVeg: false },
      { name: 'Chicken Keema Masala Full', price: 950, isVeg: false },
      { name: 'Chicken Keema Kaleji Half', price: 450, isVeg: false },
      { name: 'Chicken Keema Kaleji Full', price: 900, isVeg: false },
      { name: 'Chicken Mughlai Half', price: 450, isVeg: false },
      { name: 'Chicken Mughlai Full', price: 900, isVeg: false },
      { name: 'Chicken Seekh Kabab Curry Half', price: 480, isVeg: false },
      { name: 'Chicken Seekh Kabab Curry Full', price: 950, isVeg: false },
    ],
  },
  {
    name: 'Non-Veg Main Course (Mutton)',
    dishes: [
      { name: 'Mutton Curry (Home Style) Half', price: 450, isVeg: false },
      { name: 'Mutton Curry (Home Style) Full', price: 900, isVeg: false },
      { name: 'Handi Special Mutton Half', price: 500, isVeg: false },
      { name: 'Handi Special Mutton Full', price: 990, isVeg: false },
      { name: 'Kadhai Masala Mutton Half', price: 500, isVeg: false },
      { name: 'Kadhai Masala Mutton Full', price: 990, isVeg: false },
      { name: 'Mutton Nihari Half', price: 500, isVeg: false },
      { name: 'Mutton Nihari Full', price: 990, isVeg: false },
      { name: 'Mutton Keema Kaleji Half', price: 550, isVeg: false },
      { name: 'Mutton Keema Kaleji Full', price: 1000, isVeg: false },
      { name: 'Mutton Bhuna Masala Half', price: 500, isVeg: false },
      { name: 'Mutton Bhuna Masala Full', price: 990, isVeg: false },
      { name: 'Mutton Lal Maas Half', price: 500, isVeg: false },
      { name: 'Mutton Lal Maas Full', price: 990, isVeg: false },
      { name: 'Mutton Seekh Kabab Curry Half', price: 500, isVeg: false },
      { name: 'Mutton Seekh Kabab Curry Full', price: 990, isVeg: false },
    ],
  },
  {
    name: 'Egg Main Course',
    dishes: [
      { name: 'Egg Bhurji', price: 200, isVeg: false },
      { name: 'Egg Omelet', price: 150, isVeg: false },
      { name: 'Egg Curry', price: 250, isVeg: false },
      { name: 'Egg Masala', price: 300, isVeg: false },
      { name: 'Egg Afgani Masala', price: 300, isVeg: false },
      { name: 'Egg Keema Masala', price: 350, isVeg: false },
      { name: 'Egg Butter Masala', price: 350, isVeg: false },
      { name: 'Egg Bhuna Masala', price: 350, isVeg: false },
    ],
  },
  {
    name: 'Raita & Dahi',
    dishes: [
      { name: 'Plain Dahi', price: 120, isVeg: true },
      { name: 'Boondi Raita', price: 150, isVeg: true },
      { name: 'Veg Raita', price: 150, isVeg: true },
      { name: 'Pineapple Raita', price: 200, isVeg: true },
      { name: 'Mix Fruit Raita', price: 250, isVeg: true },
    ],
  },
];

async function run() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB.');

    const email = 'gharkihandi.noida@gmail.com';
    const password = 'GkhNoida@2026';
    const restaurantName = 'Ghar Ki Handi (GKH NOIDA)';
    const contactNumber = '9354607606';
    const address = 'Ground Floor Village Hoshiyarpur, JJ Colony, CRS Tower, Opposite Metro Pillar No.- 233, Khasra No.- 495 M, Sec-52, Noida - 201301';
    const slug = 'gkh-noida';
    const customDomain = 'order.gharkihandi.com';

    // 1. Create or Find User
    let user = await User.findOne({ email });
    if (!user) {
      console.log('Creating new owner user for Ghar Ki Handi...');
      user = await User.create({
        name: 'Ghar Ki Handi Management',
        email,
        password, // Mongoose pre-save hook will hash this
        role: 'owner',
      });
      console.log(`Created User with ID: ${user._id}`);
    } else {
      console.log(`User already exists (${user.email}). Updating password...`);
      user.password = password;
      await user.save();
    }

    // 2. Create or Update Restaurant
    let restaurant = await Restaurant.findOne({ owner: user._id });
    const restaurantData = {
      owner: user._id,
      name: restaurantName,
      slug,
      customDomain,
      logo: gkhLogoSvg,
      address,
      contactNumber,
      openingHours: '11:00 AM - 11:30 PM',
      upiId: '9354607606@paytm',
      tables: Array.from({ length: 15 }, (_, i) => `Table ${i + 1}`),
      branding: {
        primaryColor: '#b91c1c',   // Deep Tandoori Crimson / Punjabi Red
        secondaryColor: '#1c1917', // Rich Handi Cast Iron Charcoal
        accentColor: '#f59e0b',    // Golden Saffron / Amber
        tagline: 'Pure Punjabi Taste · Veg & Non-Veg Family Restaurant',
        fontFamily: 'Inter',
      },
      features: {
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
        customFooterText: '© Ghar Ki Handi Family Restaurant. All rights reserved.',
        poweredByText: 'Ghar Ki Handi Noida',
        poweredByUrl: 'https://gharkihandi.com',
      },
      invoiceSettings: {
        businessLegalName: 'Ghar Ki Handi Family Restaurant',
        gstNumber: '',
        fssaiNumber: '',
        invoiceFooterNote: 'Thank you for dining with Ghar Ki Handi! Visit again for Pure Punjabi Taste.',
        currency: '₹',
      },
      status: 'active',
    };

    if (!restaurant) {
      console.log('Creating Restaurant profile...');
      restaurant = await Restaurant.create(restaurantData);
      console.log(`Created Restaurant with ID: ${restaurant._id}`);
    } else {
      console.log('Updating existing Restaurant profile...');
      Object.assign(restaurant, restaurantData);
      await restaurant.save();
    }

    // 3. Clear existing dishes & categories for this owner to seed clean fresh menu
    await Dish.deleteMany({ owner: user._id });
    await Category.deleteMany({ owner: user._id });
    console.log('Cleaned old menu data for Ghar Ki Handi.');

    // 4. Insert Categories & Dishes
    let totalDishesCount = 0;
    for (const catData of categoriesData) {
      const category = await Category.create({
        owner: user._id,
        name: catData.name,
      });

      const dishesToInsert = catData.dishes.map((dish) => ({
        owner: user._id,
        category: category._id,
        name: dish.name,
        description: dish.description || '',
        price: dish.price,
        isVeg: dish.isVeg,
        isAvailable: true,
        trackStock: false,
        stockQuantity: 50,
      }));

      await Dish.insertMany(dishesToInsert);
      totalDishesCount += dishesToInsert.length;
      console.log(`✓ Inserted category "${catData.name}" with ${dishesToInsert.length} dishes.`);
    }

    console.log(`\n========================================`);
    console.log(`🎉 ONBOARDING COMPLETED SUCCESSFULLY!`);
    console.log(`Restaurant Name: ${restaurant.name}`);
    console.log(`Slug / Preview: /menu/${restaurant.slug}`);
    console.log(`Custom Domain: https://${restaurant.customDomain}`);
    console.log(`Total Categories: ${categoriesData.length}`);
    console.log(`Total Dishes Inserted: ${totalDishesCount}`);
    console.log(`Owner Login Email: ${email}`);
    console.log(`Owner Login Password: ${password}`);
    console.log(`Primary Color: #b91c1c (Tandoori Crimson)`);
    console.log(`Secondary Color: #1c1917 (Handi Charcoal)`);
    console.log(`Accent Color: #f59e0b (Saffron Gold)`);
    console.log(`========================================\n`);

    process.exit(0);
  } catch (err) {
    console.error('Error during onboarding:', err);
    process.exit(1);
  }
}

run();
