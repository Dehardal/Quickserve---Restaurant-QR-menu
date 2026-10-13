import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { 
  DollarSign, 
  ShoppingBag, 
  Utensils, 
  QrCode, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight 
} from 'lucide-react';

const Dashboard = () => {
  const { token, restaurant } = useAuth();
  const [orders, setOrders] = useState([]);
  const [dishesCount, setDishesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch Orders
        const ordersRes = await fetch('/api/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const ordersData = await ordersRes.json();
        if (ordersData.success) {
          setOrders(ordersData.data);
        }

        // Fetch Dishes
        const dishesRes = await fetch('/api/dishes', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const dishesData = await dishesRes.json();
        if (dishesData.success) {
          setDishesCount(dishesData.data.length);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  // Calculations
  const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
  const pendingPaymentOrders = orders.filter(o => o.paymentStatus !== 'paid');
  const totalRevenue = paidOrders.reduce((acc, curr) => acc + (curr.subtotal * 1.05), 0);
  const pendingRevenue = pendingPaymentOrders.reduce((acc, curr) => acc + (curr.subtotal * 1.05), 0);
  const tableCount = restaurant?.tables?.length || 0;

  // KPI cards metrics mapping
  const kpis = [
    {
      name: 'Collected Revenue',
      value: `₹${totalRevenue.toFixed(2)}`,
      sub: `${paidOrders.length} settled orders`,
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      name: 'Pending Payments',
      value: `₹${pendingRevenue.toFixed(2)}`,
      sub: `${pendingPaymentOrders.length} cash / pending table checks`,
      icon: TrendingUp,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      name: 'Total Orders',
      value: orders.length,
      sub: 'All-time volume',
      icon: ShoppingBag,
      color: 'bg-indigo-50 text-brand-600 border-brand-100',
    },
    {
      name: 'Active Tables',
      value: tableCount,
      sub: 'Monitored QR codes',
      icon: QrCode,
      color: 'bg-rose-50 text-rose-600 border-rose-100',
    },
  ];

  // Simulated popular items list based on actual orders
  const getPopularItems = () => {
    const counts = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        counts[item.name] = (counts[item.name] || 0) + item.quantity;
      });
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  };

  const popularItems = getPopularItems();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar title="Dashboard Console" />
        
        <main className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* Diagnostic Welcome Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-slate-200/60 shadow-soft gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Welcome back, Owner! 👋</h2>
              <p className="text-xs text-slate-400 mt-1 font-medium">Review order streams, edit recipe items, and print table tent QR codes.</p>
            </div>
            <div className="text-[10px] uppercase font-bold text-brand-600 px-3.5 py-1.5 bg-brand-50 border border-brand-100 rounded-xl flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Real-time channel active</span>
            </div>
          </div>

          {/* KPI Dashboard Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div 
                  key={kpi.name}
                  className="bg-white border border-slate-200/65 p-6 rounded-2xl shadow-soft hover:shadow-premium hover:border-slate-300 transition-all flex flex-col gap-4 relative overflow-hidden group cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{kpi.name}</span>
                      <span className="text-2xl font-black text-slate-800 tracking-tight mt-1">{loading ? '...' : kpi.value}</span>
                    </div>
                    <div className={`w-9 h-9 rounded-xl border ${kpi.color} flex items-center justify-center shadow-sm`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 leading-none">{kpi.sub}</span>
                </div>
              );
            })}
          </div>

          {/* Statistics Sections (High Fidelity Stripe Style Chart) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Visual SVGs Order Trend Chart */}
            <div className="lg:col-span-2 bg-white border border-slate-200/65 rounded-2xl p-6 shadow-soft flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">Order Velocity</h3>
                  <span className="text-[10px] text-slate-400 font-medium mt-0.5">Performance index based on order frequencies</span>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 flex items-center gap-1">
                  <span>Last 7 Days</span>
                </span>
              </div>

              {/* Outstanding Vector Line Chart */}
              <div className="h-60 w-full relative">
                {/* Horizontal Guide grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between py-2.5 opacity-60">
                  <div className="border-b border-dashed border-slate-100 w-full"></div>
                  <div className="border-b border-dashed border-slate-100 w-full"></div>
                  <div className="border-b border-dashed border-slate-100 w-full"></div>
                  <div className="border-b border-dashed border-slate-100 w-full"></div>
                </div>

                {/* Styled SVG Chart Path Area */}
                <svg className="w-full h-full relative z-10" viewBox="0 0 600 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chart-area-glow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <path d="M 0 0 L 0 200 M 100 0 L 100 200 M 200 0 L 200 200 M 300 0 L 300 200 M 400 0 L 400 200 M 500 0 L 500 200" stroke="#f1f5f9" strokeWidth="1" />
                  
                  {/* Area under curve */}
                  <path d="M 0 170 C 80 150, 120 80, 200 110 C 280 130, 320 50, 400 65 C 480 80, 520 120, 600 135 L 600 200 L 0 200 Z" fill="url(#chart-area-glow)" />
                  
                  {/* Smooth curved trend line */}
                  <path 
                    d="M 0 170 C 80 150, 120 80, 200 110 C 280 130, 320 50, 400 65 C 480 80, 520 120, 600 135" 
                    fill="none" 
                    stroke="#6366f1" 
                    strokeWidth="3.5" 
                    strokeLinecap="round"
                  />
                  
                  {/* Anchor Dots */}
                  <circle cx="200" cy="110" r="5" fill="#6366f1" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="400" cy="65" r="5" fill="#6366f1" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="600" cy="135" r="5" fill="#6366f1" stroke="#ffffff" strokeWidth="2" />
                </svg>

                {/* X Axis Labels */}
                <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-2 px-1 relative z-15">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
            </div>

            {/* Popular Items bar lists */}
            <div className="bg-white border border-slate-200/65 rounded-2xl p-6 shadow-soft flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">Popular Recipes</h3>
              </div>

              <div className="flex-1 flex flex-col gap-4">
                {loading ? (
                  <span className="text-xs text-slate-400">Loading recipes statistics...</span>
                ) : popularItems.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 gap-1.5 py-6">
                    <Utensils className="w-8 h-8 stroke-[1.2]" />
                    <span className="text-[10px] font-bold uppercase">No data cataloged</span>
                  </div>
                ) : (
                  popularItems.map((item, idx) => {
                    const maxCount = Math.max(...popularItems.map(i => i.count));
                    const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                    return (
                      <div key={idx} className="flex flex-col gap-2">
                        <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                          <span className="truncate pr-4">{item.name}</span>
                          <span className="shrink-0 text-slate-400">{item.count} orders</span>
                        </div>
                        {/* Custom progress bar */}
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-brand-500 rounded-full transition-all duration-500" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Recent Orders table */}
            <div className="lg:col-span-3 bg-white border border-slate-200/65 rounded-2xl p-6 shadow-soft flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">Transaction Stream</h3>
                <a 
                  href="/orders"
                  className="text-xs font-bold text-brand-600 hover:text-brand-500 flex items-center gap-0.5"
                >
                  <span>Open Pipeline Board</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3 pl-2">Location</th>
                      <th className="pb-3">Customer Profile</th>
                      <th className="pb-3">Check Subtotal</th>
                      <th className="pb-3">Pipeline Status</th>
                      <th className="pb-3 text-right pr-2">Received Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="py-6 text-center text-slate-400 font-semibold">Fetching recent stream...</td>
                      </tr>
                    ) : orders.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-slate-400 font-semibold">No orders logged yet. Share your QR table templates to begin.</td>
                      </tr>
                    ) : (
                      orders.slice(0, 5).map((order) => (
                        <tr key={order._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 pl-2 font-bold text-slate-800">{order.tableNumber}</td>
                          <td className="py-3.5">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-slate-700">{order.customerName}</span>
                              <span className="text-[9px] text-slate-400 font-semibold">{order.customerMobile}</span>
                            </div>
                          </td>
                          <td className="py-3.5 font-black text-slate-800">₹{(order.subtotal * 1.05).toFixed(2)}</td>
                          <td className="py-3.5">
                            <div className="flex flex-col gap-1 items-start">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                                order.status === 'pending' 
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                                  : order.status === 'accepted' 
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}>
                                <span className={`w-1 h-1 rounded-full ${
                                  order.status === 'pending' ? 'bg-amber-500' : order.status === 'accepted' ? 'bg-blue-500' : 'bg-emerald-500'
                                }`}></span>
                                {order.status}
                              </span>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.2 rounded-md ${
                                order.paymentStatus === 'paid'
                                  ? 'bg-emerald-100/70 text-emerald-800'
                                  : 'bg-amber-100/70 text-amber-800'
                              }`}>
                                {order.paymentStatus === 'paid' ? 'PAID (UPI)' : 'PAYMENT PENDING (Cash)'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 text-right text-slate-400 font-medium pr-2">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
