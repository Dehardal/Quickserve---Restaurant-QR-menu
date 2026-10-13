const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// Configure Socket.IO
const io = socketio(server, {
  cors: {
    origin: '*', // Allow all origins for testing purposes
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Attach socketio instance to application so it is accessible in controllers
app.set('socketio', io);

// Middleware
app.use(cors());
// Set larger body limits to support base64 image uploads smoothly
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Socket.IO Room Joining and Handshakes
io.on('connection', (socket) => {
  console.log(`Socket Connected: ${socket.id}`);

  // Owner joins their custom room based on their User ID
  socket.on('join', (ownerId) => {
    if (ownerId) {
      socket.join(ownerId);
      console.log(`Socket ${socket.id} joined room: ${ownerId}`);
    }
  });

  // Customer table joins their specific room for live order & bill status
  socket.on('join_table', (data) => {
    if (data && data.tableNumber && data.restaurantId) {
      const tableRoom = `table_${data.tableNumber}_${data.restaurantId}`;
      socket.join(tableRoom);
      console.log(`Socket ${socket.id} joined table room: ${tableRoom}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket Disconnected: ${socket.id}`);
  });
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const dishRoutes = require('./routes/dishRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/orders', orderRoutes);

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Restaurant QR Menu SaaS API is healthy' });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT} (0.0.0.0)`);
});
