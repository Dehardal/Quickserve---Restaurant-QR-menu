const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');

// Helper to determine Cashfree API base URL
const getCashfreeBaseUrl = (env = 'sandbox') => {
  return env === 'production' 
    ? 'https://api.cashfree.com/pg' 
    : 'https://sandbox.cashfree.com/pg';
};

// @desc    Get public payment gateway configuration for a restaurant
// @route   GET /api/payment/config
// @access  Public
const getPaymentConfig = async (req, res) => {
  try {
    const { restaurantId } = req.query;
    let restaurant = null;

    if (restaurantId) {
      restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        restaurant = await Restaurant.findOne({ owner: restaurantId });
      }
    }

    if (!restaurant) {
      // Try resolving by host
      const host = (req.get('host') || '').split(':')[0].toLowerCase();
      restaurant = await Restaurant.findOne({ customDomain: host });
    }

    if (!restaurant) {
      restaurant = await Restaurant.findOne();
    }

    const appId = restaurant?.cashfreeAppId || process.env.CASHFREE_APP_ID || '';
    const secretKey = restaurant?.cashfreeSecretKey || process.env.CASHFREE_SECRET_KEY || '';
    const environment = restaurant?.cashfreeEnvironment || process.env.CASHFREE_ENV || 'sandbox';
    const isConfigured = !!(appId && secretKey);

    res.status(200).json({
      success: true,
      data: {
        cashfreeEnabled: restaurant?.cashfreeEnabled ?? true,
        environment,
        isConfigured,
        upiId: restaurant?.upiId || 'merchant@okaxis',
        developerSplitConfigured: !!restaurant?.developerSplitVendorId,
        developerSplitPercentage: restaurant?.developerSplitPercentage || 5,
      },
    });
  } catch (error) {
    console.error('Payment config error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create Cashfree payment order session
// @route   POST /api/payment/cashfree/create-order
// @access  Public
const createCashfreeOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Load Cashfree credentials from the specific restaurant
    let restaurant = await Restaurant.findOne({ owner: order.restaurant });
    if (!restaurant) {
      restaurant = await Restaurant.findById(order.restaurant);
    }

    const appId = restaurant?.cashfreeAppId || process.env.CASHFREE_APP_ID || '';
    const secretKey = restaurant?.cashfreeSecretKey || process.env.CASHFREE_SECRET_KEY || '';
    const environment = restaurant?.cashfreeEnvironment || process.env.CASHFREE_ENV || 'sandbox';

    const baseUrl = getCashfreeBaseUrl(environment);
    const amount = Number((order.grandTotal || order.subtotal).toFixed(2));
    const cashfreeOrderId = `ORD_${order._id.toString().slice(-8)}_${Date.now().toString().slice(-4)}`;

    // Prepare customer contact details
    const rawMobile = (order.customerMobile || '9876543210').replace(/\D/g, '');
    const cleanPhone = rawMobile.length >= 10 ? rawMobile.slice(-10) : '9876543210';
    const customerId = `cust_${cleanPhone}`;

    // If keys are not configured: run in test simulation mode so checkout never breaks
    if (!appId || !secretKey) {
      const mockSessionId = `mock_session_${Date.now()}`;
      order.cashfreeOrderId = cashfreeOrderId;
      order.cashfreePaymentSessionId = mockSessionId;
      await order.save();

      return res.status(200).json({
        success: true,
        isSimulation: true,
        orderId: order._id,
        cashfreeOrderId,
        paymentSessionId: mockSessionId,
        environment,
        amount,
        message: 'Cashfree test credentials not configured in settings. Running in simulated test mode.',
      });
    }

    // Resolve return URL
    const host = req.get('host') || 'localhost:5000';
    const isHttps = req.headers['x-forwarded-proto'] === 'https' || req.secure;
    const protocol = isHttps ? 'https' : (req.protocol || 'http');

    let origin = req.headers.origin;
    if (!origin && req.headers.referer) {
      try {
        origin = new URL(req.headers.referer).origin;
      } catch (e) {}
    }
    if (!origin) {
      origin = `${protocol}://${host}`;
    }

    const orderMeta = {
      return_url: `${origin}/?order_id=${order._id}&cf_id={order_id}`,
      payment_methods: 'upi,cc,dc,nb',
    };

    if (isHttps) {
      orderMeta.notify_url = `https://${host}/api/payment/cashfree/webhook`;
    }

    const requestBody = {
      order_id: cashfreeOrderId,
      order_amount: amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: customerId,
        customer_name: order.customerName || 'Customer',
        customer_phone: cleanPhone,
        customer_email: 'guest@dining.com',
      },
      order_meta: orderMeta,
    };

    // Apply Developer Easy Split if enabled
    if (
      restaurant?.developerSplitEnabled &&
      restaurant?.developerSplitVendorId &&
      restaurant?.developerSplitPercentage > 0
    ) {
      requestBody.order_splits = [
        {
          vendor_id: restaurant.developerSplitVendorId,
          percentage: Number(restaurant.developerSplitPercentage),
        },
      ];
    }

    // Call Cashfree PG Orders API
    let response = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'x-client-id': appId.trim(),
        'x-client-secret': secretKey.trim(),
        'x-api-version': '2023-08-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    let data = await response.json();

    // Fallback if split fails
    if ((!response.ok || !data.payment_session_id) && requestBody.order_splits) {
      console.warn('Cashfree order failed with order_splits. Retrying without easy split:', data.message);
      delete requestBody.order_splits;

      response = await fetch(`${baseUrl}/orders`, {
        method: 'POST',
        headers: {
          'x-client-id': appId.trim(),
          'x-client-secret': secretKey.trim(),
          'x-api-version': '2023-08-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      data = await response.json();
    }

    if (!response.ok || !data.payment_session_id) {
      console.error('Cashfree order error:', data);
      return res.status(400).json({
        success: false,
        message: data.message || 'Cashfree payment session generation failed.',
        details: data,
      });
    }

    order.cashfreeOrderId = data.order_id || cashfreeOrderId;
    order.cashfreePaymentSessionId = data.payment_session_id;
    await order.save();

    res.status(200).json({
      success: true,
      isSimulation: false,
      orderId: order._id,
      cashfreeOrderId: data.order_id || cashfreeOrderId,
      paymentSessionId: data.payment_session_id,
      environment,
      amount,
    });
  } catch (error) {
    console.error('Create Cashfree Order Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Cashfree order status & mark order paid
// @route   POST /api/payment/cashfree/verify
// @access  Public
const verifyCashfreeOrder = async (req, res) => {
  try {
    const { orderId, cashfreeOrderId, isSimulation } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(200).json({ success: true, data: order, message: 'Order already paid.' });
    }

    let isPaid = false;
    let paymentDetails = {};

    if (isSimulation) {
      isPaid = true;
      paymentDetails = {
        mode: 'SIMULATED_TEST',
        note: 'Payment confirmed in developer test mode.',
      };
    } else {
      let restaurant = await Restaurant.findOne({ owner: order.restaurant });
      if (!restaurant) {
        restaurant = await Restaurant.findById(order.restaurant);
      }

      const appId = restaurant?.cashfreeAppId || process.env.CASHFREE_APP_ID || '';
      const secretKey = restaurant?.cashfreeSecretKey || process.env.CASHFREE_SECRET_KEY || '';
      const environment = restaurant?.cashfreeEnvironment || process.env.CASHFREE_ENV || 'sandbox';
      const baseUrl = getCashfreeBaseUrl(environment);

      const targetCfId = cashfreeOrderId || order.cashfreeOrderId;
      if (!targetCfId) {
        return res.status(400).json({ success: false, message: 'Cashfree Order ID missing for verification' });
      }

      const response = await fetch(`${baseUrl}/orders/${encodeURIComponent(targetCfId)}`, {
        method: 'GET',
        headers: {
          'x-client-id': appId.trim(),
          'x-client-secret': secretKey.trim(),
          'x-api-version': '2023-08-01',
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      paymentDetails = data;

      if (data.order_status === 'PAID') {
        isPaid = true;
      } else {
        return res.status(400).json({
          success: false,
          orderStatus: data.order_status,
          message: `Payment is not completed. Current status: ${data.order_status}`,
        });
      }
    }

    if (isPaid) {
      order.paymentStatus = 'paid';
      order.paymentMethod = 'online_cashfree';
      order.paidAt = new Date();
      order.transactionId = cashfreeOrderId || order.cashfreeOrderId || `CF-${Date.now().toString().slice(-6)}`;
      order.paymentDetails = paymentDetails;
      await order.save();

      // Emit real-time Socket.IO events to Kitchen Board and Table
      const io = req.app.get('socketio');
      if (io) {
        if (order.restaurant) {
          io.to(order.restaurant.toString()).emit('order_payment_updated', order);
        }
        const tableRoom = `table_${order.tableNumber}_${order.restaurant}`;
        io.to(tableRoom).emit('table_order_updated', order);
      }

      return res.status(200).json({
        success: true,
        data: order,
        message: 'Payment verified and settled successfully!',
      });
    }

    res.status(400).json({ success: false, message: 'Payment verification failed.' });
  } catch (error) {
    console.error('Verify Cashfree Order Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Asynchronous Server Webhook for Cashfree
// @route   POST /api/payment/cashfree/webhook
// @access  Public
const handleCashfreeWebhook = async (req, res) => {
  try {
    const payload = req.body;
    const orderData = payload?.data?.order;

    if (orderData && (orderData.order_status === 'PAID' || payload.type === 'PAYMENT_SUCCESS_WEBHOOK')) {
      const cfOrderId = orderData.order_id;
      const order = await Order.findOne({ cashfreeOrderId: cfOrderId });

      if (order && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
        order.paymentMethod = 'online_cashfree';
        order.paidAt = new Date();
        order.transactionId = cfOrderId;
        order.paymentDetails = payload;
        await order.save();

        const io = req.app.get('socketio');
        if (io) {
          if (order.restaurant) {
            io.to(order.restaurant.toString()).emit('order_payment_updated', order);
          }
          const tableRoom = `table_${order.tableNumber}_${order.restaurant}`;
          io.to(tableRoom).emit('table_order_updated', order);
        }
      }
    }

    res.status(200).json({ status: 'OK' });
  } catch (error) {
    console.error('Cashfree Webhook Handler Error:', error);
    res.status(200).json({ status: 'ERROR_LOGGED' });
  }
};

module.exports = {
  getPaymentConfig,
  createCashfreeOrder,
  verifyCashfreeOrder,
  handleCashfreeWebhook,
};

