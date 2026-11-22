import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  Globe, 
  Plus, 
  ExternalLink, 
  Copy, 
  Check, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  UtensilsCrossed, 
  ShoppingBag, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Palette, 
  Key, 
  X,
  Server,
  DollarSign,
  Sliders,
  Store,
  Boxes,
  QrCode,
  Truck,
  Ticket,
  CreditCard,
  ChefHat,
  Eye,
  LogIn,
  Search,
  Filter
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// Curated 3-Color Combined Palette Presets
const COLOR_PRESETS = [
  {
    name: 'Modern Indigo',
    primary: '#4f46e5',
    secondary: '#312e81',
    accent: '#06b6d4',
  },
  {
    name: 'Sunset Amber',
    primary: '#f97316',
    secondary: '#7c2d12',
    accent: '#eab308',
  },
  {
    name: 'Emerald Cafe',
    primary: '#059669',
    secondary: '#064e3b',
    accent: '#10b981',
  },
  {
    name: 'Royal Velvet',
    primary: '#e11d48',
    secondary: '#881337',
    accent: '#fb7185',
  },
  {
    name: 'Mocha & Caramel',
    primary: '#78350f',
    secondary: '#451a03',
    accent: '#d97706',
  },
  {
    name: 'Cyber Neon',
    primary: '#6366f1',
    secondary: '#0f172a',
    accent: '#10b981',
  },
  {
    name: 'Rose Blossom',
    primary: '#ec4899',
    secondary: '#831843',
    accent: '#f43f5e',
  },
];

// Available system modules / features
const SYSTEM_FEATURES = [
  {
    key: 'posTerminal',
    name: 'Counter POS Terminal',
    desc: 'Touchscreen cashier billing for walk-in orders & cash/UPI tender',
    icon: Store,
  },
  {
    key: 'inventoryManagement',
    name: 'Inventory & Stock Management',
    desc: 'Ingredient tracking, automatic stock deduction & sold-out protection',
    icon: Boxes,
  },
  {
    key: 'dineInOrdering',
    name: 'Dine-In Table QR Ordering',
    desc: 'Table tent QR scanning with multi-round order accumulation',
    icon: QrCode,
  },
  {
    key: 'takeawayOrdering',
    name: 'Takeaway Counter Pickup',
    desc: 'Customer QR ordering for counter pickup with daily token numbers',
    icon: ShoppingBag,
  },
  {
    key: 'corporateDelivery',
    name: 'Corporate Office Delivery',
    desc: 'Desk & building drop-off QR ordering for office campuses',
    icon: Truck,
  },
  {
    key: 'offersAndPromos',
    name: 'Offers & Promo Codes',
    desc: 'First-time user discounts, flat/percentage coupons, BOGO deals',
    icon: Ticket,
  },
  {
    key: 'onlinePayments',
    name: 'Online UPI & Card Gateway',
    desc: 'Instant direct checkout via UPI QR code or Cashfree payment gateway',
    icon: CreditCard,
  },
  {
    key: 'liveKitchenDisplay',
    name: 'Live Kitchen Display (KDS)',
    desc: 'Real-time WebSocket audio chime, ticket dispatching & print',
    icon: ChefHat,
  },
];

const AgencyPortal = () => {
  const { user, token, logout, login } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [dnsModalClient, setDnsModalClient] = useState(null);
  const [dnsGuideData, setDnsGuideData] = useState(null);
  const [editClientModal, setEditClientModal] = useState(null);
  const [featuresModalClient, setFeaturesModalClient] = useState(null);
  const [clientFeaturesState, setClientFeaturesState] = useState({});
  const [openLauncherClient, setOpenLauncherClient] = useState(null);
  const [copiedText, setCopiedText] = useState(null);

  // Form state for Onboard New Restaurant
  const [newClient, setNewClient] = useState({
    restaurantName: '',
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
    customDomain: '',
    slug: '',
    contactNumber: '',
    address: '',
    primaryColor: '#4f46e5',
    secondaryColor: '#312e81',
    accentColor: '#06b6d4',
    upiId: '',
    tableCount: 6,
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
  });
  const [creating, setCreating] = useState(false);
  const [createSuccessMsg, setCreateSuccessMsg] = useState(null);

  // Fetch all clients
  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/agency/restaurants', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setClients(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch clients');
      }
    } catch (err) {
      setError('Network error while connecting to management API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Copy helper
  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedText(key);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // Open DNS Guide Modal
  const openDnsGuide = async (client) => {
    setDnsModalClient(client);
    setDnsGuideData(null);
    try {
      const res = await fetch(`/api/agency/dns-guide/${client._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setDnsGuideData(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Open Features Modal for a Client
  const openFeaturesModal = (client) => {
    setFeaturesModalClient(client);
    setClientFeaturesState(
      client.features || {
        posTerminal: true,
        inventoryManagement: true,
        dineInOrdering: true,
        takeawayOrdering: true,
        corporateDelivery: true,
        offersAndPromos: true,
        onlinePayments: true,
        liveKitchenDisplay: true,
      }
    );
  };

  // Save Features for a Client
  const handleSaveFeatures = async () => {
    if (!featuresModalClient) return;
    try {
      const res = await fetch(`/api/agency/restaurants/${featuresModalClient._id}/features`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ features: clientFeaturesState }),
      });
      const json = await res.json();
      if (json.success) {
        setFeaturesModalClient(null);
        fetchClients();
      } else {
        alert(json.message || 'Failed to update client features');
      }
    } catch (err) {
      console.error('Update features error:', err);
      alert('Error updating client features');
    }
  };

  // Impersonate / Launch Client Portal
  const handleImpersonate = async (clientId) => {
    try {
      const res = await fetch(`/api/agency/impersonate/${clientId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        // Save impersonated session and navigate to dashboard in a new tab or current
        localStorage.setItem('token', json.token);
        localStorage.setItem('user', JSON.stringify(json.user));
        if (json.restaurant) {
          localStorage.setItem('restaurant', JSON.stringify(json.restaurant));
        }
        window.open('/dashboard', '_blank');
      } else {
        alert(json.message || 'Could not launch client portal');
      }
    } catch (err) {
      console.error('Impersonate error:', err);
      alert('Failed to launch portal');
    }
  };

  // Handle Client Creation
  const handleCreateClient = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateSuccessMsg(null);
    try {
      const tables = Array.from(
        { length: Number(newClient.tableCount) || 5 },
        (_, i) => `Table ${i + 1}`
      );

      const res = await fetch('/api/agency/restaurants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newClient,
          tables,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCreateSuccessMsg(`Restaurant "${newClient.restaurantName}" onboarded successfully!`);
        setShowAddModal(false);
        setNewClient({
          restaurantName: '',
          ownerName: '',
          ownerEmail: '',
          ownerPassword: '',
          customDomain: '',
          slug: '',
          contactNumber: '',
          address: '',
          primaryColor: '#4f46e5',
          secondaryColor: '#312e81',
          accentColor: '#06b6d4',
          upiId: '',
          tableCount: 6,
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
        });
        fetchClients();
      } else {
        alert(data.message || 'Failed to create restaurant');
      }
    } catch (err) {
      alert('Error creating client restaurant');
    } finally {
      setCreating(false);
    }
  };

  // Handle Client Update
  const handleUpdateClient = async (e) => {
    e.preventDefault();
    if (!editClientModal) return;

    try {
      const res = await fetch(`/api/agency/restaurants/${editClientModal._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editClientModal.name,
          customDomain: editClientModal.customDomain,
          slug: editClientModal.slug,
          status: editClientModal.status,
          contactNumber: editClientModal.contactNumber,
          address: editClientModal.address,
          upiId: editClientModal.upiId,
          branding: editClientModal.branding,
          features: editClientModal.features,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditClientModal(null);
        fetchClients();
      } else {
        alert(data.message || 'Failed to update client');
      }
    } catch (err) {
      alert('Error updating client');
    }
  };

  // Delete Client
  const handleDeleteClient = async (id, name) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete "${name}" and all their dishes, categories, and orders?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/agency/restaurants/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchClients();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error deleting client');
    }
  };

  // Filtered clients
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        q === '' ||
        c.name.toLowerCase().includes(q) ||
        (c.customDomain && c.customDomain.toLowerCase().includes(q)) ||
        (c.owner?.email && c.owner.email.toLowerCase().includes(q)) ||
        (c.owner?.name && c.owner.name.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [clients, searchQuery, statusFilter]);

  // Total summary calculations
  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === 'active').length;
  const totalDishes = clients.reduce((acc, c) => acc + (c.stats?.dishes || 0), 0);
  const totalOrders = clients.reduce((acc, c) => acc + (c.stats?.orders || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Top Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Server className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base text-white tracking-tight flex items-center gap-2">
              Master Admin Console
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/30">
                Super Admin
              </span>
            </h1>
            <p className="text-xs text-slate-400">Multi-Tenant Client Portfolio & Feature Management</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-medium text-xs rounded-xl shadow-md shadow-brand-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard Restaurant</span>
          </button>

          <div className="h-6 w-px bg-slate-800 mx-1"></div>

          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-slate-200">{user?.name || 'Super Admin'}</p>
            <p className="text-[10px] text-slate-400">{user?.email}</p>
          </div>

          <button
            onClick={logout}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition border border-transparent hover:border-rose-500/20"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Banner Alert */}
        {createSuccessMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{createSuccessMsg}</span>
            </div>
            <button onClick={() => setCreateSuccessMsg(null)} className="text-emerald-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Client Brands</p>
              <h3 className="text-2xl font-black text-white mt-1">{totalClients}</h3>
              <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> {activeClients} Active Clients
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Custom Domains</p>
              <h3 className="text-2xl font-black text-white mt-1">
                {clients.filter((c) => c.customDomain).length}
              </h3>
              <p className="text-xs text-slate-400 mt-1">White-label hostnames</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <Globe className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Menu Dishes</p>
              <h3 className="text-2xl font-black text-white mt-1">{totalDishes}</h3>
              <p className="text-xs text-slate-400 mt-1">Catalog items tracked</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Orders Processed</p>
              <h3 className="text-2xl font-black text-white mt-1">{totalOrders}</h3>
              <p className="text-xs text-slate-400 mt-1">Direct digital volume</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Client Restaurants Section with Search & Filter */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Client Portfolio & Feature Entitlements</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage features, tri-color brand palettes, domains, and launch client portals directly.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search client, domain or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500 w-52 sm:w-64"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="suspended">Suspended</option>
              </select>

              <button
                onClick={fetchClients}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-400" />
              <p className="text-xs">Loading client portfolio...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-rose-400 space-y-2">
              <AlertCircle className="w-6 h-6 mx-auto" />
              <p className="text-sm">{error}</p>
              <button
                onClick={fetchClients}
                className="text-xs px-3 py-1 bg-rose-500/20 text-rose-300 rounded-lg hover:bg-rose-500/30"
              >
                Retry
              </button>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No Client Restaurants Found</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Click "Onboard Restaurant" to deploy a brand with custom domain & 3-color palette.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs rounded-xl shadow-md transition"
              >
                <Plus className="w-4 h-4" />
                Onboard First Client
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold bg-slate-950/40">
                    <th className="p-4 pl-6">Restaurant Brand</th>
                    <th className="p-4">Domain / Slug</th>
                    <th className="p-4">Owner Credentials</th>
                    <th className="p-4">3-Color Brand Palette</th>
                    <th className="p-4">Enabled Features</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 pr-6 text-right">Launch & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredClients.map((c) => {
                    const feat = c.features || {};
                    const primary = c.branding?.primaryColor || '#4f46e5';
                    const secondary = c.branding?.secondaryColor || '#312e81';
                    const accent = c.branding?.accentColor || '#06b6d4';

                    return (
                      <tr key={c._id} className="hover:bg-slate-800/30 transition">
                        {/* Name & Logo */}
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            {c.logo ? (
                              <img src={c.logo} alt="" className="w-9 h-9 rounded-xl object-cover bg-slate-800" />
                            ) : (
                              <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-sm"
                                style={{ backgroundColor: primary }}
                              >
                                {c.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <span className="font-bold text-white text-sm block">{c.name}</span>
                              <span className="text-[11px] text-slate-400">
                                {c.tables?.length || 0} Tables · {c.stats?.dishes || 0} Dishes · {c.stats?.orders || 0} Orders
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Custom Domain / Slug */}
                        <td className="p-4">
                          {c.customDomain ? (
                            <div className="space-y-1">
                              <a
                                href={`https://${c.customDomain}`}
                                target="_blank"
                                rel="noreferrer"
                                className="font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 font-semibold"
                              >
                                <Globe className="w-3.5 h-3.5" />
                                {c.customDomain}
                                <ExternalLink className="w-3 h-3 text-slate-500" />
                              </a>
                              <button
                                onClick={() => openDnsGuide(c)}
                                className="text-[10px] text-slate-400 hover:text-amber-400 underline flex items-center gap-1"
                              >
                                DNS Guide
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <span className="text-slate-400 font-mono text-[11px]">/{c.slug || c._id}</span>
                              <br />
                              <Link
                                to={`/menu/${c._id}`}
                                target="_blank"
                                className="text-[10px] text-brand-400 hover:underline inline-flex items-center gap-1"
                              >
                                Preview Menu <ExternalLink className="w-2.5 h-2.5" />
                              </Link>
                            </div>
                          )}
                        </td>

                        {/* Owner Credentials */}
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <p className="text-slate-200 font-medium">{c.owner?.name || 'Owner'}</p>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[11px] text-slate-400">{c.owner?.email}</span>
                              <button
                                onClick={() => handleCopy(c.owner?.email, `email_${c._id}`)}
                                className="text-slate-500 hover:text-slate-300"
                                title="Copy Email"
                              >
                                {copiedText === `email_${c._id}` ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* 3-Color Brand Palette Swatch */}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center -space-x-1.5">
                              <span
                                className="w-5 h-5 rounded-full border border-slate-900 shadow-xs"
                                style={{ backgroundColor: primary }}
                                title={`Primary: ${primary}`}
                              ></span>
                              <span
                                className="w-5 h-5 rounded-full border border-slate-900 shadow-xs"
                                style={{ backgroundColor: secondary }}
                                title={`Secondary: ${secondary}`}
                              ></span>
                              <span
                                className="w-5 h-5 rounded-full border border-slate-900 shadow-xs"
                                style={{ backgroundColor: accent }}
                                title={`Accent: ${accent}`}
                              ></span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">Tri-Color</span>
                          </div>
                        </td>

                        {/* Enabled Features Badges */}
                        <td className="p-4">
                          <div className="space-y-1.5 max-w-[220px]">
                            <div className="flex flex-wrap gap-1">
                              {feat.posTerminal && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold">
                                  POS
                                </span>
                              )}
                              {feat.inventoryManagement && (
                                <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-bold">
                                  Inventory
                                </span>
                              )}
                              {feat.dineInOrdering && (
                                <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9px] font-bold">
                                  Dine-In
                                </span>
                              )}
                              {feat.takeawayOrdering && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-bold">
                                  Takeaway
                                </span>
                              )}
                              {feat.offersAndPromos && (
                                <span className="px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20 text-[9px] font-bold">
                                  Offers
                                </span>
                              )}
                              {feat.liveKitchenDisplay && (
                                <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[9px] font-bold">
                                  KDS
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => openFeaturesModal(c)}
                              className="text-[10px] text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <Sliders className="w-3 h-3" /> Manage Features
                            </button>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="p-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              c.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {c.status || 'active'}
                          </span>
                        </td>

                        {/* Launch & Actions */}
                        <td className="p-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Launch Feature Dropdown / Button */}
                            <button
                              onClick={() => setOpenLauncherClient(c)}
                              className="px-2.5 py-1.5 bg-brand-600/20 hover:bg-brand-600 text-brand-300 hover:text-white border border-brand-500/30 rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-xs"
                              title="Open Features & Portals"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Open</span>
                            </button>

                            {/* Direct Impersonate Portal Button */}
                            <button
                              onClick={() => handleImpersonate(c._id)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                              title="Launch Client Dashboard Console"
                            >
                              <LogIn className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setEditClientModal(c)}
                              className="p-1.5 text-slate-400 hover:text-brand-400 hover:bg-slate-800 rounded-lg transition"
                              title="Edit Brand & Colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteClient(c._id, c.name)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                              title="Delete Client"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* MODAL 1: Onboard New Restaurant Client with 3-Color Combined Palette */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-lg text-white">Onboard New Restaurant Brand</h3>
                <p className="text-xs text-slate-400">
                  Provision a new tenant with custom domain, 3-color palette, and feature flags.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4 text-xs">
              {/* 1. Brand Information */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> 1. Brand Information & Domain
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      Restaurant Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Truffle Smash Burger Co."
                      value={newClient.restaurantName}
                      onChange={(e) => setNewClient({ ...newClient, restaurantName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      Custom Domain (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. order.theburgerbar.com"
                      value={newClient.customDomain}
                      onChange={(e) => setNewClient({ ...newClient, customDomain: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      placeholder="e.g. +91 9876543210"
                      value={newClient.contactNumber}
                      onChange={(e) => setNewClient({ ...newClient, contactNumber: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">UPI Payment ID</label>
                    <input
                      type="text"
                      placeholder="e.g. merchant@okaxis"
                      value={newClient.upiId}
                      onChange={(e) => setNewClient({ ...newClient, upiId: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Client Owner Login */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" /> 2. Owner Login Credentials
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Owner Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Manager Name"
                      value={newClient.ownerName}
                      onChange={(e) => setNewClient({ ...newClient, ownerName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Owner Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="owner@brand.com"
                      value={newClient.ownerEmail}
                      onChange={(e) => setNewClient({ ...newClient, ownerEmail: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="Min 6 characters"
                      value={newClient.ownerPassword}
                      onChange={(e) => setNewClient({ ...newClient, ownerPassword: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Three-Color Combined Palette Panel */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5" /> 3. 3-Color Combined Brand Palette
                  </p>
                  <span className="text-[10px] text-slate-400">1-Click Presets or Custom Pickers</span>
                </div>

                {/* Preset Swatches Bar */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() =>
                        setNewClient({
                          ...newClient,
                          primaryColor: preset.primary,
                          secondaryColor: preset.secondary,
                          accentColor: preset.accent,
                        })
                      }
                      className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center gap-2 shrink-0 transition"
                    >
                      <div className="flex items-center -space-x-1">
                        <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: preset.primary }} />
                        <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: preset.secondary }} />
                        <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: preset.accent }} />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-300">{preset.name}</span>
                    </button>
                  ))}
                </div>

                {/* Live 3-Color Interactive Preview Card */}
                <div
                  className="p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-4 transition-all"
                  style={{ backgroundColor: newClient.secondaryColor }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-sm"
                      style={{ backgroundColor: newClient.primaryColor }}
                    >
                      {newClient.restaurantName ? newClient.restaurantName.charAt(0) : 'R'}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {newClient.restaurantName || 'Sample Brand Menu'}
                      </span>
                      <span className="text-[10px] text-slate-300">Live 3-Color Preview Theme</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold text-slate-950 shadow-xs"
                      style={{ backgroundColor: newClient.accentColor }}
                    >
                      Special Offer
                    </span>
                    <button
                      type="button"
                      className="px-3 py-1 rounded-lg text-white font-bold text-[10px] shadow-sm"
                      style={{ backgroundColor: newClient.primaryColor }}
                    >
                      Order Now
                    </button>
                  </div>
                </div>

                {/* The 3 Color Pickers */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      1. Primary Color (Brand Buttons)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={newClient.primaryColor}
                        onChange={(e) => setNewClient({ ...newClient, primaryColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={newClient.primaryColor}
                        onChange={(e) => setNewClient({ ...newClient, primaryColor: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-white font-mono uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      2. Secondary Color (Sidebar/Header)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={newClient.secondaryColor}
                        onChange={(e) => setNewClient({ ...newClient, secondaryColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={newClient.secondaryColor}
                        onChange={(e) => setNewClient({ ...newClient, secondaryColor: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-white font-mono uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      3. Accent Color (Badges/CTA)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={newClient.accentColor}
                        onChange={(e) => setNewClient({ ...newClient, accentColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={newClient.accentColor}
                        onChange={(e) => setNewClient({ ...newClient, accentColor: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-white font-mono uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Pre-enabled Feature Entitlements */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> 4. Feature Entitlements
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SYSTEM_FEATURES.map((feat) => {
                    const Icon = feat.icon;
                    const isChecked = newClient.features[feat.key];
                    return (
                      <label
                        key={feat.key}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                          isChecked
                            ? 'bg-slate-950 border-emerald-500/40 text-white'
                            : 'bg-slate-950/50 border-slate-800 text-slate-500'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            setNewClient({
                              ...newClient,
                              features: {
                                ...newClient.features,
                                [feat.key]: e.target.checked,
                              },
                            })
                          }
                          className="w-3.5 h-3.5 rounded text-emerald-500"
                        />
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[11px] font-bold truncate">{feat.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 disabled:opacity-50"
                >
                  {creating ? 'Deploying Tenant...' : 'Deploy Brand & Domain'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Feature Entitlements Management Modal */}
      {featuresModalClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-base text-white">
                  Feature Entitlements: {featuresModalClient.name}
                </h3>
                <p className="text-xs text-slate-400">
                  Toggle modules on/off for this specific client restaurant.
                </p>
              </div>
              <button
                onClick={() => setFeaturesModalClient(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {SYSTEM_FEATURES.map((feat) => {
                const Icon = feat.icon;
                const isEnabled = clientFeaturesState[feat.key] !== false;

                return (
                  <div
                    key={feat.key}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 text-brand-400 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block truncate">{feat.name}</span>
                        <span className="text-[10px] text-slate-400 line-clamp-1">{feat.desc}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setClientFeaturesState((prev) => ({
                          ...prev,
                          [feat.key]: !isEnabled,
                        }))
                      }
                      className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 ${
                        isEnabled ? 'bg-emerald-600' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                          isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setFeaturesModalClient(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveFeatures}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Save Feature Permissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Direct Feature Launcher Dialog */}
      {openLauncherClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                  style={{ backgroundColor: openLauncherClient.branding?.primaryColor || '#4f46e5' }}
                >
                  {openLauncherClient.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    Open Feature: {openLauncherClient.name}
                  </h3>
                  <p className="text-[11px] text-slate-400">Launch live features or owner portal</p>
                </div>
              </div>
              <button
                onClick={() => setOpenLauncherClient(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <button
                onClick={() => {
                  setOpenLauncherClient(null);
                  handleImpersonate(openLauncherClient._id);
                }}
                className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center">
                    <LogIn className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Launch Owner Dashboard Console</span>
                    <span className="text-[10px] text-slate-400">
                      Login as {openLauncherClient.owner?.name || 'Owner'} to manage this outlet
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-white" />
              </button>

              <a
                href={
                  openLauncherClient.customDomain
                    ? `https://${openLauncherClient.customDomain}`
                    : `/menu/${openLauncherClient._id}`
                }
                target="_blank"
                rel="noreferrer"
                className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-left transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Customer Digital QR Menu</span>
                    <span className="text-[10px] text-slate-400">
                      {openLauncherClient.customDomain || `localhost:5173/menu/${openLauncherClient._id}`}
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-white" />
              </a>

              <a
                href="/pos"
                target="_blank"
                rel="noreferrer"
                className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-left transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Counter POS Terminal</span>
                    <span className="text-[10px] text-slate-400">Cashier quick walk-in billing</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-white" />
              </a>

              <a
                href="/inventory"
                target="_blank"
                rel="noreferrer"
                className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-left transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <Boxes className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Inventory & Stock Master</span>
                    <span className="text-[10px] text-slate-400">Raw materials & restock logs</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-white" />
              </a>

              {openLauncherClient.customDomain && (
                <button
                  onClick={() => {
                    setOpenLauncherClient(null);
                    openDnsGuide(openLauncherClient);
                  }}
                  className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-left transition group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-white block">DNS Setup & CNAME Status</span>
                      <span className="text-[10px] text-slate-400">Review domain records & verification</span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-white" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Edit Client Details & 3-Color Palette */}
      {editClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-lg text-white">Edit Client: {editClientModal.name}</h3>
                <p className="text-xs text-slate-400">Update domain, 3-color palette, and operational status.</p>
              </div>
              <button
                onClick={() => setEditClientModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateClient} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Brand Name</label>
                  <input
                    type="text"
                    required
                    value={editClientModal.name}
                    onChange={(e) => setEditClientModal({ ...editClientModal, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Status</label>
                  <select
                    value={editClientModal.status || 'active'}
                    onChange={(e) => setEditClientModal({ ...editClientModal, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Custom Domain</label>
                  <input
                    type="text"
                    placeholder="order.clientdomain.com"
                    value={editClientModal.customDomain || ''}
                    onChange={(e) =>
                      setEditClientModal({ ...editClientModal, customDomain: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Slug / Subpath</label>
                  <input
                    type="text"
                    value={editClientModal.slug || ''}
                    onChange={(e) => setEditClientModal({ ...editClientModal, slug: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* 3-Color Brand Palette */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5" /> 3-Color Combined Brand Palette
                  </p>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() =>
                        setEditClientModal({
                          ...editClientModal,
                          branding: {
                            ...editClientModal.branding,
                            primaryColor: preset.primary,
                            secondaryColor: preset.secondary,
                            accentColor: preset.accent,
                          },
                        })
                      }
                      className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center gap-2 shrink-0 transition"
                    >
                      <div className="flex items-center -space-x-1">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.primary }} />
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.secondary }} />
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.accent }} />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-300">{preset.name}</span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Primary Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={editClientModal.branding?.primaryColor || '#4f46e5'}
                        onChange={(e) =>
                          setEditClientModal({
                            ...editClientModal,
                            branding: {
                              ...editClientModal.branding,
                              primaryColor: e.target.value,
                            },
                          })
                        }
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={editClientModal.branding?.primaryColor || '#4f46e5'}
                        onChange={(e) =>
                          setEditClientModal({
                            ...editClientModal,
                            branding: {
                              ...editClientModal.branding,
                              primaryColor: e.target.value,
                            },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-white font-mono uppercase text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Secondary Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={editClientModal.branding?.secondaryColor || '#312e81'}
                        onChange={(e) =>
                          setEditClientModal({
                            ...editClientModal,
                            branding: {
                              ...editClientModal.branding,
                              secondaryColor: e.target.value,
                            },
                          })
                        }
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={editClientModal.branding?.secondaryColor || '#312e81'}
                        onChange={(e) =>
                          setEditClientModal({
                            ...editClientModal,
                            branding: {
                              ...editClientModal.branding,
                              secondaryColor: e.target.value,
                            },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-white font-mono uppercase text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Accent Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={editClientModal.branding?.accentColor || '#06b6d4'}
                        onChange={(e) =>
                          setEditClientModal({
                            ...editClientModal,
                            branding: {
                              ...editClientModal.branding,
                              accentColor: e.target.value,
                            },
                          })
                        }
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={editClientModal.branding?.accentColor || '#06b6d4'}
                        onChange={(e) =>
                          setEditClientModal({
                            ...editClientModal,
                            branding: {
                              ...editClientModal.branding,
                              accentColor: e.target.value,
                            },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-white font-mono uppercase text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditClientModal(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-md transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: DNS Setup Guide */}
      {dnsModalClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">DNS CNAME Configuration Guide</h3>
              </div>
              <button
                onClick={() => setDnsModalClient(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
              <span className="text-slate-400 block font-medium">Target Custom Domain:</span>
              <span className="font-mono font-bold text-emerald-400 text-sm block">
                {dnsModalClient.customDomain}
              </span>
              <p className="text-[11px] text-slate-400 pt-1">
                Tell your client or IT admin to log in to their DNS provider (Cloudflare, GoDaddy, Namecheap) and create this record:
              </p>
            </div>

            {dnsGuideData?.dnsRecords?.map((rec, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                <div className="grid grid-cols-3 gap-2 font-mono">
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase">Record Type</span>
                    <span className="font-bold text-white">{rec.type}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase">Host / Name</span>
                    <span className="font-bold text-white">{rec.host}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase">Value / Points To</span>
                    <span className="font-bold text-brand-400 truncate block">{rec.value}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">{rec.notes}</span>
                  <button
                    onClick={() => handleCopy(rec.value, `dns_${i}`)}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center gap-1"
                  >
                    {copiedText === `dns_${i}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copy Value
                  </button>
                </div>
              </div>
            ))}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setDnsModalClient(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgencyPortal;
