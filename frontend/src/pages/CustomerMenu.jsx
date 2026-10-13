import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
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
  BellRing
} from 'lucide-react';
import InvoiceModal from '../components/InvoiceModal';

const CustomerMenu = () => {
  const { restaurantId } = useParams();
  const [searchParams] = useSearchParams();
  const tableParam = searchParams.get('table') || '';
  const tokenParam = searchParams.get('tableToken') || searchParams.get('token') || '';
  const { socket } = useSocket();

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

  // Customer Checkout fields (persist customer name & mobile in localStorage)
  const [tableNumber, setTableNumber] = useState(tableParam);
  const [customerName, setCustomerName] = useState(() => localStorage.getItem('qr_customer_name') || '');
  const [customerMobile, setCustomerMobile] = useState(() => localStorage.getItem('qr_customer_mobile') || '');
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  // Placed Order feedback
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);

  // Table active orders & running bill state
  const [tableOrders, setTableOrders] = useState([]);
  const [tableBill, setTableBill] = useState(null);
  const [billLoading, setBillLoading] = useState(false);
  const [billRequesting, setBillRequesting] = useState(false);
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [paymentChoice, setPaymentChoice] = useState('cash'); // 'cash' | 'upi' | 'card'
  const [billSuccessMsg, setBillSuccessMsg] = useState('');

  // Invoice & Online/Offline Payment Flow states
  const [orderPaymentMode, setOrderPaymentMode] = useState('cash'); // 'cash' (offline) | 'upi' (online)
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [onlineUpiModalOpen, setOnlineUpiModalOpen] = useState(false);
  const [upiData, setUpiData] = useState(null);
  const [upiPaying, setUpiPaying] = useState(false);

  // 1. Fetch public profile, categories, dishes & verify table token
  useEffect(() => {
    const fetchPublicData = async () => {
      setLoading(true);
      setTableError(null);
      try {
        // Cryptographic table authorization check
        if (tableParam) {
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
        }

        // Fetch restaurant details
        const restRes = await fetch(`/api/restaurant/${restaurantId}/public`);
        const restData = await restRes.json();
        if (restData.success) {
          setRestaurant(restData.data);
          if (!tableParam && restData.data.tables?.length > 0) {
            setTableNumber(restData.data.tables[0]);
          }
        } else {
          setError('Restaurant profile not found.');
          setLoading(false);
          return;
        }

        // Fetch categories
        const catRes = await fetch(`/api/categories/restaurant/${restaurantId}`);
        const catData = await catRes.json();
        if (catData.success) {
          setCategories(catData.data);
        }

        // Fetch dishes
        const dishRes = await fetch(`/api/dishes/restaurant/${restaurantId}`);
        const dishData = await dishRes.json();
        if (dishData.success) {
          setDishes(dishData.data);
        }
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
  }, [restaurantId, tableParam, tokenParam]);

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
  const addToCart = (dish) => {
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
  };

  const removeFromCart = (dishId) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.dishId === dishId);
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item.dishId === dishId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prev.filter((item) => item.dishId !== dishId);
    });
  };

  const getItemQuantityInCart = (dishId) => {
    const item = cart.find((i) => i.dishId === dishId);
    return item ? item.quantity : 0;
  };

  const cartTotalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartTax = Number((cartSubtotal * 0.05).toFixed(2));
  const cartGrandTotal = Number((cartSubtotal + cartTax).toFixed(2));

  // Handle direct order submission with selected payment mode
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!customerName.trim() || !customerMobile.trim() || !tableNumber) {
      alert('Please fill in your name, mobile number and table.');
      return;
    }

    if (cart.length === 0) {
      alert('Your cart is empty. Please add items to order.');
      return;
    }

    // Save name & mobile for quick re-orders
    localStorage.setItem('qr_customer_name', customerName.trim());
    localStorage.setItem('qr_customer_mobile', customerMobile.trim());

    setOrderLoading(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          tableNumber,
          tableToken: tokenParam,
          customerName: customerName.trim(),
          customerMobile: customerMobile.trim(),
          specialInstructions: specialInstructions.trim(),
          paymentMethod: orderPaymentMode,
          paymentStatus: 'pending',
          items: cart.map((i) => ({ dish: i.dishId, quantity: i.quantity })),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setPlacedOrder(data.data);
        setOrderSuccess(true);
        setCart([]);
        setIsCartOpen(false);
        // Refresh table orders and bill
        fetchTableOrders();

        // If online UPI was selected, automatically prepare dynamic UPI data
        if (orderPaymentMode === 'upi') {
          handleOpenOnlineUpi(data.data._id);
        }
      } else {
        alert(data.message || 'Failed to submit order.');
      }
    } catch (error) {
      console.error(error);
      alert('Server connection error. Please try again.');
    } finally {
      setOrderLoading(false);
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
        // Immediately show the updated paid invoice
        handleOpenInvoice();
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

  // Non-blocking Request Bill / Call Waiter API
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
        alert(data.message || 'Unable to request server.');
      }
    } catch (err) {
      console.error(err);
      alert('Error notifying server. Please call staff directly.');
    } finally {
      setBillRequesting(false);
    }
  };

  // Filtered dishes
  const filteredDishes = dishes.filter((dish) => {
    if (!dish.isAvailable) return false;
    const matchesSearch =
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dish.description && dish.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || (dish.category && dish.category._id === selectedCategory);
    const matchesVeg = !vegOnly || dish.isVeg;
    return matchesSearch && matchesCategory && matchesVeg;
  });

  // Group dishes by category for the full categorized view
  const categorizedGroup = categories
    .map((cat) => {
      const catDishes = filteredDishes.filter((d) => d.category && d.category._id === cat._id);
      return {
        category: cat,
        dishes: catDishes,
      };
    })
    .filter((group) => selectedCategory === 'all' ? group.dishes.length > 0 : group.category._id === selectedCategory);

  // Fallback for dishes with uncategorized or deleted categories
  const uncategorizedDishes = filteredDishes.filter(
    (d) => !d.category || !categories.some((c) => c._id === d.category._id)
  );

  // Status badge helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600 animate-spin-slow" /> Kitchen Received
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
            <ChefHat className="w-3 h-3 text-blue-600" /> Cooking in Kitchen
          </span>
        );
      case 'served':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Served at Table
          </span>
        );
      case 'paid':
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
            <Check className="w-3 h-3 text-purple-600" /> Paid & Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-600">
            {status}
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

  // 4. Order Success Instant Modal Feedback
  if (orderSuccess && placedOrder) {
    return (
      <div className="min-h-screen bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-5 text-center animate-slide-up">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <h2 className="text-lg font-black text-slate-900">Order Sent to Kitchen!</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Chef is preparing your food for <span className="font-bold text-slate-800">{placedOrder.tableNumber}</span>.
            </p>
          </div>

          <div className="w-full bg-slate-50 border border-slate-200/80 p-4 rounded-2xl text-left space-y-3">
            <div className="flex justify-between items-center text-xs border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-bold">Order ID: #{placedOrder._id?.slice(-5).toUpperCase()}</span>
              <span className="text-brand-600 font-black">₹{((placedOrder.subtotal || 0) * 1.05).toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-400 uppercase tracking-wider text-[10px]">Payment Option:</span>
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                placedOrder.paymentMethod === 'upi'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {placedOrder.paymentMethod === 'upi' ? 'Online UPI' : 'Cash on Delivery / At Table'}
              </span>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {placedOrder.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs font-semibold text-slate-700">
                  <span>{item.name} × {item.quantity}</span>
                  <span className="text-slate-500">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleOpenInvoice(placedOrder._id)}
                className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs transition-all"
              >
                <Printer className="w-3.5 h-3.5 text-brand-600" />
                <span>Print Bill & QR</span>
              </button>

              {placedOrder.paymentMethod === 'upi' && (
                <button
                  onClick={() => handleOpenOnlineUpi(placedOrder._id)}
                  className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs transition-all"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Pay UPI QR</span>
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setOrderSuccess(false);
                  setActiveTab('bill');
                }}
                className="flex-1 py-3 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-1.5"
              >
                <Receipt className="w-3.5 h-3.5" /> Track Table Bill
              </button>
              <button
                onClick={() => setOrderSuccess(false)}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
              >
                Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col max-w-md mx-auto relative shadow-2xl border-x border-slate-200">
      
      {/* 1. RESTAURANT BRANDING HEADER */}
      <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {restaurant.logo ? (
              <img 
                src={restaurant.logo} 
                alt="Logo" 
                className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center text-lg font-black shrink-0 shadow-sm">
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

          {/* Verified Table Badge */}
          {tableNumber && (
            <div className={`px-2.5 py-1 rounded-xl flex items-center gap-1 border shrink-0 text-[10px] font-black uppercase tracking-wider ${
              isTableVerified
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-brand-50 border-brand-100 text-brand-600'
            }`}>
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>{tableNumber}</span>
            </div>
          )}
        </div>

        {/* 2. DUAL NAVIGATION TABS: [MENU] | [MY TABLE & BILL] */}
        <div className="grid grid-cols-2 gap-2 mt-3 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
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
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
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
          
          {/* SEARCH & VEG TOGGLE BAR */}
          <div className="p-3 bg-white border-b border-slate-100 flex items-center gap-2 sticky top-[105px] z-20">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pizza, pasta, drinks..."
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
          <div className="px-3 py-2 bg-white/95 backdrop-blur-md border-b border-slate-100 flex gap-1.5 overflow-x-auto scrollbar-none sticky top-[157px] z-20">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition-all border ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              All Items ({dishes.length})
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
        <div className="flex-1 p-4 pb-24 space-y-4">
          
          {/* Table Header Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Active Dining Session</div>
              <h2 className="text-base font-black text-slate-900 mt-0.5 flex items-center gap-1.5">
                <span>{tableNumber}</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Verified 🔒
                </span>
              </h2>
            </div>
            <button
              onClick={fetchTableOrders}
              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl border border-slate-200 transition-colors"
              title="Refresh status"
            >
              <RefreshCw className={`w-4 h-4 ${billLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Orders History for Table */}
          {tableOrders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 space-y-3">
              <Receipt className="w-10 h-10 stroke-[1.2] mx-auto text-slate-300" />
              <div>
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">No Orders Placed Yet</h3>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                  Browse the menu and place your first order. Your itemized table bill and real-time food tracking will appear here.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('menu')}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all"
              >
                Browse Menu
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

                  {/* Real-time In-App Bill Feedback */}
                  {billSuccessMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 text-center animate-slide-up flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{billSuccessMsg}</span>
                    </div>
                  )}

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
      {/* FLOATING CART BAR (WHEN ITEMS ARE IN CART)                 */}
      {/* ========================================================= */}
      {activeTab === 'menu' && cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 flex items-center justify-between z-40 shadow-2xl animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-rose-600 border border-white text-white text-[9px] font-black flex items-center justify-center">
                {cartTotalQuantity}
              </span>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400">Total Check</div>
              <div className="text-xs font-black text-brand-600">₹{cartSubtotal.toFixed(2)}</div>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-brand-500/20 flex items-center gap-1.5 transition-all"
          >
            <span>Review Bucket</span>
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* CHECKOUT BUCKET BOTTOM SHEET DRAWER                       */}
      {/* ========================================================= */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-end bg-slate-900/60 backdrop-blur-xs">
          <div className="absolute inset-0" onClick={() => setIsCartOpen(false)}></div>

          <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl p-5 space-y-4 relative z-10 animate-slide-up max-h-[90vh] flex flex-col">
            
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

            {/* Bill Summary in Drawer */}
            <div className="border-t border-slate-100 pt-3 space-y-1 text-xs shrink-0">
              <div className="flex justify-between text-slate-500">
                <span>Items Subtotal</span>
                <span>₹{cartSubtotal.toFixed(2)}</span>
              </div>
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
                  <label className="text-[9px] font-bold uppercase text-slate-400">Your Name</label>
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

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold uppercase text-slate-400">Mobile Number</label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    placeholder="Enter phone number"
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
                  Select Payment Preference
                </label>
                <div className="grid grid-cols-2 gap-2">
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
                      <span className="text-[9px] text-slate-400 leading-tight">Pay cash or scan bill QR</span>
                    </div>
                  </button>

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
                      <span className="text-[11px] font-black leading-tight">Pay Online (UPI)</span>
                      <span className="text-[9px] text-slate-400 leading-tight">Instant QR on screen</span>
                    </div>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={orderLoading}
                className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 disabled:bg-brand-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20"
              >
                {orderLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Send Order to Kitchen 👨‍🍳</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. PRINTABLE / DOWNLOADABLE TAX INVOICE MODAL             */}
      {/* ========================================================= */}
      <InvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        invoiceData={invoiceData}
      />

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

    </div>
  );
};

export default CustomerMenu;
