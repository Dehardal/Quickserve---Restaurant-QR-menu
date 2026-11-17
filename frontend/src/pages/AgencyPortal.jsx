import React, { useState, useEffect } from 'react';
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
  DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AgencyPortal = () => {
  const { user, token, logout } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [dnsModalClient, setDnsModalClient] = useState(null);
  const [editClientModal, setEditClientModal] = useState(null);
  const [dnsGuideData, setDnsGuideData] = useState(null);
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
    primaryColor: '#f97316',
    accentColor: '#ea580c',
    upiId: '',
    tableCount: 6,
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

  // Handle Client Creation
  const handleCreateClient = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateSuccessMsg(null);
    try {
      const tables = Array.from({ length: Number(newClient.tableCount) || 5 }, (_, i) => `Table ${i + 1}`);

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
          primaryColor: '#f97316',
          accentColor: '#ea580c',
          upiId: '',
          tableCount: 6,
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

  // Handle Client Status / Domain Update
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
    if (!window.confirm(`Are you sure you want to permanently delete "${name}" and all their dishes, categories, and orders?`)) {
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

  // Total summary calculations
  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === 'active').length;
  const totalDishes = clients.reduce((acc, c) => acc + (c.stats?.dishes || 0), 0);
  const totalOrders = clients.reduce((acc, c) => acc + (c.stats?.orders || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Server className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base text-white tracking-tight flex items-center gap-2">
              Agency Master Console
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/30">
                Super Admin
              </span>
            </h1>
            <p className="text-xs text-slate-400">White-Label Digital Menu Multi-Domain Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-medium text-xs rounded-xl shadow-md shadow-brand-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Onboard Restaurant
          </button>

          <div className="h-6 w-px bg-slate-800 mx-1"></div>

          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-slate-200">{user?.name || 'Developer Admin'}</p>
            <p className="text-[10px] text-slate-400">{user?.email}</p>
          </div>

          <button
            onClick={logout}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition border border-transparent hover:border-red-500/20"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Banner Alert if any */}
        {createSuccessMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
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
                <Check className="w-3.5 h-3.5" /> {activeClients} live on server
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
              <p className="text-xs text-slate-400 mt-1">Branded client hostnames</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <Globe className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Menu Dishes</p>
              <h3 className="text-2xl font-black text-white mt-1">{totalDishes}</h3>
              <p className="text-xs text-slate-400 mt-1">Across all clients</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Orders Processed</p>
              <h3 className="text-2xl font-black text-white mt-1">{totalOrders}</h3>
              <p className="text-xs text-slate-400 mt-1">Live digital orders</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Client Restaurants List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Onboarded Client Restaurants</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Each brand operates with its own custom domain, brand theme, and dedicated owner credentials.
              </p>
            </div>
            <button
              onClick={fetchClients}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-400" />
              <p className="text-xs">Loading client portfolio...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-400 space-y-2">
              <AlertCircle className="w-6 h-6 mx-auto" />
              <p className="text-sm">{error}</p>
              <button
                onClick={fetchClients}
                className="text-xs px-3 py-1 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30"
              >
                Retry
              </button>
            </div>
          ) : clients.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No Client Restaurants Yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Click "Onboard Restaurant" to deploy a digital menu system for your first restaurant client with their own custom domain.
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
                    <th className="p-4">Custom Domain / URL</th>
                    <th className="p-4">Client Credentials</th>
                    <th className="p-4">Brand Color</th>
                    <th className="p-4 text-center">Menu / Orders</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {clients.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-800/30 transition">
                      {/* Name & Logo */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          {c.logo ? (
                            <img src={c.logo} alt="" className="w-9 h-9 rounded-xl object-cover bg-slate-800" />
                          ) : (
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-sm"
                              style={{ backgroundColor: c.branding?.primaryColor || '#f97316' }}
                            >
                              {c.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-white text-sm block">{c.name}</span>
                            <span className="text-[11px] text-slate-400">
                              {c.tables?.length || 0} Tables • {c.contactNumber || 'No Phone'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Custom Domain */}
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
                              DNS Instructions
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="text-slate-500 italic">No custom domain</span>
                            <br />
                            <Link
                              to={`/menu/${c._id}`}
                              target="_blank"
                              className="text-[10px] text-brand-400 hover:underline inline-flex items-center gap-1"
                            >
                              Direct Preview Link <ExternalLink className="w-2.5 h-2.5" />
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

                      {/* Brand Color */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                            style={{ backgroundColor: c.branding?.primaryColor || '#4f46e5' }}
                          ></span>
                          <span className="font-mono text-[11px] text-slate-300 uppercase">
                            {c.branding?.primaryColor || '#4f46e5'}
                          </span>
                        </div>
                      </td>

                      {/* Stats */}
                      <td className="p-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold text-[11px]">
                          {c.stats?.dishes || 0} Dishes • {c.stats?.orders || 0} Orders
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            c.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/10 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {c.status || 'active'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {c.customDomain && (
                            <button
                              onClick={() => openDnsGuide(c)}
                              className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition"
                              title="View DNS CNAME Configuration"
                            >
                              <Globe className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => setEditClientModal(c)}
                            className="p-1.5 text-slate-400 hover:text-brand-400 hover:bg-slate-800 rounded-lg transition"
                            title="Edit Client Brand & Domain"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteClient(c._id, c.name)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                            title="Delete Client"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* MODAL 1: Onboard New Restaurant Client */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-lg text-white">Onboard New Restaurant Brand</h3>
                <p className="text-xs text-slate-400">
                  Provision a new white-label tenant with custom domain & login credentials.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4">
              {/* Restaurant Details */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> 1. Brand Information
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      Restaurant / Cafe Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. The Roastery Cafe"
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
                      placeholder="e.g. order.theroastery.com"
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
                      placeholder="e.g. roastery@okhdfcbank"
                      value={newClient.upiId}
                      onChange={(e) => setNewClient({ ...newClient, upiId: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Address / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. 42 Main High Street, Indiranagar"
                    value={newClient.address}
                    onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Owner Login Details */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" /> 2. Client Owner Login Credentials
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Owner Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Manager / Owner"
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
                      placeholder="owner@cafe.com"
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

              {/* Theme & Tables */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <p className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" /> 3. Brand Styling & Tables
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Primary Color</label>
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
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Accent Color</label>
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

                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Initial Tables</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={newClient.tableCount}
                      onChange={(e) => setNewClient({ ...newClient, tableCount: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
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
                  className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-brand-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {creating ? 'Deploying Tenant...' : 'Deploy Brand System'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DNS Setup Guide */}
      {dnsModalClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  DNS Records for {dnsModalClient.name}
                </h3>
                <p className="text-xs text-slate-400">Share these DNS instructions with your client</p>
              </div>
              <button
                onClick={() => setDnsModalClient(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <p className="text-slate-300 font-medium">Domain Configured:</p>
                <p className="font-mono text-emerald-400 font-bold text-sm bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                  {dnsModalClient.customDomain || 'No domain assigned'}
                </p>
              </div>

              {dnsGuideData ? (
                <div className="space-y-3">
                  <p className="text-slate-300 font-medium">Required DNS Record in Client Domain Registrar:</p>
                  {dnsGuideData.dnsRecords.map((rec, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="grid grid-cols-3 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-500 block">Record Type</span>
                          <span className="font-bold text-white font-mono">{rec.type}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Host / Name</span>
                          <span className="font-bold text-white font-mono">{rec.host}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">TTL</span>
                          <span className="font-bold text-slate-300 font-mono">{rec.ttl}</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Value / Target</span>
                          <span className="font-mono text-amber-400 font-bold">{rec.value}</span>
                        </div>
                        <button
                          onClick={() => handleCopy(rec.value, `dns_val_${idx}`)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] flex items-center gap-1 transition"
                        >
                          {copiedText === `dns_val_${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          Copy Value
                        </button>
                      </div>
                    </div>
                  ))}
                  <p className="text-[11px] text-slate-400 italic">
                    💡 Tip: Client adds this in GoDaddy, Namecheap, Cloudflare, or Hostinger. DNS propagation takes 5 to 30 minutes.
                  </p>
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto text-brand-400 mb-2" />
                  Generating DNS records...
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setDnsModalClient(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit Client Brand */}
      {editClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Edit Client: {editClientModal.name}</h3>
              <button
                onClick={() => setEditClientModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateClient} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Restaurant Name</label>
                <input
                  type="text"
                  value={editClientModal.name}
                  onChange={(e) => setEditClientModal({ ...editClientModal, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Custom Domain</label>
                  <input
                    type="text"
                    placeholder="order.clientbrand.com"
                    value={editClientModal.customDomain || ''}
                    onChange={(e) => setEditClientModal({ ...editClientModal, customDomain: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Status</label>
                  <select
                    value={editClientModal.status || 'active'}
                    onChange={(e) => setEditClientModal({ ...editClientModal, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editClientModal.branding?.primaryColor || '#4f46e5'}
                      onChange={(e) =>
                        setEditClientModal({
                          ...editClientModal,
                          branding: { ...editClientModal.branding, primaryColor: e.target.value },
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
                          branding: { ...editClientModal.branding, primaryColor: e.target.value },
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-white font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">UPI ID</label>
                  <input
                    type="text"
                    value={editClientModal.upiId || ''}
                    onChange={(e) => setEditClientModal({ ...editClientModal, upiId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Address</label>
                <input
                  type="text"
                  value={editClientModal.address || ''}
                  onChange={(e) => setEditClientModal({ ...editClientModal, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditClientModal(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgencyPortal;

