import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import InvoiceModal from '../components/InvoiceModal';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  Clock, 
  Check, 
  Utensils, 
  Smartphone, 
  Loader2, 
  Inbox,
  User,
  Printer,
  QrCode,
  Banknote,
  BellRing,
  X,
  CreditCard,
  CheckCircle2,
  DollarSign,
  Receipt,
  Filter
} from 'lucide-react';

const Orders = () => {
  const { token } = useAuth();
  const { socket } = useSocket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active view filter: 'pipeline' | 'all' | 'pending_payment' | 'paid'
  const [viewFilter, setViewFilter] = useState('pipeline');

  // Detail Modal states
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Real-time in-app Bill Request Notification banner (No alert box!)
  const [billNotification, setBillNotification] = useState(null);

  // Invoice Modal states
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  // Fetch all orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  // Sockets listener
  useEffect(() => {
    if (socket) {
      socket.on('new_order', (newOrder) => {
        setOrders((prev) => [newOrder, ...prev]);
      });

      socket.on('order_status_updated', (updatedOrder) => {
        setOrders((prev) => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
        setSelectedOrder((curr) => curr?._id === updatedOrder._id ? updatedOrder : curr);
      });

      socket.on('order_payment_updated', (updatedOrder) => {
        setOrders((prev) => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
        setSelectedOrder((curr) => curr?._id === updatedOrder._id ? updatedOrder : curr);
      });

      // Seamless In-App Notification replacing alert()
      socket.on('table_bill_requested', (billData) => {
        setBillNotification({
          tableNumber: billData.tableNumber,
          paymentMethod: billData.paymentMethod || 'cash',
          grandTotal: billData.grandTotal,
          subtotal: billData.subtotal,
          timestamp: new Date(),
        });
        fetchOrders();
      });
    }

    return () => {
      if (socket) {
        socket.off('new_order');
        socket.off('order_status_updated');
        socket.off('order_payment_updated');
        socket.off('table_bill_requested');
      }
    };
  }, [socket]);

  // Update kitchen order status API
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
        if (selectedOrder?._id === orderId) {
          setSelectedOrder(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  // Update order payment status (e.g. cash collected or UPI received)
  const handleUpdatePayment = async (orderId, paymentStatus = 'paid', paymentMethod = 'cash') => {
    try {
      const response = await fetch(`/api/orders/${orderId}/payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          paymentStatus, 
          paymentMethod,
          transactionId: `${paymentMethod.toUpperCase()}-` + Date.now().toString().slice(-6)
        }),
      });
      const data = await response.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, paymentStatus, paymentMethod } : o));
        if (selectedOrder?._id === orderId) {
          setSelectedOrder(prev => ({ ...prev, paymentStatus, paymentMethod }));
        }
        if (invoiceData?.orderId === orderId) {
          setInvoiceData(prev => ({ ...prev, paymentStatus, paymentMethod }));
        }
      }
    } catch (error) {
      console.error('Error updating payment:', error);
    }
  };

  // Open printable Tax Invoice for an order with embedded dynamic UPI QR
  const handleOpenInvoice = async (orderId) => {
    setInvoiceLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/invoice`);
      const json = await res.json();
      if (json.success) {
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
          orderId: json.data.order._id,
        });
        setInvoiceModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to load invoice:', err);
    } finally {
      setInvoiceLoading(false);
    }
  };

  const openDetailModal = (order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  // Pipeline bucket lists
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const acceptedOrders = orders.filter(o => o.status === 'accepted');
  const servedOrders = orders.filter(o => o.status === 'served');

  // Filtered orders list for table views
  const filteredOrders = orders.filter(o => {
    if (viewFilter === 'pending_payment') return o.paymentStatus !== 'paid';
    if (viewFilter === 'paid') return o.paymentStatus === 'paid';
    return true;
  });

  const renderOrderCard = (order) => {
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const grandTotal = Number(((order.subtotal || 0) * 1.05).toFixed(2));
    const isPaid = order.paymentStatus === 'paid';

    return (
      <div
        key={order._id}
        onClick={() => openDetailModal(order)}
        className="bg-white border border-slate-200/80 rounded-2xl p-4 hover:border-brand-500/50 hover:shadow-premium transition-all cursor-pointer flex flex-col gap-3 group relative overflow-hidden shadow-xs"
      >
        {/* Color bar indicator */}
        <div className={`absolute top-0 bottom-0 left-0 w-1 ${
          order.status === 'pending' ? 'bg-amber-500' : order.status === 'accepted' ? 'bg-blue-500' : 'bg-emerald-500'
        }`}></div>

        <div className="flex justify-between items-start pl-1">
          <div className="flex flex-col">
            <span className="text-sm font-black text-slate-800 tracking-tight">{order.tableNumber}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase">{order.customerName}</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-black text-brand-600">₹{grandTotal.toFixed(2)}</span>
            <div className="text-[9px] text-slate-400 font-semibold">incl. GST</div>
          </div>
        </div>

        {/* Payment Status Badges */}
        <div className="flex items-center justify-between pl-1 text-[10px] font-bold">
          <span className={`px-2 py-0.5 rounded-lg uppercase tracking-wider font-extrabold flex items-center gap-1 ${
            isPaid 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            {isPaid ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
            <span>{isPaid ? `PAID (${order.paymentMethod?.toUpperCase() || 'UPI'})` : `PENDING (${order.paymentMethod === 'cash' ? 'CASH' : 'UPI'})`}</span>
          </span>

          <span className="text-slate-400 font-medium">
            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Item count & Quick actions */}
        <div className="flex justify-between items-center pl-1 border-t border-slate-100 pt-2.5 text-[10px] text-slate-400 font-bold">
          <span>{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenInvoice(order._id);
            }}
            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1 transition-colors"
            title="Print Tax Bill with embedded Payment QR"
          >
            <Printer className="w-3 h-3 text-brand-600" />
            <span>Print Bill & QR</span>
          </button>
        </div>

        {/* Pipeline action buttons */}
        <div className="flex gap-1.5 pl-1 mt-0.5">
          {order.status === 'pending' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleUpdateStatus(order._id, 'accepted');
              }}
              className="flex-1 py-1.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-[10px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1 shadow-sm"
            >
              <Check className="w-3 h-3" />
              <span>Accept</span>
            </button>
          )}

          {order.status === 'accepted' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleUpdateStatus(order._id, 'served');
              }}
              className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-[10px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1 shadow-sm"
            >
              <Check className="w-3 h-3" />
              <span>Mark Served</span>
            </button>
          )}

          {/* Quick Collect Cash Action */}
          {!isPaid && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleUpdatePayment(order._id, 'paid', 'cash');
              }}
              className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
              title="Collect Cash from customer"
            >
              <Banknote className="w-3 h-3 text-amber-600" />
              <span>Collect Cash</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar title="Orders & Billing Management" />

        <main className="flex-1 overflow-hidden p-6 sm:p-8 flex flex-col gap-4">
          
          {/* 1. SEAMLESS IN-APP BILL REQUEST NOTIFICATION BANNER */}
          {billNotification && (
            <div className="shrink-0 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-5 py-3 rounded-2xl flex items-center justify-between shadow-lg shadow-amber-500/15 animate-slide-up border border-amber-400">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <BellRing className="w-4 h-4 text-white animate-bounce" />
                </div>
                <div className="min-w-0">
                  <div className="font-black text-sm flex items-center gap-2 flex-wrap">
                    <span>Payment / Bill Requested at {billNotification.tableNumber}!</span>
                    <span className="text-[10px] uppercase bg-black/20 px-2 py-0.5 rounded-full font-bold">
                      {billNotification.paymentMethod === 'cash' ? 'Cash Collection' : 'Online UPI'}
                    </span>
                  </div>
                  <div className="text-xs text-amber-100">
                    Grand Total: ₹{billNotification.grandTotal?.toFixed(2)} • Hand over printed bill with QR or collect cash
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-4">
                <button
                  onClick={() => {
                    const match = orders.find(o => o.tableNumber === billNotification.tableNumber);
                    if (match) {
                      handleOpenInvoice(match._id);
                    }
                    setBillNotification(null);
                  }}
                  className="px-3 py-1.5 bg-white text-amber-900 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-amber-50 transition-colors shadow-xs"
                >
                  Print Bill & QR
                </button>
                <button
                  onClick={() => setBillNotification(null)}
                  className="w-7 h-7 rounded-xl hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* 2. SUBHEADER FILTER CONTROLS */}
          <div className="shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white border border-slate-200/60 p-3 rounded-2xl shadow-soft">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setViewFilter('pipeline')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  viewFilter === 'pipeline'
                    ? 'bg-white text-brand-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Kitchen Pipeline</span>
              </button>

              <button
                onClick={() => setViewFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  viewFilter === 'all'
                    ? 'bg-white text-brand-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>All Orders ({orders.length})</span>
              </button>

              <button
                onClick={() => setViewFilter('pending_payment')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  viewFilter === 'pending_payment'
                    ? 'bg-white text-amber-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Pending Payments ({orders.filter(o => o.paymentStatus !== 'paid').length})</span>
              </button>

              <button
                onClick={() => setViewFilter('paid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  viewFilter === 'paid'
                    ? 'bg-white text-emerald-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Paid ({orders.filter(o => o.paymentStatus === 'paid').length})</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Socket Updates</span>
            </div>
          </div>

          {/* 3. PIPELINE BOARD OR LIST VIEW */}
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-7 h-7 animate-spin text-brand-500" />
              <span className="text-xs text-slate-400 font-semibold">Syncing orders pipeline...</span>
            </div>
          ) : viewFilter === 'pipeline' ? (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden min-h-0">
              
              {/* Column 1: Incoming */}
              <div className="flex flex-col gap-3 overflow-hidden h-full">
                <div className="flex justify-between items-center bg-amber-50 border border-amber-200/60 p-3 rounded-2xl shrink-0">
                  <span className="text-xs font-black text-amber-700 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    Incoming Approvals
                  </span>
                  <span className="w-5 h-5 rounded-md bg-amber-200/80 text-amber-800 flex items-center justify-center text-xs font-black">
                    {pendingOrders.length}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {pendingOrders.length === 0 ? (
                    <div className="h-full border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-white/40">
                      <Inbox className="w-8 h-8 stroke-[1.2] mb-1.5 text-slate-300" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">No pending orders</span>
                    </div>
                  ) : (
                    pendingOrders.map(renderOrderCard)
                  )}
                </div>
              </div>

              {/* Column 2: Kitchen */}
              <div className="flex flex-col gap-3 overflow-hidden h-full">
                <div className="flex justify-between items-center bg-blue-50 border border-blue-200/60 p-3 rounded-2xl shrink-0">
                  <span className="text-xs font-black text-blue-700 uppercase tracking-wider flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-blue-600" />
                    Cooking in Kitchen
                  </span>
                  <span className="w-5 h-5 rounded-md bg-blue-200/80 text-blue-800 flex items-center justify-center text-xs font-black">
                    {acceptedOrders.length}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {acceptedOrders.length === 0 ? (
                    <div className="h-full border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-white/40">
                      <Inbox className="w-8 h-8 stroke-[1.2] mb-1.5 text-slate-300" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Kitchen is idle</span>
                    </div>
                  ) : (
                    acceptedOrders.map(renderOrderCard)
                  )}
                </div>
              </div>

              {/* Column 3: Served */}
              <div className="flex flex-col gap-3 overflow-hidden h-full">
                <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200/60 p-3 rounded-2xl shrink-0">
                  <span className="text-xs font-black text-emerald-700 uppercase tracking-wider flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Served at Table
                  </span>
                  <span className="w-5 h-5 rounded-md bg-emerald-200/80 text-emerald-800 flex items-center justify-center text-xs font-black">
                    {servedOrders.length}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {servedOrders.length === 0 ? (
                    <div className="h-full border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-white/40">
                      <Inbox className="w-8 h-8 stroke-[1.2] mb-1.5 text-slate-300" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">No tables served yet</span>
                    </div>
                  ) : (
                    servedOrders.map(renderOrderCard)
                  )}
                </div>
              </div>

            </div>
          ) : (
            /* LIST / TABLE VIEW FOR ALL / PENDING / PAID ORDERS */
            <div className="flex-1 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-soft overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-black uppercase text-[10px] tracking-wider">
                    <th className="pb-3 pl-2">Table</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Items Count</th>
                    <th className="pb-3">Grand Total</th>
                    <th className="pb-3">Kitchen Status</th>
                    <th className="pb-3">Payment Status</th>
                    <th className="pb-3 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-400 font-bold">
                        No orders matching this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
                      const grandTotal = ((order.subtotal || 0) * 1.05).toFixed(2);
                      const isPaid = order.paymentStatus === 'paid';

                      return (
                        <tr key={order._id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 pl-2 font-black text-slate-900">{order.tableNumber}</td>
                          <td className="py-3.5">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800">{order.customerName}</span>
                              <span className="text-[10px] text-slate-400">{order.customerMobile}</span>
                            </div>
                          </td>
                          <td className="py-3.5 font-bold text-slate-600">{totalItems} items</td>
                          <td className="py-3.5 font-black text-brand-600">₹{grandTotal}</td>
                          <td className="py-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              order.status === 'pending'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : order.status === 'accepted'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              isPaid
                                ? 'bg-emerald-100/70 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-100/70 text-amber-800 border border-amber-200'
                            }`}>
                              {isPaid ? `PAID (${order.paymentMethod?.toUpperCase() || 'UPI'})` : `PENDING (${order.paymentMethod === 'cash' ? 'CASH' : 'UPI'})`}
                            </span>
                          </td>
                          <td className="py-3.5 text-right pr-2">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenInvoice(order._id)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 transition-colors"
                              >
                                <Printer className="w-3 h-3 text-brand-600" />
                                <span>Print Bill</span>
                              </button>

                              {!isPaid && (
                                <button
                                  onClick={() => handleUpdatePayment(order._id, 'paid', 'cash')}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase flex items-center gap-1 transition-colors shadow-xs"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Mark Paid</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* 4. ORDER DETAIL DRAWER */}
      {selectedOrder && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Order Management — ${selectedOrder.tableNumber}`}
        >
          <div className="space-y-5">
            
            {/* Customer & Payment Summary Card */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Guest Order Card</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  selectedOrder.paymentStatus === 'paid'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {selectedOrder.paymentStatus === 'paid' ? 'PAID' : 'PAYMENT PENDING'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Customer Name</span>
                  <span className="font-extrabold text-slate-800">{selectedOrder.customerName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Mobile</span>
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                    {selectedOrder.customerMobile}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Payment Method</span>
                  <span className="font-black text-brand-600 uppercase">
                    {selectedOrder.paymentMethod || 'cash'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Ordered At</span>
                  <span className="font-medium text-slate-600">
                    {new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Dishes Checklist Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase text-[10px]">
                    <th className="py-2.5 pl-4">Dish</th>
                    <th className="py-2.5 text-center">Qty</th>
                    <th className="py-2.5 text-right pr-4">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedOrder.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 pl-4 font-bold text-slate-800">{item.name}</td>
                      <td className="py-2.5 text-center font-bold text-slate-500">×{item.quantity}</td>
                      <td className="py-2.5 text-right pr-4 font-extrabold text-slate-800">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50/80 font-bold border-t border-slate-200">
                    <td className="py-2 pl-4 text-slate-500">Subtotal</td>
                    <td></td>
                    <td className="py-2 text-right pr-4">₹{selectedOrder.subtotal?.toFixed(2)}</td>
                  </tr>
                  <tr className="bg-slate-50/80 font-bold">
                    <td className="py-1.5 pl-4 text-slate-500">GST (5%)</td>
                    <td></td>
                    <td className="py-1.5 text-right pr-4">₹{(selectedOrder.subtotal * 0.05).toFixed(2)}</td>
                  </tr>
                  <tr className="bg-slate-100 font-black text-sm">
                    <td className="py-2.5 pl-4 uppercase text-slate-800">Grand Total</td>
                    <td></td>
                    <td className="py-2.5 text-right pr-4 text-brand-600">
                      ₹{((selectedOrder.subtotal || 0) * 1.05).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Notes */}
            {selectedOrder.specialInstructions && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-mono">
                "{selectedOrder.specialInstructions}"
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    handleOpenInvoice(selectedOrder._id);
                    setIsDetailOpen(false);
                  }}
                  className="py-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-4 h-4 text-brand-600" />
                  <span>Print Bill & QR</span>
                </button>

                {selectedOrder.paymentStatus !== 'paid' ? (
                  <button
                    onClick={() => {
                      handleUpdatePayment(selectedOrder._id, 'paid', 'cash');
                    }}
                    className="py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Banknote className="w-4 h-4" />
                    <span>Collect Cash (Mark Paid)</span>
                  </button>
                ) : (
                  <div className="py-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 text-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Payment Received</span>
                  </div>
                )}
              </div>

              {/* Status progression */}
              {selectedOrder.status === 'pending' && (
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedOrder._id, 'accepted');
                    setIsDetailOpen(false);
                  }}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Accept and Send to Kitchen</span>
                </button>
              )}

              {selectedOrder.status === 'accepted' && (
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedOrder._id, 'served');
                    setIsDetailOpen(false);
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Mark Served at Table</span>
                </button>
              )}
            </div>

          </div>
        </Modal>
      )}

      {/* 5. PRINTABLE INVOICE MODAL WITH EMBEDDED DYNAMIC UPI QR */}
      <InvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        invoiceData={invoiceData}
        isStaff={true}
        onMarkPaid={() => {
          if (invoiceData?.orderId) {
            handleUpdatePayment(invoiceData.orderId, 'paid', 'cash');
          }
        }}
      />

    </div>
  );
};

export default Orders;
