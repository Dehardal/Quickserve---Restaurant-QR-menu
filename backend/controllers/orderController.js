const Order = require('../models/Order');
const Dish = require('../models/Dish');
const Restaurant = require('../models/Restaurant');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');

// @desc    Place a new order (Public for customer menu scanning QR)
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res) => {
  try {
    const { 
      restaurantId, 
      tableNumber, 
      tableToken, 
      customerName, 
      customerMobile, 
      specialInstructions, 
      items,
      paymentMethod,
      paymentStatus,
      transactionId
    } = req.body;

    if (!restaurantId || !tableNumber || !customerName || !customerMobile || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Verify cryptographic table authorization if tableToken is provided
    if (tableToken) {
      try {
        const decoded = jwt.verify(tableToken, process.env.JWT_SECRET || 'supersecretjwtkeyforrestaurantqrmenusaas');
        if (decoded.restaurantId !== restaurantId || decoded.tableNumber !== tableNumber) {
          return res.status(403).json({
            success: false,
            message: `Security Warning: Unauthorized table order. QR authorization does not match ${tableNumber}.`,
          });
        }
      } catch (tokenErr) {
        return res.status(403).json({
          success: false,
          message: 'Security Warning: Invalid or expired table QR authorization token.',
        });
      }
    }

    // Verify restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Calculate subtotal and populate items
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const dish = await Dish.findById(item.dish);
      if (!dish) {
        return res.status(400).json({ success: false, message: `Dish with ID ${item.dish} not found` });
      }
      if (!dish.isAvailable) {
        return res.status(400).json({ success: false, message: `Dish ${dish.name} is currently unavailable` });
      }

      const itemPrice = dish.price;
      const quantity = Number(item.quantity);
      subtotal += itemPrice * quantity;

      orderItems.push({
        dish: dish._id,
        name: dish.name,
        price: itemPrice,
        quantity,
      });
    }

    const isPaidOnline = paymentStatus === 'paid' || paymentMethod === 'upi_online';
    const finalPaymentMethod = isPaidOnline ? 'upi' : (paymentMethod || 'cash');
    const finalPaymentStatus = isPaidOnline ? 'paid' : 'pending';

    // Create the order
    const order = await Order.create({
      restaurant: restaurant.owner, // store owner id to tie to Dashboard
      tableNumber,
      customerName,
      customerMobile,
      specialInstructions: specialInstructions || '',
      items: orderItems,
      subtotal,
      status: 'pending',
      paymentMethod: finalPaymentMethod,
      paymentStatus: finalPaymentStatus,
      transactionId: isPaidOnline ? (transactionId || 'UPI-' + Date.now()) : '',
      paidAt: isPaidOnline ? new Date() : null,
    });

    const populatedOrder = await Order.findById(order._id).populate('items.dish');

    // Emit Real-Time Order Socket Event to Owner Room
    const io = req.app.get('socketio');
    if (io) {
      // Room name is owner's user ID
      const ownerRoom = restaurant.owner.toString();
      io.to(ownerRoom).emit('new_order', populatedOrder);
      console.log(`Socket event 'new_order' emitted to room: ${ownerRoom}`);
    } else {
      console.warn('Socket.IO instance not found on Express app');
    }

    res.status(201).json({ success: true, data: populatedOrder });
  } catch (error) {
    console.error('Create order error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders for the logged-in owner
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ restaurant: req.user._id })
      .populate('items.dish')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    console.error('Fetch orders error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['pending', 'accepted', 'served', 'completed', 'paid'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing status' });
    }

    let order = await Order.findById(req.params.id).populate('items.dish');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify order belongs to owner
    if (order.restaurant.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to edit this order' });
    }

    order.status = status;
    if (status === 'paid' && order.paymentMethod === 'unpaid') {
      order.paymentMethod = req.body.paymentMethod || 'cash';
    }
    await order.save();

    // Broadcast status change to owner and table room
    const io = req.app.get('socketio');
    if (io) {
      const ownerRoom = req.user._id.toString();
      io.to(ownerRoom).emit('order_status_updated', order);
      io.to(`table_${order.tableNumber}_${order.restaurant}`).emit('table_order_updated', order);
      io.to(`order_${order._id}`).emit('table_order_updated', order);
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error('Update order status error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get active orders & running bill for a specific verified table
// @route   GET /api/orders/table
// @access  Public (Table verified)
const getTableOrders = async (req, res) => {
  try {
    const { restaurantId, tableNumber, tableToken } = req.query;

    if (!restaurantId || !tableNumber) {
      return res.status(400).json({ success: false, message: 'Restaurant and table number are required.' });
    }

    // Verify cryptographic table authorization if tableToken is present
    if (tableToken) {
      try {
        const decoded = jwt.verify(tableToken, process.env.JWT_SECRET || 'supersecretjwtkeyforrestaurantqrmenusaas');
        if (decoded.restaurantId !== restaurantId || decoded.tableNumber !== tableNumber) {
          return res.status(403).json({ success: false, message: 'Unauthorized table access.' });
        }
      } catch (e) {
        return res.status(403).json({ success: false, message: 'Invalid table session token.' });
      }
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Fetch active orders for this table in the last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const orders = await Order.find({
      restaurant: restaurant.owner,
      tableNumber,
      createdAt: { $gte: yesterday },
    })
      .populate('items.dish')
      .sort({ createdAt: -1 });

    // Calculate itemized table subtotal
    const subtotal = orders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
    const taxRate = 0.05; // 5% GST standard
    const taxAmount = Number((subtotal * taxRate).toFixed(2));
    const grandTotal = Number((subtotal + taxAmount).toFixed(2));

    const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
    const pendingOrders = orders.filter(o => o.paymentStatus !== 'paid');
    const paidAmount = paidOrders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
    const pendingAmount = pendingOrders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
    const isFullyPaid = orders.length > 0 && pendingOrders.length === 0;

    res.status(200).json({
      success: true,
      data: orders,
      bill: {
        tableNumber,
        subtotal,
        taxRate: 5,
        taxAmount,
        grandTotal,
        currency: '₹',
        hasPendingOrders: orders.some(o => o.status === 'pending' || o.status === 'accepted'),
        isPaid: isFullyPaid,
        paidAmount: Number((paidAmount * 1.05).toFixed(2)),
        pendingAmount: Number((pendingAmount * 1.05).toFixed(2)),
        billRequested: orders.some(o => o.billRequested),
        restaurantUpiId: restaurant.upiId || 'merchant@okaxis',
        restaurantName: restaurant.name,
      },
    });
  } catch (error) {
    console.error('Fetch table orders error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order payment status (e.g. staff marks cash received or online payment confirms)
// @route   PUT /api/orders/:id/payment
// @access  Public
const updateOrderPayment = async (req, res) => {
  try {
    const { paymentStatus, paymentMethod, transactionId } = req.body;
    let order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.paymentStatus = paymentStatus || 'paid';
    if (paymentMethod) order.paymentMethod = paymentMethod;
    if (order.paymentStatus === 'paid') {
      order.paidAt = new Date();
      order.transactionId = transactionId || 'TXN-' + Date.now();
    }
    await order.save();

    // Broadcast to owner and table room
    const io = req.app.get('socketio');
    if (io) {
      const ownerRoom = order.restaurant.toString();
      io.to(ownerRoom).emit('order_payment_updated', order);
      io.to(`table_${order.tableNumber}_${order.restaurant}`).emit('table_order_updated', order);
      io.to(`order_${order._id}`).emit('table_order_updated', order);
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Settle all active orders for a table (marks all pending items as paid)
// @route   POST /api/orders/table/settle
// @access  Public
const settleTableBill = async (req, res) => {
  try {
    const { restaurantId, tableNumber, tableToken, paymentMethod, transactionId } = req.body;

    if (!restaurantId || !tableNumber) {
      return res.status(400).json({ success: false, message: 'Restaurant and table number required' });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const result = await Order.updateMany(
      {
        restaurant: restaurant.owner,
        tableNumber,
        createdAt: { $gte: yesterday },
        paymentStatus: { $ne: 'paid' },
      },
      {
        $set: {
          paymentStatus: 'paid',
          paymentMethod: paymentMethod || 'cash',
          paidAt: new Date(),
          transactionId: transactionId || 'SETTLE-' + Date.now(),
        },
      }
    );

    const io = req.app.get('socketio');
    if (io) {
      const ownerRoom = restaurant.owner.toString();
      io.to(ownerRoom).emit('table_payment_settled', {
        tableNumber,
        paymentMethod: paymentMethod || 'cash',
        timestamp: new Date(),
      });
      io.to(`table_${tableNumber}_${restaurant.owner}`).emit('table_order_updated', {});
    }

    res.status(200).json({ 
      success: true, 
      message: `Table ${tableNumber} bill settled successfully!`, 
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate printable / downloadable invoice data with embedded payment UPI QR code
// @route   GET /api/orders/:id/invoice
// @access  Public
const getOrderInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.dish');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const restaurant = await Restaurant.findOne({ owner: order.restaurant });
    const taxAmount = Number((order.subtotal * 0.05).toFixed(2));
    const grandTotal = Number((order.subtotal + taxAmount).toFixed(2));

    // Generate UPI string and QR code:
    // Format: upi://pay?pa=<upiId>&pn=<name>&am=<amount>&tn=<note>&cu=INR
    const upiId = restaurant?.upiId || 'merchant@okaxis';
    const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(restaurant?.name || 'Restaurant')}&am=${grandTotal}&tn=${encodeURIComponent('Table_' + order.tableNumber + '_Order_' + order._id.toString().slice(-4))}&cu=INR`;
    
    const upiQrCodeUrl = await QRCode.toDataURL(upiString, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 180,
    });

    res.status(200).json({
      success: true,
      data: {
        order,
        restaurant: {
          name: restaurant?.name || 'Restaurant',
          address: restaurant?.address || '',
          contactNumber: restaurant?.contactNumber || '',
          upiId: upiId,
        },
        billing: {
          subtotal: order.subtotal,
          cgst: Number((taxAmount / 2).toFixed(2)),
          sgst: Number((taxAmount / 2).toFixed(2)),
          taxAmount,
          grandTotal,
        },
        upiQrCodeUrl,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Request bill / settlement for a table
// @route   POST /api/orders/request-bill
// @access  Public (Table verified)
const requestTableBill = async (req, res) => {
  try {
    const { restaurantId, tableNumber, tableToken, paymentMethod } = req.body;

    if (!restaurantId || !tableNumber) {
      return res.status(400).json({ success: false, message: 'Restaurant and table number are required.' });
    }

    if (tableToken) {
      try {
        const decoded = jwt.verify(tableToken, process.env.JWT_SECRET || 'supersecretjwtkeyforrestaurantqrmenusaas');
        if (decoded.restaurantId !== restaurantId || decoded.tableNumber !== tableNumber) {
          return res.status(403).json({ success: false, message: 'Unauthorized table access.' });
        }
      } catch (e) {
        return res.status(403).json({ success: false, message: 'Invalid table session token.' });
      }
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const orders = await Order.find({
      restaurant: restaurant.owner,
      tableNumber,
      createdAt: { $gte: yesterday },
    });

    if (orders.length === 0) {
      return res.status(400).json({ success: false, message: 'No active orders found for this table to generate a bill.' });
    }

    // Mark orders with bill requested
    await Order.updateMany(
      {
        restaurant: restaurant.owner,
        tableNumber,
        createdAt: { $gte: yesterday },
      },
      {
        $set: {
          billRequested: true,
          paymentMethod: paymentMethod || 'cash',
        },
      }
    );

    const subtotal = orders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
    const taxAmount = Number((subtotal * 0.05).toFixed(2));
    const grandTotal = Number((subtotal + taxAmount).toFixed(2));

    // Emit live bill request notification to owner's dashboard
    const io = req.app.get('socketio');
    if (io) {
      const ownerRoom = restaurant.owner.toString();
      io.to(ownerRoom).emit('table_bill_requested', {
        tableNumber,
        paymentMethod: paymentMethod || 'cash',
        subtotal,
        taxAmount,
        grandTotal,
        orderCount: orders.length,
        timestamp: new Date(),
      });
      console.log(`Socket event 'table_bill_requested' emitted for ${tableNumber}`);
    }

    res.status(200).json({
      success: true,
      message: `Bill requested for ${tableNumber}. Staff will attend your table shortly.`,
      bill: {
        tableNumber,
        paymentMethod: paymentMethod || 'cash',
        subtotal,
        taxAmount,
        grandTotal,
        billRequested: true,
      },
    });
  } catch (error) {
    console.error('Request bill error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get aggregated table tax invoice with all items and embedded UPI QR code
// @route   GET /api/orders/table/invoice
// @access  Public
const getTableInvoice = async (req, res) => {
  try {
    const { restaurantId, tableNumber, tableToken } = req.query;
    if (!restaurantId || !tableNumber) {
      return res.status(400).json({ success: false, message: 'Restaurant and table number required' });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const orders = await Order.find({
      restaurant: restaurant.owner,
      tableNumber,
      createdAt: { $gte: yesterday },
    }).populate('items.dish');

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'No orders found for this table' });
    }

    // Consolidate all items across rounds
    const itemMap = {};
    orders.forEach((ord) => {
      ord.items.forEach((item) => {
        const key = item.name;
        if (!itemMap[key]) {
          itemMap[key] = {
            name: item.name,
            price: item.price,
            quantity: 0,
            total: 0,
          };
        }
        itemMap[key].quantity += item.quantity;
        itemMap[key].total += item.price * item.quantity;
      });
    });

    const consolidatedItems = Object.values(itemMap);
    const subtotal = consolidatedItems.reduce((sum, i) => sum + i.total, 0);
    const taxAmount = Number((subtotal * 0.05).toFixed(2));
    const grandTotal = Number((subtotal + taxAmount).toFixed(2));

    const allPaid = orders.every((o) => o.paymentStatus === 'paid');
    const paymentMethod = orders[0]?.paymentMethod || 'cash';
    const customerName = orders[0]?.customerName || 'Guest';
    const customerMobile = orders[0]?.customerMobile || '';

    // Generate dynamic UPI QR string for the bill
    const upiId = restaurant.upiId || 'merchant@okaxis';
    const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(restaurant.name)}&am=${grandTotal}&tn=${encodeURIComponent('Table_' + tableNumber + '_Bill')}&cu=INR`;
    
    const upiQrCodeUrl = await QRCode.toDataURL(upiString, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 180,
    });

    res.status(200).json({
      success: true,
      data: {
        invoiceNumber: `INV-${tableNumber.replace(/\s+/g, '')}-${Date.now().toString().slice(-6)}`,
        date: new Date(),
        tableNumber,
        customerName,
        customerMobile,
        restaurant: {
          name: restaurant.name,
          address: restaurant.address,
          contactNumber: restaurant.contactNumber,
          upiId: upiId,
        },
        items: consolidatedItems,
        subtotal,
        cgst: Number((taxAmount / 2).toFixed(2)),
        sgst: Number((taxAmount / 2).toFixed(2)),
        taxAmount,
        grandTotal,
        isPaid: allPaid,
        paymentStatus: allPaid ? 'paid' : 'pending',
        paymentMethod,
        upiQrCodeUrl,
        upiString,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus,
  getTableOrders,
  requestTableBill,
  updateOrderPayment,
  settleTableBill,
  getOrderInvoice,
  getTableInvoice,
};
