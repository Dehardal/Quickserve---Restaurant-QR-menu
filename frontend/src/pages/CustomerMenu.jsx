import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useTenant } from '../context/TenantContext';
import '../styles/pages/customer-menu.css';
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  Minus, 
  Smartphone, 
  Info, 
  ChevronUp, 
  X, 
  Sparkles, 
  MapPin, 
  Utensils, 
  Lock, 
  ShieldAlert, 
  Loader2, 
  CheckCircle2, 
  Receipt, 
  Clock, 
  ChefHat, 
  Check, 
  CreditCard, 
  QrCode, 
  Banknote, 
  Printer, 
  RefreshCw, 
  ArrowLeft,
  ChevronRight,
  Flame,
  Leaf,
  Trash2,
  BellRing,
  Ticket,
  Tag,
  ShieldCheck,
  User,
  Gift
} from 'lucide-react';
import InvoiceModal from '../components/InvoiceModal';

const CustomerMenu = () => {
  const { restaurantId: paramRestaurantId } = useParams();
  const { tenant } = useTenant();
  const restaurantId = paramRestaurantId || tenant?._id;
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type') || '';
  const companyParam = searchParams.get('company') || '';
  const tableParam = searchParams.get('table') || '';
  const tokenParam = searchParams.get('tableToken') || searchParams.get('token') || '';
  const { socket } = useSocket();

  // Channel detection: 'dine_in' | 'company_delivery' | 'takeaway'
  const isTakeawayMode = typeParam === 'takeaway' || (!tableParam && !companyParam && !tokenParam);
  const isCorporateMode = !isTakeawayMode && (typeParam === 'company_delivery' || Boolean(companyParam));

  const [orderType, setOrderType] = useState(
    isTakeawayMode ? 'takeaway' : (isCorporateMode ? 'company_delivery' : 'dine_in')
  );
  const [companyName, setCompanyName] = useState(companyParam);
  const [deskNumber, setDeskNumber] = useState('');

  // Navigation tab state: 'menu' | 'bill'
  const [activeTab, setActiveTab] = useState('menu');

  // Restaurant & Data states
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tableError, setTableError] = useState(null);
  const [isTableVerified, setIsTableVerified] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [vegOnly, setVegOnly] = useState(false);

  // Cart state
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Offers & Promo code state
  const [activeOffers, setActiveOffers] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Customer Checkout fields (persist customer name & mobile in localStorage)
  const [tableNumber, setTableNumber] = useState(
    isTakeawayMode ? 'Takeaway Counter' : (isCorporateMode ? `Company: ${companyParam}` : (tableParam || 'Table 1'))
  );
  const [customerName, setCustomerName] = useState(() => localStorage.getItem('qr_customer_name') || '');
  const [customerMobile, setCustomerMobile] = useState(() => localStorage.getItem('qr_customer_mobile') || '');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [checkoutError, setCheckoutError] = useState('');

  // Placed Order feedback
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);

  // Table active orders & running bill state
  const [tableOrders, setTableOrders] = useState([]);
  const [tableBill, setTableBill] = useState(null);
  const [billLoading, setBillLoading] = useState(false);
  const [billRequesting, setBillRequesting] = useState(false);
  const [billSuccessMsg, setBillSuccessMsg] = useState('');

  // Invoice & Online/Offline Payment Flow states
  const [orderPaymentMode, setOrderPaymentMode] = useState('online_cashfree'); // 'online_cashfree' | 'upi' | 'cash'
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [onlineUpiModalOpen, setOnlineUpiModalOpen] = useState(false);
  const [upiData, setUpiData] = useState(null);
  const [upiPaying, setUpiPaying] = useState(false);

  // Cashfree Payment States
  const [cashfreeModalOpen, setCashfreeModalOpen] = useState(false);
  const [cashfreeSession, setCashfreeSession] = useState(null);
  const [cashfreePaying, setCashfreePaying] = useState(false);
  const [selectedPaymentApp, setSelectedPaymentApp] = useState('Google Pay');
  const [authorizingStep, setAuthorizingStep] = useState(''); // '' | 'connecting' | 'approved'

  // Guest Profile Drawer
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

  // 1. Fetch public profile, categories, dishes, active offers & verify table/corporate token
  useEffect(() => {
    const fetchPublicData = async () => {
      setLoading(true);
      setTableError(null);
      try {
        const isTakeaway = typeParam === 'takeaway' || (!tableParam && !companyParam && !tokenParam);
        const isCorporate = !isTakeaway && (typeParam === 'company_delivery' || Boolean(companyParam));

        // Security token verification based on channel
        if (!isTakeaway) {
          if (isCorporate) {
            if (!companyParam || !tokenParam) {
              setTableError('Corporate delivery access restricted. Please scan the official QR code at your company premises.');
              setLoading(false);
              return;
            }
            const verifyRes = await fetch(
              `/api/restaurant/verify-table?restaurantId=${restaurantId}&company=${encodeURIComponent(companyParam)}&token=${encodeURIComponent(tokenParam)}`
            );
            const verifyData = await verifyRes.json();
            if (!verifyData.success) {
              setTableError(verifyData.message || 'Corporate QR signature is invalid.');
              setLoading(false);
              return;
            }
            setIsTableVerified(true);
            setCompanyName(verifyData.companyName || companyParam);
            setTableNumber(`Company: ${verifyData.companyName || companyParam}`);
            setOrderType('company_delivery');
          } else {
            // Dine-in table check
            if (!tableParam || !tokenParam) {
              setTableError('Table access is restricted. Please scan the physical QR code placed on your table.');
              setLoading(false);
              return;
            }
            const verifyRes = await fetch(
              `/api/restaurant/verify-table?restaurantId=${restaurantId}&table=${encodeURIComponent(tableParam)}&token=${encodeURIComponent(tokenParam)}`
            );
            const verifyData = await verifyRes.json();
            if (!verifyData.success) {
              setTableError(verifyData.message || 'Unauthorized Table Access: Invalid or tampered table parameter.');
              setLoading(false);
              return;
            }
            setIsTableVerified(true);
            setTableNumber(tableParam);
            setOrderType('dine_in');
          }
        } else {
          // Direct Website / Takeaway order
          setIsTableVerified(true);
          setTableNumber('Takeaway Counter');
          setOrderType('takeaway');
        }

        const channel = isTakeaway ? 'takeaway' : (isCorporate ? 'company_delivery' : 'dine_in');

        // Fetch restaurant details, categories, dishes, and active offers in parallel
        const [restRes, catRes, dishRes, offersRes] = await Promise.all([
          fetch(`/api/restaurant/${restaurantId}/public`),
          fetch(`/api/categories/restaurant/${restaurantId}`),
          fetch(`/api/dishes/restaurant/${restaurantId}`),
          fetch(`/api/offers/active?restaurantId=${restaurantId}&orderType=${channel}`),
        ]);

        const [restData, catData, dishData, offersData] = await Promise.all([
          restRes.json(),
          catRes.json(),
          dishRes.json(),
          offersRes.json(),
        ]);

        if (restData.success) {
          setRestaurant(restData.data);
          if (isTakeaway && !tableParam) {
            setTableNumber('Takeaway Counter');
          } else if (!tableParam && restData.data.tables?.length > 0) {
            setTableNumber(restData.data.tables[0]);
          }
        } else {
          setError('Restaurant profile not found.');
          setLoading(false);
          return;
        }

        if (catData.success) setCategories(catData.data);
        if (dishData.success) setDishes(dishData.data);
        if (offersData.success && offersData.data) setActiveOffers(offersData.data);
      } catch (err) {
        console.error('Error fetching public menu:', err);
        setError('Error establishing connection with restaurant.');
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId) {
      fetchPublicData();
    }
  }, [restaurantId, tableParam, tokenParam, companyParam, typeParam]);

  // 2. Fetch active orders & bill for this table
  const fetchTableOrders = async () => {
    if (!restaurantId || !tableNumber) return;
    setBillLoading(true);
    try {
      const res = await fetch(
        `/api/orders/table?restaurantId=${restaurantId}&tableNumber=${encodeURIComponent(tableNumber)}&tableToken=${encodeURIComponent(tokenParam)}`
      );
      const data = await res.json();
      if (data.success) {
        setTableOrders(data.data || []);
        setTableBill(data.bill || null);
      }
    } catch (err) {
      console.error('Failed to fetch table orders:', err);
    } finally {
      setBillLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId && tableNumber) {
      fetchTableOrders();
    }
  }, [restaurantId, tableNumber, tokenParam]);

  // 3. Socket.IO table room listener for live kitchen updates
  useEffect(() => {
    if (socket && tableNumber && restaurantId) {
      socket.emit('join_table', { tableNumber, restaurantId });

      socket.on('table_order_updated', () => {
        fetchTableOrders();
      });

      return () => {
        socket.off('table_order_updated');
      };
    }
  }, [socket, tableNumber, restaurantId]);

  // Cart operations
  const addToCart = useCallback((dish) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.dishId === dish._id);
      if (existing) {
        return prev.map((item) =>
          item.dishId === dish._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          dishId: dish._id,
          name: dish.name,
          price: dish.price,
          isVeg: dish.isVeg,
          image: dish.image,
          quantity: 1,
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((dishId) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.dishId === dishId);
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item.dishId === dishId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prev.filter((item) => item.dishId !== dishId);
    });
  }, []);

  const cartMap = useMemo(() => {
    const map = new Map();
    for (let i = 0; i < cart.length; i++) {
      map.set(cart[i].dishId, cart[i].quantity);
    }
    return map;
  }, [cart]);

  const getItemQuantityInCart = (dishId) => cartMap.get(dishId) || 0;

  const cartTotalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = appliedCoupon ? Number(appliedCoupon.discountAmount || appliedCoupon.discount || 0) : 0;
  const taxableAmount = Math.max(0, cartSubtotal - discountAmount);
  const cartTax = Number((taxableAmount * 0.05).toFixed(2));
  const cartGrandTotal = Number((taxableAmount + cartTax).toFixed(2));

  // Coupon application handler
  const handleApplyCoupon = async (codeToApply) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) return;
    setApplyingCoupon(true);
    setCouponMsg(null);
    try {
      const res = await fetch('/api/offers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          subtotal: cartSubtotal,
          customerMobile: customerMobile.trim(),
          restaurantId,
          orderType: orderType || 'dine_in',
        }),
      });
      const data = await res.json();
      if (data.success && (data.valid !== false)) {
        setAppliedCoupon(data.data || { code, discountAmount: data.discountAmount || 0 });
        setCouponMsg({ type: 'success', text: data.message || `Coupon "${code}" applied!` });
        setCouponInput('');
      } else {
        setAppliedCoupon(null);
        setCouponMsg({ type: 'error', text: data.message || 'Invalid coupon code' });
      }
    } catch (e) {
      setCouponMsg({ type: 'error', text: 'Error applying coupon. Please try again.' });
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponMsg(null);
  };

  // Handle direct order submission with selected payment mode
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setCheckoutError('');

    if (!customerName.trim() || !customerMobile.trim()) {
      setCheckoutError('Please enter your name and 10-digit mobile number.');
      return;
    }

    if (orderType === 'company_delivery' && !deskNumber.trim()) {
      setCheckoutError('Please enter your Desk / Floor number for office delivery.');
      return;
    }

    if (cart.length === 0) {
      setCheckoutError('Your cart is empty. Please add items to order.');
      return;
    }

    // Save name & mobile for quick re-orders
    localStorage.setItem('qr_customer_name', customerName.trim());
    localStorage.setItem('qr_customer_mobile', customerMobile.trim());

    setOrderLoading(true);
    try {
      const isTakeaway = orderType === 'takeaway';
      const isCorporate = orderType === 'company_delivery';
      const computedTable = isTakeaway
        ? 'Takeaway Counter'
        : isCorporate
        ? `Company: ${companyName || 'Corporate'} [Desk: ${deskNumber.trim()}]`
        : (tableNumber || 'Table 1');

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          orderType,
          companyName: isCorporate ? companyName : '',
          deskNumber: isCorporate ? deskNumber.trim() : '',
          tableNumber: computedTable,
          tableToken: isTakeaway ? undefined : tokenParam,
          customerName: customerName.trim(),
          customerMobile: customerMobile.trim(),
          specialInstructions: specialInstructions.trim(),
          paymentMethod: orderPaymentMode,
          paymentStatus: 'pending',
          discount: discountAmount,
          couponCode: appliedCoupon?.code || '',
          grandTotal: cartGrandTotal,
          items: cart.map((i) => ({ dish: i.dishId, quantity: i.quantity })),
        }),
      });

      const data = await response.json();
      if (data.success) {
        const createdOrder = data.data;
        setPlacedOrder(createdOrder);
        setCart([]);
        setAppliedCoupon(null);
        setIsCartOpen(false);
        fetchTableOrders();

        // Route automatically according to selected payment method
        if (orderPaymentMode === 'online_cashfree') {
          handleInitiateCashfree(createdOrder._id);
        } else if (orderPaymentMode === 'upi') {
          handleOpenOnlineUpi(createdOrder._id);
        } else {
          setActiveTab('bill');
          setBillSuccessMsg('Order Sent to Kitchen! Food preparation has started.');
        }
      } else {
        setCheckoutError(data.message || 'Failed to submit order.');
      }
    } catch (error) {
      console.error(error);
      setCheckoutError('Server connection error. Please try again.');
    } finally {
      setOrderLoading(false);
    }
  };

  // Initiate Cashfree Payment Gateway Session
  const handleInitiateCashfree = async (orderId) => {
    setOrderLoading(true);
    try {
      const res = await fetch('/api/payment/cashfree/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data.success) {
        setCashfreeSession(data);
        if (data.isSimulation) {
          setCashfreeModalOpen(true);
        } else if (window.Cashfree) {
          const cashfree = window.Cashfree({ mode: data.environment || 'sandbox' });
          cashfree.checkout({
            paymentSessionId: data.paymentSessionId,
            redirectTarget: '_modal',
          }).then((result) => {
            if (result.paymentDetails) {
              handleVerifyCashfree(orderId, data.cashfreeOrderId);
            }
          });
        } else {
          setCashfreeModalOpen(true);
        }
      } else {
        alert(data.message || 'Failed to initialize payment gateway.');
      }
    } catch (err) {
      console.error('Cashfree error:', err);
      alert('Error connecting to payment gateway.');
    } finally {
      setOrderLoading(false);
    }
  };

  // Verify Cashfree Payment
  const handleVerifyCashfree = async (orderId, cfOrderId, isSimulation = false) => {
    setCashfreePaying(true);
    try {
      const res = await fetch('/api/payment/cashfree/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          cashfreeOrderId: cfOrderId,
          isSimulation,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCashfreeModalOpen(false);
        fetchTableOrders();
        setActiveTab('bill');
        setBillSuccessMsg('Payment Verified Successfully! Kitchen is preparing your food.');
      } else {
        alert(data.message || 'Payment verification failed.');
      }
    } catch (err) {
      console.error('Verify error:', err);
      alert('Error verifying payment.');
    } finally {
      setCashfreePaying(false);
    }
  };

  // Simulated Cashfree UPI App Authorization Flow
  const handleProcessCashfreeAuth = async (appName) => {
    setSelectedPaymentApp(appName);
    setAuthorizingStep('connecting');
    await new Promise((r) => setTimeout(r, 650));
    setAuthorizingStep('approved');
    await new Promise((r) => setTimeout(r, 650));
    setAuthorizingStep('');
    if (cashfreeSession) {
      handleVerifyCashfree(cashfreeSession.orderId, cashfreeSession.cashfreeOrderId, true);
    }
  };

  // Open itemized or consolidated printable Tax Invoice Modal with embedded dynamic UPI QR
  const handleOpenInvoice = async (orderId = null) => {
    setBillLoading(true);
    try {
      let endpoint = `/api/orders/table/invoice?restaurantId=${restaurantId}&tableNumber=${encodeURIComponent(tableNumber)}&tableToken=${encodeURIComponent(tokenParam)}`;
      if (orderId) {
        endpoint = `/api/orders/${orderId}/invoice`;
      }
      const res = await fetch(endpoint);
      const json = await res.json();
      if (json.success) {
        if (json.data.billing) {
          // Format single-round invoice structure to match InvoiceModal schema
          setInvoiceData({
            restaurant: json.data.restaurant,
            invoiceNumber: `INV-${json.data.order._id?.slice(-6).toUpperCase()}`,
            date: json.data.order.createdAt,
            tableNumber: json.data.order.tableNumber,
            customerName: json.data.order.customerName,
            customerMobile: json.data.order.customerMobile,
            items: json.data.order.items,
            subtotal: json.data.billing.subtotal,
            cgst: json.data.billing.cgst,
            sgst: json.data.billing.sgst,
            taxAmount: json.data.billing.taxAmount,
            grandTotal: json.data.billing.grandTotal,
            paymentStatus: json.data.order.paymentStatus,
            paymentMethod: json.data.order.paymentMethod,
            upiQrCodeUrl: json.data.upiQrCodeUrl,
          });
        } else {
          setInvoiceData(json.data);
        }
        setInvoiceModalOpen(true);
      } else {
        alert(json.message || 'Unable to generate invoice. Please ensure you have placed an order.');
      }
    } catch (err) {
      console.error('Invoice error:', err);
      alert('Error fetching invoice details.');
    } finally {
      setBillLoading(false);
    }
  };

  // Open direct Online UPI QR Payment Modal
  const handleOpenOnlineUpi = async (orderId = null) => {
    setBillLoading(true);
    try {
      let endpoint = `/api/orders/table/invoice?restaurantId=${restaurantId}&tableNumber=${encodeURIComponent(tableNumber)}&tableToken=${encodeURIComponent(tokenParam)}`;
      if (orderId) {
        endpoint = `/api/orders/${orderId}/invoice`;
      }
      const res = await fetch(endpoint);
      const json = await res.json();
      if (json.success) {
        const d = json.data;
        setUpiData({
          upiQrCodeUrl: d.upiQrCodeUrl,
          upiString: d.upiString,
          grandTotal: d.grandTotal || d.billing?.grandTotal,
          restaurantName: d.restaurant?.name,
          upiId: d.restaurant?.upiId,
          orderId: orderId,
        });
        setOnlineUpiModalOpen(true);
      }
    } catch (e) {
      console.error('Online UPI error:', e);
    } finally {
      setBillLoading(false);
    }
  };

  // Confirm Online UPI payment done by customer
  const handleCustomerOnlinePaid = async () => {
    setUpiPaying(true);
    try {
      const res = await fetch('/api/orders/table/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          tableNumber,
          tableToken: tokenParam,
          paymentMethod: 'upi',
          transactionId: 'UPI-ONLINE-' + Date.now().toString().slice(-6),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOnlineUpiModalOpen(false);
        fetchTableOrders();
        setActiveTab('bill');
        setBillSuccessMsg('UPI Payment Confirmed! Kitchen is preparing your food.');
      } else {
        alert(data.message || 'Payment confirmation failed.');
      }
    } catch (err) {
      console.error('Payment settle error:', err);
      alert('Error confirming payment.');
    } finally {
      setUpiPaying(false);
    }
  };

  // Call Waiter / Request Bill API
  const handleRequestBill = async (method = 'cash') => {
    setBillRequesting(true);
    setBillSuccessMsg('');
    try {
      const res = await fetch('/api/orders/request-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          tableNumber,
          tableToken: tokenParam,
          paymentMethod: method,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBillSuccessMsg(`Staff notified! They are coming to ${tableNumber} with your bill.`);
        fetchTableOrders();
      } else {
        alert(data.message || 'Unable to request staff.');
      }
    } catch (err) {
      console.error(err);
      alert('Error notifying staff. Please call waiter directly.');
    } finally {
      setBillRequesting(false);
    }
  };

  // Filtered dishes
  const filteredDishes = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return dishes.filter((dish) => {
      if (!dish.isAvailable) return false;
      const matchesSearch =
        !q ||
        dish.name.toLowerCase().includes(q) ||
        (dish.description && dish.description.toLowerCase().includes(q));
      const matchesCategory = selectedCategory === 'all' || (dish.category && dish.category._id === selectedCategory);
      const matchesVeg = !vegOnly || dish.isVeg;
      return matchesSearch && matchesCategory && matchesVeg;
    });
  }, [dishes, searchQuery, selectedCategory, vegOnly]);

  // Group dishes by category for the full categorized view
  const categorizedGroup = useMemo(() => {
    return categories
      .map((cat) => ({
        category: cat,
        dishes: filteredDishes.filter((d) => d.category && d.category._id === cat._id),
      }))
      .filter((group) => selectedCategory === 'all' ? group.dishes.length > 0 : group.category._id === selectedCategory);
  }, [categories, filteredDishes, selectedCategory]);

  // Fallback for dishes with uncategorized or deleted categories
  const uncategorizedDishes = useMemo(() => {
    const catIds = new Set(categories.map((c) => c._id));
    return filteredDishes.filter((d) => !d.category || !catIds.has(d.category._id));
  }, [categories, filteredDishes]);

  // Live status badge helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Cooking 🍳
          </span>
        );
      case 'served':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Served 🍽️
          </span>
        );
      case 'completed':
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
            <Check className="w-3 h-3 text-slate-600" />
            Completed
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-300">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            Sent to Kitchen 🛎️
          </span>
        );
    }
  };

  // 1. Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3 p-6 text-slate-800">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 shadow-sm animate-pulse">
          <Utensils className="w-6 h-6 animate-spin text-brand-600" />
        </div>
        <span className="text-xs text-slate-500 font-extrabold uppercase tracking-widest">
          Loading Digital Menu...
        </span>
      </div>
    );
  }

  // 2. Tampered / Unauthorized Table Error Screen
  if (tableError) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-xl shadow-rose-950">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">Security Protection Active</span>
        <h2 className="text-xl font-black mt-2 text-white">Unauthorized Table Access</h2>
        <p className="text-xs text-slate-300 mt-3 max-w-xs leading-relaxed">{tableError}</p>
        <div className="mt-6 p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 max-w-xs text-left text-xs text-slate-300 space-y-1.5 shadow-md">
          <p className="font-bold text-white flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-400" /> Why am I seeing this?
          </p>
          <p className="text-[11px] text-slate-400 leading-normal">
            Each table QR code has a cryptographic signature. Tables cannot be changed simply by editing the URL.
          </p>
          <p className="text-[11px] text-brand-300 font-semibold pt-1">
            👉 Please scan the physical QR code placed on your table.
          </p>
        </div>
      </div>
    );
  }

  // 3. Restaurant Not Found Screen
  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center text-slate-800">
        <Info className="w-10 h-10 text-rose-500 mb-3" />
        <span className="text-sm font-extrabold uppercase">Menu Unavailable</span>
        <p className="text-xs text-slate-400 mt-2 max-w-xs">{error || 'Restaurant code is invalid.'}</p>
      </div>
    );
  }

  const primaryColor = restaurant?.branding?.primaryColor || 'var(--brand-primary, #4f46e5)';

  return (
    <div 
      className="min-h-screen bg-slate-100 text-slate-800 flex flex-col max-w-md mx-auto relative shadow-2xl border-x border-slate-200"
      style={{ '--brand-primary': primaryColor }}
    >
      
      {/* 1. RESTAURANT BRANDING HEADER */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-30 shadow-xs flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {restaurant.logo ? (
              <img 
                src={restaurant.logo} 
                alt="Logo" 
                className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div 
                className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center text-lg font-black shrink-0 shadow-sm"
              >
                {restaurant.name ? restaurant.name[0].toUpperCase() : 'R'}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-sm font-black tracking-tight text-slate-900 truncate leading-snug">
                {restaurant.name}
              </h1>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold truncate">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{restaurant.address || 'Dine-in Experience'}</span>
              </div>
            </div>
          </div>

          {/* Right Action Icons: Channel Badge & Guest Profile Avatar */}
          <div className="flex items-center gap-2 shrink-0">
            {orderType === 'company_delivery' ? (
              <div className="px-2.5 py-1 rounded-xl flex items-center gap-1 border border-indigo-200 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider">
                <span>🏢</span>
                <span className="truncate max-w-[90px]">{companyName}</span>
              </div>
            ) : orderType === 'takeaway' ? (
              <div className="px-2.5 py-1 rounded-xl flex items-center gap-1 border border-purple-200 bg-purple-50 text-purple-700 text-[10px] font-black uppercase tracking-wider">
                <span>🛍️</span>
                <span>Takeaway</span>
              </div>
            ) : (
              tableNumber && (
                <div className={`px-2.5 py-1 rounded-xl flex items-center gap-1 border text-[10px] font-black uppercase tracking-wider ${
                  isTableVerified
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-brand-50 border-brand-100 text-brand-600'
                }`}>
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>{tableNumber}</span>
                </div>
              )
            )}

            {/* Guest Profile Drawer Toggle Button */}
            <button
              onClick={() => setIsProfileDrawerOpen(true)}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors border border-slate-200/80"
              title="Guest Profile & Offers"
              aria-label="Guest Profile"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. DUAL NAVIGATION TABS: [FOOD MENU] | [TABLE BILL] */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
          <button
            onClick={() => setActiveTab('menu')}
            className={`py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'menu'
                ? 'bg-white text-brand-600 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Food Menu</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('bill');
              fetchTableOrders();
            }}
            className={`py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 relative ${
              activeTab === 'bill'
                ? 'bg-white text-brand-600 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Table Bill</span>
            {tableOrders.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-black flex items-center justify-center">
                {tableOrders.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* TAB A: FOOD MENU VIEW                                     */}
      {/* ========================================================= */}
      {activeTab === 'menu' && (
        <div className="flex-1 flex flex-col pb-28">
          
          {/* ACTIVE OFFERS HIGHLIGHT BANNER */}
          {activeOffers.length > 0 && (
            <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 p-2.5 px-4 text-white flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <Gift className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-xs font-black uppercase tracking-wider">
                      {activeOffers[0].discountType === 'percentage'
                        ? `${activeOffers[0].discountValue}% OFF`
                        : `FLAT ₹${activeOffers[0].discountValue} OFF`}
                    </span>
                    <span className="text-[10px] font-bold opacity-90 truncate">
                      • {activeOffers[0].title}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/80 font-medium truncate">
                    Use code <strong className="font-mono bg-black/20 px-1 py-0.5 rounded text-white">{activeOffers[0].code}</strong>
                    {activeOffers[0].minOrderValue > 0 && ` on orders above ₹${activeOffers[0].minOrderValue}`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  handleApplyCoupon(activeOffers[0].code);
                  setIsCartOpen(true);
                }}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 text-brand-600 rounded-xl text-[10px] font-black uppercase tracking-wider shrink-0 shadow-sm transition-transform active:scale-95"
              >
                Apply
              </button>
            </div>
          )}

          {/* SEARCH & VEG TOGGLE BAR */}
          <div className="p-3 bg-white border-b border-slate-100 flex items-center gap-2 sticky top-[115px] z-20">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dishes, drinks, desserts..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand-500/60 text-slate-800 font-medium placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Veg Only Toggle */}
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1 border shrink-0 ${
                vegOnly
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div className={`w-3 h-3 rounded-xs border flex items-center justify-center ${vegOnly ? 'border-white bg-white' : 'border-emerald-600'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${vegOnly ? 'bg-emerald-600' : 'bg-emerald-600'}`}></div>
              </div>
              <span>Veg Only</span>
            </button>
          </div>

          {/* CATEGORIES HORIZONTAL PILLS */}
          <div className="px-3 py-2 bg-white/95 backdrop-blur-md border-b border-slate-100 flex gap-1.5 overflow-x-auto scrollbar-none sticky top-[167px] z-20 shadow-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition-all border ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              🍽️ All ({dishes.length})
            </button>
            {categories.map((cat) => {
              const count = dishes.filter((d) => d.category && d.category._id === cat._id).length;
              return (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCategory(cat._id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                    selectedCategory === cat._id
                      ? 'bg-brand-600 border-brand-600 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === cat._id ? 'bg-brand-700/80 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* DISHES LIST BY CATEGORY */}
          <main className="p-3 space-y-5">
            {filteredDishes.length === 0 ? (
              <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-2">
                <Utensils className="w-10 h-10 stroke-[1.2] text-slate-300" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">No dishes match your filters</span>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setVegOnly(false);
                  }}
                  className="mt-2 text-xs font-bold text-brand-600 hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              categorizedGroup.map(({ category, dishes: groupDishes }) => (
                <section key={category._id} className="space-y-2.5">
                  {/* Category Title Heading */}
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5 pt-1">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                      {category.name}
                      <span className="text-[10px] font-bold text-slate-400">({groupDishes.length})</span>
                    </h2>
                  </div>

                  {/* Compact Dish Cards */}
                  <div className="space-y-2.5">
                    {groupDishes.map((dish) => {
                      const qty = getItemQuantityInCart(dish._id);
                      return (
                        <div
                          key={dish._id}
                          className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs hover:border-slate-300 transition-all flex justify-between gap-3 items-center"
                        >
                          {/* Left Column: Details */}
                          <div className="flex-1 min-w-0 pr-1">
                            {/* Veg / Non-Veg Indicator */}
                            <div className="flex items-center gap-1.5 mb-1">
                              <div className={`w-3.5 h-3.5 rounded-xs border flex items-center justify-center shrink-0 ${dish.isVeg ? 'border-emerald-600' : 'border-rose-600'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${dish.isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`}></div>
                              </div>
                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                {dish.isVeg ? 'Veg' : 'Non-Veg'}
                              </span>
                            </div>

                            <h3 className="text-xs font-extrabold text-slate-900 leading-snug line-clamp-1">
                              {dish.name}
                            </h3>

                            <div className="text-xs font-black text-brand-600 mt-0.5">
                              ₹{dish.price?.toFixed(2)}
                            </div>

                            {dish.description && (
                              <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 font-medium">
                                {dish.description}
                              </p>
                            )}
                          </div>

                          {/* Right Column: Photo + ADD Button */}
                          <div className="relative w-24 h-24 shrink-0 flex flex-col items-center justify-end">
                            {dish.image ? (
                              <img
                                src={dish.image}
                                alt={dish.name}
                                className="w-full h-full object-cover rounded-xl border border-slate-100 shadow-xs"
                              />
                            ) : (
                              <div className="w-full h-full rounded-xl bg-gradient-to-tr from-slate-100 to-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-300">
                                <Utensils className="w-6 h-6 stroke-[1.2]" />
                              </div>
                            )}

                            {/* Dynamic Add / Counter Button overlapping image */}
                            <div className="absolute -bottom-2 z-10 w-20">
                              {qty === 0 ? (
                                <button
                                  onClick={() => addToCart(dish)}
                                  className="w-full py-1 bg-white hover:bg-brand-50 border border-brand-500 text-brand-600 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-1"
                                >
                                  <Plus className="w-3 h-3 text-brand-600" />
                                  <span>ADD</span>
                                </button>
                              ) : (
                                <div className="w-full py-0.5 bg-brand-600 text-white rounded-lg flex items-center justify-between px-1 shadow-sm text-xs font-black">
                                  <button
                                    onClick={() => removeFromCart(dish._id)}
                                    className="w-5 h-5 flex items-center justify-center hover:bg-brand-700 rounded transition-colors text-white"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="text-[11px] px-1">{qty}</span>
                                  <button
                                    onClick={() => addToCart(dish)}
                                    className="w-5 h-5 flex items-center justify-center hover:bg-brand-700 rounded transition-colors text-white"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))
            )}

            {/* Uncategorized dishes fallback */}
            {uncategorizedDishes.length > 0 && selectedCategory === 'all' && (
              <section className="space-y-2.5 pt-2">
                <div className="border-b border-slate-200/80 pb-1.5">
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">Other Specials</h2>
                </div>
                <div className="space-y-2.5">
                  {uncategorizedDishes.map((dish) => {
                    const qty = getItemQuantityInCart(dish._id);
                    return (
                      <div
                        key={dish._id}
                        className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs flex justify-between gap-3 items-center"
                      >
                        <div className="flex-1 min-w-0 pr-1">
                          <h3 className="text-xs font-extrabold text-slate-900">{dish.name}</h3>
                          <div className="text-xs font-black text-brand-600 mt-0.5">₹{dish.price?.toFixed(2)}</div>
                        </div>
                        <div className="relative w-20 h-20 shrink-0 flex items-end justify-center">
                          {dish.image ? (
                            <img src={dish.image} alt={dish.name} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center text-slate-300">
                              <Utensils className="w-5 h-5" />
                            </div>
                          )}
                          <div className="absolute -bottom-2 z-10 w-16">
                            {qty === 0 ? (
                              <button
                                onClick={() => addToCart(dish)}
                                className="w-full py-1 bg-white border border-brand-500 text-brand-600 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm"
                              >
                                ADD
                              </button>
                            ) : (
                              <div className="w-full py-0.5 bg-brand-600 text-white rounded-lg flex items-center justify-between px-1 shadow-sm text-xs font-black">
                                <button onClick={() => removeFromCart(dish._id)}><Minus className="w-3 h-3" /></button>
                                <span>{qty}</span>
                                <button onClick={() => addToCart(dish)}><Plus className="w-3 h-3" /></button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </main>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB B: MY TABLE & BILL VIEW (FULL BILLING SYSTEM)          */}
      {/* ========================================================= */}
      {activeTab === 'bill' && (
        <div className="flex-1 p-4 pb-28 space-y-4">
          
          {/* Active Dining Session & Live Stepper Banner */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Dining Session</span>
                <h2 className="text-base font-black text-white mt-0.5 flex items-center gap-1.5">
                  <span>{tableNumber}</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                    Verified 🔒
                  </span>
                </h2>
              </div>
              <button
                onClick={fetchTableOrders}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
                title="Refresh status"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${billLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* 4-Step Interactive Stepper (Order Sent -> Confirmed -> Cooking -> Served) */}
            <div className="relative pt-2 pb-1">
              <div className="absolute top-5 left-6 right-6 h-1 bg-slate-800 -z-0">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-700 rounded-full"
                  style={{
                    width: tableOrders[0]?.status === 'completed' || tableOrders[0]?.status === 'paid'
                      ? '100%'
                      : tableOrders[0]?.status === 'served'
                      ? '100%'
                      : tableOrders[0]?.status === 'accepted'
                      ? '66%'
                      : tableOrders.length > 0
                      ? '33%'
                      : '0%'
                  }}
                />
              </div>

              <div className="relative z-10 flex justify-between items-start text-center">
                {/* Step 1: Received */}
                <div className="flex flex-col items-center gap-1.5 w-1/4">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shadow-md ${
                    tableOrders.length > 0 ? 'bg-emerald-500 text-slate-900' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {tableOrders.length > 0 ? '✓' : '1'}
                  </div>
                  <span className="text-[9px] font-black uppercase text-slate-300">Order Sent</span>
                </div>

                {/* Step 2: Confirmed */}
                <div className="flex flex-col items-center gap-1.5 w-1/4">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shadow-md transition-all ${
                    ['accepted', 'served', 'completed', 'paid'].includes(tableOrders[0]?.status)
                      ? 'bg-emerald-500 text-slate-900'
                      : 'bg-slate-800 text-slate-500'
                  }`}>
                    {['accepted', 'served', 'completed', 'paid'].includes(tableOrders[0]?.status) ? '✓' : '2'}
                  </div>
                  <span className={`text-[9px] font-black uppercase ${
                    ['accepted', 'served', 'completed', 'paid'].includes(tableOrders[0]?.status) ? 'text-slate-200' : 'text-slate-500'
                  }`}>Confirmed</span>
                </div>

                {/* Step 3: Cooking */}
                <div className="flex flex-col items-center gap-1.5 w-1/4">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shadow-md transition-all ${
                    ['served', 'completed', 'paid'].includes(tableOrders[0]?.status)
                      ? 'bg-emerald-500 text-slate-900'
                      : tableOrders[0]?.status === 'accepted'
                      ? 'bg-amber-400 text-slate-900 animate-pulse'
                      : 'bg-slate-800 text-slate-500'
                  }`}>
                    {['served', 'completed', 'paid'].includes(tableOrders[0]?.status) ? '✓' : '🍳'}
                  </div>
                  <span className={`text-[9px] font-black uppercase ${
                    ['accepted', 'served', 'completed', 'paid'].includes(tableOrders[0]?.status) ? 'text-slate-200' : 'text-slate-500'
                  }`}>Cooking</span>
                </div>

                {/* Step 4: Served */}
                <div className="flex flex-col items-center gap-1.5 w-1/4">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shadow-md transition-all ${
                    ['served', 'completed', 'paid'].includes(tableOrders[0]?.status)
                      ? 'bg-emerald-500 text-slate-900'
                      : 'bg-slate-800 text-slate-500'
                  }`}>
                    {['served', 'completed', 'paid'].includes(tableOrders[0]?.status) ? '🍽️' : '4'}
                  </div>
                  <span className={`text-[9px] font-black uppercase ${
                    ['served', 'completed', 'paid'].includes(tableOrders[0]?.status) ? 'text-slate-200' : 'text-slate-500'
                  }`}>Served</span>
                </div>
              </div>
            </div>

            {/* 3 Quick Action Pills: + Order More | View Invoice | Call Staff */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setActiveTab('menu')}
                className="py-2 px-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all shadow-sm active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Order More</span>
              </button>

              <button
                onClick={() => handleOpenInvoice()}
                className="py-2 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all active:scale-95"
              >
                <Printer className="w-3.5 h-3.5 text-brand-400" />
                <span>Tax Invoice</span>
              </button>

              <button
                onClick={() => handleRequestBill('cash')}
                disabled={billRequesting}
                className="py-2 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all active:scale-95"
              >
                <BellRing className="w-3.5 h-3.5 text-amber-400" />
                <span>Call Staff</span>
              </button>
            </div>
          </div>

          {/* Real-time In-App Bill Feedback */}
          {billSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 text-center animate-slide-up flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{billSuccessMsg}</span>
            </div>
          )}

          {/* Orders History for Table */}
          {tableOrders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-400 space-y-3 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                <Receipt className="w-7 h-7 stroke-[1.5]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">No Orders Placed Yet</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  Browse the menu and pick your dishes. Once placed, your live kitchen cooking status and receipt will appear here in real-time.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('menu')}
                className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-brand-500/20 transition-all active:scale-95"
              >
                Browse Food Menu
              </button>
            </div>
          ) : (
            <>
              {/* Order Rounds Tracking */}
              <div className="space-y-3">
                <div className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center justify-between">
                  <span>Order Rounds ({tableOrders.length})</span>
                  <span className="text-[10px] font-bold text-slate-400">Live Kitchen Updates ⚡</span>
                </div>

                {tableOrders.map((ord, idx) => (
                  <div key={ord._id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Round #{tableOrders.length - idx} • #{ord._id?.slice(-4).toUpperCase()}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {getStatusBadge(ord.status)}
                    </div>

                    {/* Items inside round */}
                    <div className="space-y-1.5">
                      {ord.items?.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-xs font-semibold text-slate-700">
                          <span>{item.name} <span className="text-slate-400">×{item.quantity}</span></span>
                          <span className="text-slate-600">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-100 pt-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 font-bold">Round Total:</span>
                        <span className="text-brand-600 font-black">₹{((ord.subtotal || 0) * 1.05).toFixed(2)}</span>
                      </div>
                      <button
                        onClick={() => handleOpenInvoice(ord._id)}
                        className="px-2.5 py-1 text-[10px] font-black uppercase text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <Printer className="w-3 h-3 text-brand-600" />
                        <span>Bill & QR</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* TABLE FINAL BILL CARD */}
              {tableBill && (
                <div className="bg-white border-2 border-slate-900 rounded-3xl p-5 shadow-xl space-y-4">
                  <div className="border-b border-dashed border-slate-200 pb-3 text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tax Invoice & Summary</span>
                    <h3 className="text-base font-black text-slate-900 mt-0.5">{restaurant.name}</h3>
                    <div className="text-[10px] text-slate-500">{tableNumber} • Consolidated Dine-In Check</div>
                  </div>

                  {/* Calculations breakdown */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Items Subtotal</span>
                      <span className="font-bold">₹{tableBill.subtotal?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>CGST + SGST (5%)</span>
                      <span className="font-bold">₹{tableBill.taxAmount?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-900 border-t border-slate-200 pt-2 text-sm font-black">
                      <span>Grand Total Payable</span>
                      <span className="text-brand-600 text-base">₹{tableBill.grandTotal?.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  {tableBill.isPaid ? (
                    <div className="space-y-2 pt-1">
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl text-center text-xs font-black text-purple-700 flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-purple-600" />
                        <span>Bill Fully Settled. Thank you for dining with us!</span>
                      </div>
                      <button
                        onClick={() => handleOpenInvoice()}
                        className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md"
                      >
                        <Printer className="w-4 h-4 text-brand-400" />
                        <span>Print Paid Tax Invoice</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5 pt-1">
                      {/* 1. Main Action: Download & Print Bill with embedded QR */}
                      <button
                        onClick={() => handleOpenInvoice()}
                        className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-brand-500/20"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Download / Print Bill (With UPI QR)</span>
                      </button>

                      {/* 2. Direct Pay Online via UPI QR */}
                      <button
                        onClick={() => handleOpenOnlineUpi()}
                        className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm"
                      >
                        <QrCode className="w-4 h-4 text-brand-400" />
                        <span>Pay Online via UPI QR Now</span>
                      </button>

                      {/* 3. Offline / Cash option */}
                      <button
                        onClick={() => handleRequestBill('cash')}
                        disabled={billRequesting}
                        className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                      >
                        <Banknote className="w-4 h-4 text-amber-600" />
                        <span>Pay Cash / Call Staff to Table</span>
                      </button>

                      {/* 4. Add more items */}
                      <button
                        onClick={() => setActiveTab('menu')}
                        className="w-full py-2 text-brand-600 hover:text-brand-700 text-xs font-bold uppercase tracking-wider text-center"
                      >
                        + Order More Food & Drinks
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* FLOATING ACTION BUTTONS (CIRCULAR & ICON-FIRST)           */}
      {/* ========================================================= */}
      <div className="fixed bottom-6 left-0 right-0 max-w-md mx-auto px-4 flex justify-end z-40 pointer-events-none">
        <div className="flex flex-col items-end gap-3 pointer-events-auto">
          {/* Active Orders Floating Button (when customer has orders) */}
          {tableOrders.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'bill') {
                  setActiveTab('menu');
                } else {
                  setActiveTab('bill');
                  fetchTableOrders();
                }
              }}
              className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform active:scale-90 border-2 ${
                activeTab === 'bill'
                  ? 'bg-slate-900 border-white text-white ring-4 ring-black/20'
                  : 'bg-slate-900 border-emerald-400 text-emerald-400 ring-4 ring-emerald-500/20 hover:scale-105'
              }`}
              title={activeTab === 'bill' ? 'Back to Food Menu' : 'Active Orders & Live Kitchen Status'}
              aria-label="Active Orders and Kitchen Status"
            >
              {activeTab === 'bill' ? (
                <Utensils className="w-6 h-6 text-white" />
              ) : (
                <div className="relative flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-emerald-400" />
                  <span className="absolute -inset-2 rounded-full border-2 border-emerald-400 animate-ping opacity-35 pointer-events-none" />
                  <span className="absolute -top-3 -right-3 min-w-[20px] h-[20px] px-1 bg-emerald-500 text-slate-900 text-[10px] font-black rounded-full border-2 border-slate-900 flex items-center justify-center shadow-md">
                    {tableOrders.length}
                  </span>
                </div>
              )}
            </button>
          )}

          {/* Floating Cart Button (when items are in cart) */}
          {activeTab === 'menu' && (
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform active:scale-90 border-2 ${
                cart.length > 0
                  ? 'bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 border-white text-white ring-4 ring-brand-500/30 hover:scale-105'
                  : 'bg-slate-900 border-slate-800 text-slate-300 ring-2 ring-slate-900 hover:scale-105'
              }`}
              title={cart.length > 0 ? `Review Cart (${cartTotalQuantity} items)` : 'Your Cart is Empty'}
              aria-label="View Shopping Cart"
            >
              <div className="relative flex items-center justify-center">
                <ShoppingBag className={`w-6 h-6 ${cart.length > 0 ? 'text-white' : 'text-slate-300'}`} />
                {cartTotalQuantity > 0 && (
                  <span className="absolute -top-3 -right-3 min-w-[22px] h-[22px] px-1 bg-amber-400 text-slate-950 text-[11px] font-black rounded-full border-2 border-white flex items-center justify-center shadow-md">
                    {cartTotalQuantity}
                  </span>
                )}
              </div>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* CHECKOUT BUCKET BOTTOM SHEET DRAWER                       */}
      {/* ========================================================= */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-end bg-slate-900/60 backdrop-blur-xs">
          <div className="absolute inset-0" onClick={() => setIsCartOpen(false)}></div>

          <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl p-5 space-y-4 relative z-10 animate-slide-up max-h-[92vh] flex flex-col overflow-y-auto">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-brand-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Your Order Bucket</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Items */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 divide-y divide-slate-100">
              {cart.map((item) => (
                <div key={item.dishId} className="pt-2 first:pt-0 flex justify-between items-center text-xs font-semibold">
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-slate-800 font-extrabold truncate">{item.name}</span>
                    <span className="text-[11px] text-brand-600 font-black">₹{item.price.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded-xl shrink-0">
                    <button
                      onClick={() => removeFromCart(item.dishId)}
                      className="w-5 h-5 rounded-md bg-white hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-black px-1">{item.quantity}</span>
                    <button
                      onClick={() => addToCart({ _id: item.dishId, name: item.name, price: item.price })}
                      className="w-5 h-5 rounded-md bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo & Coupons Section */}
            <div className="border-t border-slate-100 pt-3 space-y-2 shrink-0">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Ticket className="w-3.5 h-3.5 text-brand-600" />
                  <span>Promo & Coupons</span>
                </span>
                {appliedCoupon && (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-[10px] text-rose-500 font-extrabold uppercase hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              {appliedCoupon ? (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between animate-scale-up">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-xs text-emerald-800">{appliedCoupon.code}</span>
                        <span className="text-[8px] bg-emerald-200 text-emerald-900 font-black px-1 rounded">APPLIED</span>
                      </div>
                      <p className="text-[10px] text-emerald-700 font-medium">You save ₹{discountAmount.toFixed(2)}!</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-700">-₹{discountAmount.toFixed(2)}</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Enter promo code"
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase font-bold focus:outline-none focus:border-brand-500"
                    />
                    <button
                      type="button"
                      disabled={applyingCoupon || !couponInput.trim()}
                      onClick={() => handleApplyCoupon()}
                      className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase transition-all shrink-0 flex items-center gap-1"
                    >
                      {applyingCoupon && <Loader2 className="w-3 h-3 animate-spin" />}
                      <span>Apply</span>
                    </button>
                  </div>

                  {couponMsg && (
                    <p className={`text-[10px] font-semibold ${couponMsg.type === 'error' ? 'text-rose-500' : 'text-emerald-600'}`}>
                      {couponMsg.text}
                    </p>
                  )}

                  {/* 1-Click Available Coupon Pills */}
                  {activeOffers.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar">
                      {activeOffers.slice(0, 4).map((o) => (
                        <button
                          key={o._id}
                          type="button"
                          onClick={() => handleApplyCoupon(o.code)}
                          className="px-2 py-1 rounded-lg border border-dashed border-brand-300 bg-brand-50/70 hover:bg-brand-100 text-brand-700 text-[10px] font-bold font-mono tracking-wide shrink-0 transition-all flex items-center gap-1"
                        >
                          <Tag className="w-2.5 h-2.5 text-brand-500" />
                          <span>{o.code}</span>
                          <span className="text-[8px] bg-white text-brand-700 px-1 rounded font-sans font-bold">
                            {o.discountType === 'percentage' ? `${o.discountValue}%` : `₹${o.discountValue}`}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bill Summary in Drawer */}
            <div className="border-t border-slate-100 pt-3 space-y-1 text-xs shrink-0">
              <div className="flex justify-between text-slate-500">
                <span>Items Subtotal</span>
                <span>₹{cartSubtotal.toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Estimated GST (5%)</span>
                <span>₹{cartTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-black text-sm pt-1 border-t border-slate-100">
                <span>Order Total</span>
                <span className="text-brand-600">₹{cartGrandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Form */}
            <form onSubmit={handlePlaceOrder} className="space-y-3 shrink-0 border-t border-slate-100 pt-3">
              {orderType === 'company_delivery' ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold uppercase text-slate-400">Company</label>
                      <input
                        type="text"
                        readOnly
                        value={companyName}
                        className="w-full px-3 py-2 text-xs font-extrabold bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900 cursor-not-allowed select-none truncate"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold uppercase text-slate-400">Desk / Floor No. *</label>
                      <input
                        type="text"
                        required
                        value={deskNumber}
                        onChange={(e) => setDeskNumber(e.target.value)}
                        placeholder="e.g. 4th Floor, Desk 12B"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 font-medium"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold uppercase text-slate-400">Employee Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 font-medium"
                    />
                  </div>
                </>
              ) : orderType === 'takeaway' ? (
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold uppercase text-slate-400">Order Channel</label>
                    <div className="w-full px-3 py-2 text-xs font-extrabold bg-purple-50 border border-purple-200 rounded-xl text-purple-900 flex items-center gap-1">
                      <span>🛍️</span>
                      <span className="truncate">Direct Takeaway</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold uppercase text-slate-400">Customer Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. John"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 font-medium"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-bold uppercase text-slate-400">Table</label>
                      <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" /> Locked
                      </span>
                    </div>
                    <input
                      type="text"
                      readOnly
                      value={tableNumber}
                      className="w-full px-3 py-2 text-xs font-extrabold bg-slate-100 border border-slate-200 rounded-xl text-slate-700 cursor-not-allowed select-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold uppercase text-slate-400">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. John"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 font-medium"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold uppercase text-slate-400">Mobile Number *</label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 font-medium"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold uppercase text-slate-400">Cooking Notes (Optional)</label>
                <input
                  type="text"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Extra spicy, no onions..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 font-medium"
                />
              </div>

              {/* Payment Mode Selection in Checkout Drawer */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                  Select Payment Method
                </label>
                <div className="space-y-1.5">
                  {/* Option 1: Instant Online via Cashfree */}
                  <button
                    type="button"
                    onClick={() => setOrderPaymentMode('online_cashfree')}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between gap-2.5 transition-all ${
                      orderPaymentMode === 'online_cashfree'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CreditCard className="w-4 h-4 shrink-0 text-emerald-600" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-black leading-tight">Pay Online (UPI / Cards / Netbanking)</span>
                        <span className="text-[9px] text-slate-400 leading-tight">Instant Google Pay, PhonePe, Cards via Cashfree</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 shrink-0">
                      Automated
                    </span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Option 2: Direct UPI QR (0% fee) */}
                    <button
                      type="button"
                      onClick={() => setOrderPaymentMode('upi')}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        orderPaymentMode === 'upi'
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <QrCode className="w-4 h-4 shrink-0 text-indigo-600" />
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black leading-tight">Scan UPI QR</span>
                        <span className="text-[9px] text-slate-400 leading-tight">Direct to restaurant</span>
                      </div>
                    </button>

                    {/* Option 3: Cash / Counter */}
                    <button
                      type="button"
                      onClick={() => setOrderPaymentMode('cash')}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        orderPaymentMode === 'cash'
                          ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Banknote className="w-4 h-4 shrink-0 text-amber-600" />
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black leading-tight">Pay Cash / COD</span>
                        <span className="text-[9px] text-slate-400 leading-tight">Pay at counter</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {checkoutError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold text-center">
                  {checkoutError}
                </div>
              )}

              <button
                type="submit"
                disabled={orderLoading}
                className={`w-full py-3.5 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] ${
                  orderPaymentMode === 'online_cashfree'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25'
                    : orderPaymentMode === 'upi'
                    ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/25'
                    : 'bg-brand-600 hover:bg-brand-500 shadow-brand-500/25'
                }`}
              >
                {orderLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : orderPaymentMode === 'online_cashfree' ? (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Pay ₹{cartGrandTotal.toFixed(2)} Online (Cashfree) ➔</span>
                  </>
                ) : orderPaymentMode === 'upi' ? (
                  <>
                    <QrCode className="w-4 h-4" />
                    <span>Scan UPI QR & Pay ₹{cartGrandTotal.toFixed(2)} ➔</span>
                  </>
                ) : (
                  <>
                    <ChefHat className="w-4 h-4" />
                    <span>Place Order • Pay Cash ₹{cartGrandTotal.toFixed(2)} ➔</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. PRINTABLE / DOWNLOADABLE TAX INVOICE MODAL             */}
      {/* ========================================================= */}
      {invoiceModalOpen && (
        <InvoiceModal
          isOpen={invoiceModalOpen}
          onClose={() => setInvoiceModalOpen(false)}
          invoiceData={invoiceData}
        />
      )}

      {/* ========================================================= */}
      {/* 2. ONLINE DIRECT UPI PAYMENT MODAL                         */}
      {/* ========================================================= */}
      {onlineUpiModalOpen && upiData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4 animate-slide-up border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-brand-600" />
                <h3 className="text-xs font-black uppercase text-slate-800">Scan & Pay Online</h3>
              </div>
              <button onClick={() => setOnlineUpiModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-center space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Payable</span>
              <div className="text-2xl font-black text-brand-600">₹{upiData.grandTotal?.toFixed(2)}</div>
              <span className="text-[10px] text-slate-500">{restaurant.name} • {tableNumber}</span>
            </div>

            {/* Dynamic UPI QR Code */}
            {upiData.upiQrCodeUrl && (
              <div className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-2xl shadow-xs">
                <img 
                  src={upiData.upiQrCodeUrl} 
                  alt="UPI QR Code" 
                  className="w-44 h-44 object-contain" 
                />
                <span className="text-[10px] font-extrabold text-slate-500 mt-2">
                  Scan via Google Pay, PhonePe, Paytm, or BHIM
                </span>
                {upiData.upiId && (
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                    UPI ID: {upiData.upiId}
                  </span>
                )}
              </div>
            )}

            {/* Deep link for mobile users */}
            {upiData.upiString && (
              <a
                href={upiData.upiString}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
              >
                <Smartphone className="w-3.5 h-3.5 text-slate-600" />
                <span>Open in UPI App on this Phone</span>
              </a>
            )}

            <button
              onClick={handleCustomerOnlinePaid}
              disabled={upiPaying}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              {upiPaying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>I Have Completed Payment ✅</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. CASHFREE PAYMENTS GATEWAY MODAL (PRODUCTION GRADE)      */}
      {/* ========================================================= */}
      {cashfreeModalOpen && cashfreeSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4 animate-slide-up border border-slate-100 relative overflow-hidden">
            {/* Authorization in progress overlay */}
            {authorizingStep && (
              <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-3 animate-fade-in">
                {authorizingStep === 'connecting' ? (
                  <>
                    <div className="w-14 h-14 rounded-full bg-emerald-50 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-600">
                      <Loader2 className="w-7 h-7 animate-spin" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-slate-800">Connecting to UPI Network</h4>
                      <p className="text-[11px] text-slate-400">Verifying payment with your banking app...</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-bounce">
                      <Check className="w-8 h-8 stroke-[3]" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-emerald-800">Payment Approved!</h4>
                      <p className="text-[11px] text-slate-500">Routing order directly to the kitchen...</p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">Cashfree Payments</h3>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded">
                      Verified
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-medium flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> 256-Bit SSL Encrypted
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setCashfreeModalOpen(false)} 
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Total Payable Card */}
            <div className="p-3.5 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-800">Grand Total Payable</span>
                <div className="text-xl font-black text-slate-900 leading-tight">₹{cashfreeSession.amount?.toFixed(2)}</div>
                <span className="text-[10px] text-slate-500">{restaurant.name} • {tableNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-mono text-slate-400 uppercase">
                  #{cashfreeSession.cashfreeOrderId?.slice(-6) || 'ORDER'}
                </span>
              </div>
            </div>

            {/* UPI Quick Pay Options */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Choose UPI Payment App
              </span>
              
              <div className="grid grid-cols-2 gap-2">
                {/* Google Pay */}
                <button
                  type="button"
                  onClick={() => handleProcessCashfreeAuth('Google Pay')}
                  disabled={cashfreePaying}
                  className="p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 text-left flex items-center gap-2.5 transition-all shadow-2xs group active:scale-95"
                >
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-xs text-blue-600 group-hover:border-emerald-500">
                    G<span className="text-red-500">P</span><span className="text-amber-500">a</span><span className="text-emerald-500">y</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-800 leading-tight">Google Pay</span>
                    <span className="text-[9px] text-slate-400">Fast UPI</span>
                  </div>
                </button>

                {/* PhonePe */}
                <button
                  type="button"
                  onClick={() => handleProcessCashfreeAuth('PhonePe')}
                  disabled={cashfreePaying}
                  className="p-3 rounded-2xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/30 text-left flex items-center gap-2.5 transition-all shadow-2xs group active:scale-95"
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                    पे
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-800 leading-tight">PhonePe</span>
                    <span className="text-[9px] text-slate-400">Instant UPI</span>
                  </div>
                </button>

                {/* Paytm */}
                <button
                  type="button"
                  onClick={() => handleProcessCashfreeAuth('Paytm')}
                  disabled={cashfreePaying}
                  className="p-3 rounded-2xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50/30 text-left flex items-center gap-2.5 transition-all shadow-2xs group active:scale-95"
                >
                  <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center font-black text-[10px]">
                    Paytm
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-800 leading-tight">Paytm UPI</span>
                    <span className="text-[9px] text-slate-400">UPI / Wallet</span>
                  </div>
                </button>

                {/* BHIM / Any UPI */}
                <button
                  type="button"
                  onClick={() => handleProcessCashfreeAuth('BHIM UPI')}
                  disabled={cashfreePaying}
                  className="p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 text-left flex items-center gap-2.5 transition-all shadow-2xs group active:scale-95"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-black text-[10px]">
                    BHIM
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-800 leading-tight">Other UPI</span>
                    <span className="text-[9px] text-slate-400">Any UPI ID</span>
                  </div>
                </button>
              </div>

              {/* Cards & Netbanking button */}
              <button
                type="button"
                onClick={() => handleProcessCashfreeAuth('Card / Netbanking')}
                disabled={cashfreePaying}
                className="w-full mt-2 p-2.5 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left transition-colors"
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-slate-600" />
                  <span className="text-[11px] font-bold text-slate-700">Cards / Netbanking / Wallets</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            {/* Bottom Security Footer */}
            <div className="pt-2 text-center border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Certified Cashfree Security • Zero Waiting Time</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. GUEST PROFILE & PERKS MODAL                            */}
      {/* ========================================================= */}
      {isProfileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-start pt-16 px-4 animate-fade-in pointer-events-none">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs pointer-events-auto" onClick={() => setIsProfileDrawerOpen(false)} />

          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 p-5 space-y-4 animate-slide-up relative z-10 pointer-events-auto max-h-[85vh] flex flex-col overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black shadow-sm">
                  <User className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Guest Profile & Perks</h3>
                  <p className="text-[11px] text-slate-400 font-medium">{restaurant.name} Dining</p>
                </div>
              </div>
              <button 
                onClick={() => setIsProfileDrawerOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Guest Info Card */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold uppercase text-[9px]">Guest Name</span>
                <span className="font-extrabold text-slate-800">{customerName || 'Anonymous Guest'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold uppercase text-[9px]">Mobile</span>
                <span className="font-mono text-slate-700">{customerMobile || 'Not provided'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold uppercase text-[9px]">Current Table</span>
                <span className="font-extrabold text-emerald-700">{tableNumber || 'Table 1'}</span>
              </div>
            </div>

            {/* Available Perks / Offers */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-brand-600" /> Available Offers ({activeOffers.length})
              </span>

              {activeOffers.length === 0 ? (
                <div className="p-4 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                  No active coupons at this time. Check back soon!
                </div>
              ) : (
                <div className="space-y-2">
                  {activeOffers.map((o) => (
                    <div 
                      key={o._id}
                      className="p-3 rounded-2xl border border-slate-200 bg-white hover:border-brand-500/50 transition-all flex items-center justify-between gap-2 shadow-2xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-xs text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200">
                            {o.code}
                          </span>
                          <span className="text-[10px] font-bold text-slate-800">
                            {o.discountType === 'percentage' ? `${o.discountValue}% OFF` : `₹${o.discountValue} FLAT OFF`}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                          {o.title} {o.minOrderValue > 0 && `(Min order ₹${o.minOrderValue})`}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          handleApplyCoupon(o.code);
                          setIsProfileDrawerOpen(false);
                          setIsCartOpen(true);
                        }}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shrink-0 transition-transform active:scale-95"
                      >
                        Apply
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => {
                  setIsProfileDrawerOpen(false);
                  handleRequestBill('cash');
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
              >
                <BellRing className="w-3.5 h-3.5 text-amber-600" />
                <span>Call Staff</span>
              </button>
              <button
                onClick={() => {
                  setIsProfileDrawerOpen(false);
                  handleOpenInvoice();
                }}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-brand-400" />
                <span>My Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerMenu;
