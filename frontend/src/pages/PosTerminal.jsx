import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import InvoiceModal from '../components/InvoiceModal';
import { useAuth } from '../context/AuthContext';
import '../styles/pages/pos-terminal.css';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Store,
  Utensils,
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle2,
  Printer,
  Receipt,
  RotateCcw,
  User,
  Phone,
  Tag,
  AlertCircle,
  Percent,
  Check,
  ShoppingBag,
  Flame,
  Leaf
} from 'lucide-react';

const PosTerminal = () => {
  const { token, restaurant } = useAuth();
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegFilter, setVegFilter] = useState('all'); // 'all' | 'veg' | 'nonveg'

  // Cart & Order state
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('counter'); // 'counter' (takeaway) | 'dine_in'
  const [tableNumber, setTableNumber] = useState('Counter Desk');
  const [customerName, setCustomerName] = useState('Walk-in Guest');
  const [customerMobile, setCustomerMobile] = useState('');
  const [notes, setNotes] = useState('');

  // Payment & Billing state
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('flat'); // 'flat' | 'percentage'
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' | 'upi' | 'card'
  const [cashTendered, setCashTendered] = useState('');

  // Actions state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  // Fetch Dishes & Categories
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dishesRes, categoriesRes] = await Promise.all([
          fetch('/api/dishes', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/categories', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const dishesJson = await dishesRes.json();
        const categoriesJson = await categoriesRes.json();

        if (dishesJson.success) setDishes(dishesJson.data || []);
        if (categoriesJson.success) setCategories(categoriesJson.data || []);
      } catch (err) {
        console.error('POS fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  // Filtered dishes
  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      const matchesCat =
        selectedCategory === 'all' ||
        (dish.category && (dish.category._id === selectedCategory || dish.category === selectedCategory));

      const matchesSearch =
        searchQuery === '' ||
        dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (dish.description && dish.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesVeg =
        vegFilter === 'all' ||
        (vegFilter === 'veg' && dish.isVeg) ||
        (vegFilter === 'nonveg' && !dish.isVeg);

      return matchesCat && matchesSearch && matchesVeg;
    });
  }, [dishes, selectedCategory, searchQuery, vegFilter]);

  // Cart operations
  const addToCart = (dish) => {
    if (dish.trackStock && dish.stockQuantity <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.dish._id === dish._id);
      if (existing) {
        return prev.map((item) =>
          item.dish._id === dish._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { dish, quantity: 1, price: dish.price, name: dish.name }];
    });
  };

  const updateQuantity = (dishId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.dish._id === dishId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (dishId) => {
    setCart((prev) => prev.filter((item) => item.dish._id !== dishId));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName('Walk-in Guest');
    setCustomerMobile('');
    setNotes('');
    setDiscount(0);
    setCashTendered('');
    setCompletedOrder(null);
  };

  // Bill calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const calculatedDiscount = useMemo(() => {
    const val = Number(discount) || 0;
    if (discountType === 'percentage') {
      return Math.round((subtotal * Math.min(100, Math.max(0, val))) / 100);
    }
    return Math.min(subtotal, Math.max(0, val));
  }, [subtotal, discount, discountType]);

  const grandTotal = Math.max(0, subtotal - calculatedDiscount);

  // Cash change calculation
  const changeDue = useMemo(() => {
    const tendered = Number(cashTendered) || 0;
    return tendered > grandTotal ? tendered - grandTotal : 0;
  }, [cashTendered, grandTotal]);

  // Handle Order Placement
  const handlePunchOrder = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    try {
      const payload = {
        tableNumber: orderType === 'counter' ? 'Counter Desk' : (tableNumber || 'Counter Dine-in'),
        orderType: orderType === 'counter' ? 'counter' : 'dine_in',
        customerName: customerName.trim() || 'Walk-in Guest',
        customerMobile: customerMobile.trim() || '',
        items: cart.map((item) => ({
          dish: item.dish._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        discount: calculatedDiscount,
        paymentMethod,
        paymentStatus: 'paid', // Cashier counter orders are marked collected
        specialInstructions: notes.trim(),
      };

      const res = await fetch('/api/orders/pos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setCompletedOrder(json.data);

        // Update local dish stocks if tracked
        setDishes((prev) =>
          prev.map((d) => {
            const purchased = cart.find((item) => item.dish._id === d._id);
            if (purchased && d.trackStock) {
              const newQty = Math.max(0, (d.stockQuantity || 0) - purchased.quantity);
              return {
                ...d,
                stockQuantity: newQty,
                isAvailable: newQty > 0,
              };
            }
            return d;
          })
        );
      } else {
        alert(json.message || 'Failed to punch POS order');
      }
    } catch (err) {
      console.error('POS punch error:', err);
      alert('Error connecting to POS server');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open invoice / thermal print modal
  const handlePrintReceipt = async (orderId) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/invoice`);
      const json = await res.json();
      if (json.success) {
        setInvoiceData(json.data);
        setInvoiceModalOpen(true);
      }
    } catch (err) {
      console.error('Fetch invoice error:', err);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />

        {/* POS Header Ribbon */}
        <div className="bg-white border-b border-slate-200/90 px-6 py-3 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 border border-brand-200 flex items-center justify-center font-bold">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-slate-900 leading-tight font-outfit">
                  Reception & Counter POS
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  ● Terminal Online
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Fast touchscreen order punch for walk-in guests & counter billing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setOrderType('counter')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  orderType === 'counter'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Counter Pickup
              </button>
              <button
                onClick={() => setOrderType('dine_in')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  orderType === 'dine_in'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dine-in at Counter
              </button>
            </div>

            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="px-3 py-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 border border-transparent hover:border-rose-200 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* POS Workstation Split Area */}
        <div className="pos-container">
          {/* LEFT: Menu Browsing & Dish Cards Grid */}
          <div className="pos-menu-panel p-5">
            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Quick search dishes by name or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 shadow-xs transition"
                />
              </div>

              {/* Veg / Non-Veg Switcher */}
              <div className="flex bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold shrink-0 shadow-xs">
                <button
                  onClick={() => setVegFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    vegFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({dishes.length})
                </button>
                <button
                  onClick={() => setVegFilter('veg')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition ${
                    vegFilter === 'veg'
                      ? 'bg-emerald-600 text-white'
                      : 'text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  <Leaf className="w-3.5 h-3.5" /> Veg
                </button>
                <button
                  onClick={() => setVegFilter('nonveg')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition ${
                    vegFilter === 'nonveg'
                      ? 'bg-rose-600 text-white'
                      : 'text-rose-700 hover:bg-rose-50'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" /> Non-Veg
                </button>
              </div>
            </div>

            {/* Category Pills Rail */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none shrink-0">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                All Menu
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCategory(cat._id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat._id
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Dishes Touch Grid */}
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400">
                <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-brand-600 animate-spin mb-2"></div>
                <span className="text-xs">Loading Menu Items...</span>
              </div>
            ) : filteredDishes.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
                <Utensils className="w-8 h-8 text-slate-300 mb-2" />
                <span className="text-sm font-bold text-slate-700">No dishes match your filter</span>
                <span className="text-xs text-slate-400 mt-1">Try another search keyword or category</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredDishes.map((dish) => {
                  const inCartItem = cart.find((i) => i.dish._id === dish._id);
                  const isOutOfStock = (dish.trackStock && dish.stockQuantity <= 0) || !dish.isAvailable;

                  return (
                    <div
                      key={dish._id}
                      onClick={() => !isOutOfStock && addToCart(dish)}
                      className={`pos-dish-card bg-white border rounded-2xl p-3 flex flex-col justify-between relative overflow-hidden ${
                        isOutOfStock
                          ? 'opacity-50 cursor-not-allowed border-slate-200 bg-slate-50'
                          : inCartItem
                          ? 'border-brand-500 ring-2 ring-brand-500/10'
                          : 'border-slate-200/90 hover:border-slate-300'
                      }`}
                    >
                      {/* Veg / Non-Veg Indicator Dot */}
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <div
                          className={`w-3.5 h-3.5 rounded border p-0.5 flex items-center justify-center shrink-0 ${
                            dish.isVeg
                              ? 'border-emerald-500 text-emerald-500'
                              : 'border-rose-500 text-rose-500'
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              dish.isVeg ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                        </div>

                        {/* Stock or Cart count badge */}
                        {dish.trackStock && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              dish.stockQuantity <= 0
                                ? 'bg-rose-50 text-rose-600'
                                : dish.stockQuantity <= (dish.lowStockThreshold || 5)
                                ? 'bg-amber-50 text-amber-600'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {dish.stockQuantity <= 0 ? 'Sold Out' : `${dish.stockQuantity} left`}
                          </span>
                        )}

                        {inCartItem && (
                          <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] font-black flex items-center justify-center shrink-0 shadow-xs">
                            {inCartItem.quantity}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 mt-1">
                        <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                          {dish.name}
                        </h3>
                        {dish.description && (
                          <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                            {dish.description}
                          </p>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-xs font-black text-slate-900 font-mono">
                          ₹{dish.price}
                        </span>

                        <button
                          disabled={isOutOfStock}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition ${
                            isOutOfStock
                              ? 'bg-slate-200 text-slate-400'
                              : 'bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT: Live Cart, Billing & Payment Terminal */}
          <div className="pos-cart-panel">
            {completedOrder ? (
              /* Success Order Banner */
              <div className="p-6 flex-1 flex flex-col items-center justify-center text-center space-y-4 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    KOT Dispatched to Kitchen
                  </span>
                  <h2 className="text-3xl font-black text-slate-900 mt-2 font-mono">
                    Token {completedOrder.tokenNumber || `#${completedOrder._id.slice(-4)}`}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Order punched for <strong>{completedOrder.customerName}</strong>
                  </p>
                </div>

                <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2 text-left">
                  <div className="flex justify-between text-slate-600">
                    <span>Total Amount:</span>
                    <span className="font-bold text-slate-900 font-mono">₹{completedOrder.grandTotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Payment Mode:</span>
                    <span className="font-bold uppercase font-mono text-slate-900">
                      {completedOrder.paymentMethod} (PAID)
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Items Count:</span>
                    <span className="font-mono text-slate-900">
                      {completedOrder.items.reduce((s, i) => s + i.quantity, 0)} items
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 w-full pt-2">
                  <button
                    onClick={() => handlePrintReceipt(completedOrder._id)}
                    className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Bill / KOT</span>
                  </button>
                  <button
                    onClick={clearCart}
                    className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    Next Order
                  </button>
                </div>
              </div>
            ) : (
              /* Active Cart Punching */
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Cart Customer Info Bar */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/70 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <User className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Guest Name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Mobile (Optional)"
                        value={customerMobile}
                        onChange={(e) => setCustomerMobile(e.target.value)}
                        className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  {orderType === 'dine_in' && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-600">Table:</span>
                      <input
                        type="text"
                        placeholder="Table No (e.g. Table 4)"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-brand-500 font-bold"
                      />
                    </div>
                  )}
                </div>

                {/* Cart Items List */}
                <div className="pos-cart-scroll p-4 space-y-2.5">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
                      <ShoppingBag className="w-8 h-8 text-slate-300 mb-2 stroke-[1.5]" />
                      <span className="text-xs font-bold text-slate-600">Order Ticket is Empty</span>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                        Tap dishes on the left menu to add them to this counter order.
                      </p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div
                        key={item.dish._id}
                        className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/90 flex items-center justify-between gap-2"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
                          <span className="text-[11px] font-semibold text-slate-500 font-mono">
                            ₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                          <button
                            onClick={() => updateQuantity(item.dish._id, -1)}
                            className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-black font-mono px-1 min-w-[16px] text-center text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.dish._id, 1)}
                            className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.dish._id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Billing, Discount & Payment Area */}
                {cart.length > 0 && (
                  <div className="p-4 border-t border-slate-200 bg-white space-y-3 shrink-0 shadow-lg">
                    {/* Quick Discount Input */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 relative">
                        <Tag className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="number"
                          placeholder="Discount"
                          value={discount || ''}
                          onChange={(e) => setDiscount(e.target.value)}
                          className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-brand-500 font-mono"
                        />
                      </div>
                      <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
                        <button
                          onClick={() => setDiscountType('flat')}
                          className={`px-2 py-1 rounded ${
                            discountType === 'flat' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                          }`}
                        >
                          ₹ Flat
                        </button>
                        <button
                          onClick={() => setDiscountType('percentage')}
                          className={`px-2 py-1 rounded ${
                            discountType === 'percentage'
                              ? 'bg-white text-slate-900 shadow-2xs'
                              : 'text-slate-500'
                          }`}
                        >
                          % Off
                        </button>
                      </div>
                    </div>

                    {/* Payment Mode Selector */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Payment Mode Collected:
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          onClick={() => setPaymentMethod('cash')}
                          className={`py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition ${
                            paymentMethod === 'cash'
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <Banknote className="w-3.5 h-3.5" /> Cash
                        </button>
                        <button
                          onClick={() => setPaymentMethod('upi')}
                          className={`py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition ${
                            paymentMethod === 'upi'
                              ? 'bg-brand-50 border-brand-500 text-brand-800 shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <QrCode className="w-3.5 h-3.5" /> UPI QR
                        </button>
                        <button
                          onClick={() => setPaymentMethod('card')}
                          className={`py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition ${
                            paymentMethod === 'card'
                              ? 'bg-slate-900 border-slate-900 text-white shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <CreditCard className="w-3.5 h-3.5" /> Card / POS
                        </button>
                      </div>
                    </div>

                    {/* Cash Tendered Calculator (if Cash chosen) */}
                    {paymentMethod === 'cash' && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 font-medium">Cash Tendered:</span>
                          <input
                            type="number"
                            placeholder={`₹${grandTotal}`}
                            value={cashTendered}
                            onChange={(e) => setCashTendered(e.target.value)}
                            className="w-24 px-2 py-0.5 text-right font-mono font-bold bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-brand-500"
                          />
                        </div>
                        {changeDue > 0 && (
                          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/80 font-bold text-emerald-700">
                            <span>Return Change:</span>
                            <span className="font-mono text-sm">₹{changeDue}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Subtotal, Discount & Total */}
                    <div className="space-y-1 text-xs pt-1">
                      <div className="flex justify-between text-slate-500">
                        <span>Subtotal:</span>
                        <span className="font-mono">₹{subtotal}</span>
                      </div>
                      {calculatedDiscount > 0 && (
                        <div className="flex justify-between text-emerald-600 font-semibold">
                          <span>Discount:</span>
                          <span className="font-mono">-₹{calculatedDiscount}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-baseline pt-1.5 border-t border-slate-200 text-slate-900 font-bold">
                        <span className="text-sm">Total to Collect:</span>
                        <span className="text-xl font-black font-mono text-slate-900">
                          ₹{grandTotal}
                        </span>
                      </div>
                    </div>

                    {/* Main Punch & Print Button */}
                    <button
                      onClick={handlePunchOrder}
                      disabled={isSubmitting || cart.length === 0}
                      className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-brand-500/20 transition cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                          <span>Punching KOT...</span>
                        </>
                      ) : (
                        <>
                          <Printer className="w-4 h-4" />
                          <span>Dispatch KOT & Collect ₹{grandTotal}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invoice / KOT Modal */}
      {invoiceModalOpen && invoiceData && (
        <InvoiceModal
          isOpen={invoiceModalOpen}
          onClose={() => setInvoiceModalOpen(false)}
          invoice={invoiceData}
        />
      )}
    </div>
  );
};

export default PosTerminal;
