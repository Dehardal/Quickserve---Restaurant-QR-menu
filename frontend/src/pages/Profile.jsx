import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { 
  Save, 
  Store, 
  MapPin, 
  Phone, 
  Clock, 
  Plus, 
  Trash2, 
  Download, 
  Printer, 
  QrCode, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Globe,
  Palette,
  Receipt,
  CreditCard,
  DollarSign
} from 'lucide-react';

// Canvas utility to embed restaurant logo in center of QR
const embedRestaurantLogo = (qrDataUrl, logoUrl, brandColor = '#4f46e5', name = 'R') => {
  return new Promise((resolve) => {
    if (!qrDataUrl) return resolve('');
    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    qrImg.src = qrDataUrl;
    qrImg.onload = () => {
      const size = 640;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      ctx.drawImage(qrImg, 0, 0, size, size);

      const emblemSize = Math.floor(size * 0.22);
      const pos = (size - emblemSize) / 2;

      ctx.save();
      ctx.beginPath();
      const pad = 8;
      const boxSize = emblemSize + pad * 2;
      const boxPos = pos - pad;
      const radius = 18;
      if (ctx.roundRect) {
        ctx.roundRect(boxPos, boxPos, boxSize, boxSize, radius);
      } else {
        ctx.rect(boxPos, boxPos, boxSize, boxSize);
      }
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 2;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#f1f5f9';
      ctx.stroke();
      ctx.restore();

      const drawFallbackMonogram = () => {
        ctx.save();
        ctx.beginPath();
        const center = size / 2;
        ctx.arc(center, center, emblemSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = brandColor || '#4f46e5';
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold ' + Math.floor(emblemSize * 0.5) + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const initial = name ? name.trim().charAt(0).toUpperCase() : 'R';
        ctx.fillText(initial, center, center);
        ctx.restore();
        resolve(canvas.toDataURL('image/png'));
      };

      if (logoUrl) {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        logoImg.src = logoUrl;
        logoImg.onload = () => {
          ctx.save();
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(pos, pos, emblemSize, emblemSize, 12);
          } else {
            ctx.rect(pos, pos, emblemSize, emblemSize);
          }
          ctx.clip();
          ctx.drawImage(logoImg, pos, pos, emblemSize, emblemSize);
          ctx.restore();
          resolve(canvas.toDataURL('image/png'));
        };
        logoImg.onerror = () => {
          drawFallbackMonogram();
        };
      } else {
        drawFallbackMonogram();
      }
    };
    qrImg.onerror = () => {
      resolve(qrDataUrl);
    };
  });
};

const Profile = () => {
  const { token, restaurant, updateLocalRestaurant } = useAuth();
  const [activeTab, setActiveTab] = useState('general');

  // General details
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [logo, setLogo] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [upiId, setUpiId] = useState('');

  // Branding details
  const [primaryColor, setPrimaryColor] = useState('#4f46e5');
  const [accentColor, setAccentColor] = useState('#4338ca');
  const [tagline, setTagline] = useState('Scan, Order & Savor');

  // Invoice & Legal Billing
  const [businessLegalName, setBusinessLegalName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [fssaiNumber, setFssaiNumber] = useState('');
  const [invoiceFooterNote, setInvoiceFooterNote] = useState('Thank you for dining with us! Please visit again.');

  // Payment Gateway (Cashfree & Easy Split)
  const [cashfreeEnabled, setCashfreeEnabled] = useState(true);
  const [cashfreeAppId, setCashfreeAppId] = useState('');
  const [cashfreeSecretKey, setCashfreeSecretKey] = useState('');
  const [cashfreeEnvironment, setCashfreeEnvironment] = useState('sandbox');
  const [developerSplitEnabled, setDeveloperSplitEnabled] = useState(false);
  const [developerSplitVendorId, setDeveloperSplitVendorId] = useState('');
  const [developerSplitPercentage, setDeveloperSplitPercentage] = useState(5);

  // Tables
  const [tables, setTables] = useState([]);
  const [newTable, setNewTable] = useState('');
  const [selectedTable, setSelectedTable] = useState('');
  const [qrCodeData, setQrCodeData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Load details
  useEffect(() => {
    if (restaurant) {
      setName(restaurant.name || '');
      setAddress(restaurant.address || '');
      setContactNumber(restaurant.contactNumber || '');
      setOpeningHours(restaurant.openingHours || '');
      setLogo(restaurant.logo || '');
      setCustomDomain(restaurant.customDomain || '');
      setUpiId(restaurant.upiId || '');

      if (restaurant.branding) {
        setPrimaryColor(restaurant.branding.primaryColor || '#f97316');
        setAccentColor(restaurant.branding.accentColor || '#ea580c');
        setTagline(restaurant.branding.tagline || 'Scan, Order & Savor');
      }

      if (restaurant.invoiceSettings) {
        setBusinessLegalName(restaurant.invoiceSettings.businessLegalName || restaurant.name || '');
        setGstNumber(restaurant.invoiceSettings.gstNumber || '');
        setFssaiNumber(restaurant.invoiceSettings.fssaiNumber || '');
        setInvoiceFooterNote(restaurant.invoiceSettings.invoiceFooterNote || 'Thank you for dining with us! Please visit again.');
      }

      setCashfreeEnabled(restaurant.cashfreeEnabled ?? true);
      setCashfreeAppId(restaurant.cashfreeAppId || '');
      setCashfreeSecretKey(restaurant.cashfreeSecretKey || '');
      setCashfreeEnvironment(restaurant.cashfreeEnvironment || 'sandbox');
      setDeveloperSplitEnabled(restaurant.developerSplitEnabled ?? false);
      setDeveloperSplitVendorId(restaurant.developerSplitVendorId || '');
      setDeveloperSplitPercentage(restaurant.developerSplitPercentage || 5);

      setTables(restaurant.tables || []);
      if (restaurant.tables?.length > 0) {
        setSelectedTable(restaurant.tables[0]);
      }
    }
  }, [restaurant]);

  // Handle selected table QR generation
  useEffect(() => {
    if (selectedTable) {
      handleGenerateQR();
    }
  }, [selectedTable]);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setLogo(reader.result);
    };
  };

  // Submit profile details
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !address || !contactNumber) {
      setStatusMsg({ type: 'error', text: 'Please fill in restaurant name, address, and contact number.' });
      return;
    }

    setLoading(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const response = await fetch('/api/restaurant/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          address,
          contactNumber,
          openingHours,
          logo,
          tables,
          upiId,
          customDomain,
          branding: {
            primaryColor,
            accentColor,
            tagline,
          },
          invoiceSettings: {
            businessLegalName: businessLegalName || name,
            gstNumber,
            fssaiNumber,
            invoiceFooterNote,
          },
          cashfreeEnabled,
          cashfreeAppId,
          cashfreeSecretKey,
          cashfreeEnvironment,
          developerSplitEnabled,
          developerSplitVendorId,
          developerSplitPercentage,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'Brand and settings saved successfully!' });
        updateLocalRestaurant(data.data);
        handleGenerateQR();
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'Error updating settings.' });
      }
    } catch (error) {
      console.error('Update profile error:', error);
      setStatusMsg({ type: 'error', text: 'Internal Server Error' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async () => {
    if (!selectedTable) return;
    setQrLoading(true);
    try {
      const response = await fetch(`/api/restaurant/qr?tableNumber=${encodeURIComponent(selectedTable)}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        const brandedUrl = await embedRestaurantLogo(
          data.data.qrCodeUrl,
          logo || restaurant?.logo,
          primaryColor,
          name || restaurant?.name
        );
        setQrCodeData({
          ...data.data,
          qrCodeUrl: brandedUrl,
        });
      }
    } catch (error) {
      console.error('QR error:', error);
    } finally {
      setQrLoading(false);
    }
  };

  const addTable = () => {
    if (!newTable || newTable.trim() === '') return;
    const trimmed = newTable.trim();
    if (tables.includes(trimmed)) {
      setStatusMsg({ type: 'error', text: 'Table name already exists.' });
      return;
    }
    const updated = [...tables, trimmed];
    setTables(updated);
    setNewTable('');
    if (!selectedTable) setSelectedTable(trimmed);
  };

  const removeTable = (tableToRemove) => {
    const updated = tables.filter((t) => t !== tableToRemove);
    setTables(updated);
    if (selectedTable === tableToRemove) {
      setSelectedTable(updated.length > 0 ? updated[0] : '');
      setQrCodeData(null);
    }
  };

  const downloadQR = () => {
    if (!qrCodeData?.qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeData.qrCodeUrl;
    link.download = `QR_${name.replace(/\s+/g, '_')}_${selectedTable.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printQR = () => {
    window.print();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar title="Brand & System Settings" />

        <main className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Toast notifications */}
          {statusMsg.text && (
            <div
              className={`p-4 rounded-xl border flex items-center gap-3 animate-slide-up text-xs font-semibold ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                  : 'bg-rose-50 border-rose-100 text-rose-600'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Settings Tabs Header */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
            {[
              { id: 'general', label: 'General & Contact', icon: Store },
              { id: 'branding', label: 'Brand Styling & Theme', icon: Palette },
              { id: 'invoice', label: 'Receipt & Legal Tax', icon: Receipt },
              { id: 'payments', label: 'Payment Gateway', icon: CreditCard },
              { id: 'tables', label: 'Tables & QR Center', icon: QrCode },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-white text-brand-600 shadow-sm border border-slate-200'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* TAB 1: General & Contact */}
            {activeTab === 'general' && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Restaurant Identity</h3>
                  <p className="text-xs text-slate-500">Configure your business name, contact info, and custom domain.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* Logo Picker */}
                  <div className="flex flex-col items-center gap-3 shrink-0">
                    <div className="w-28 h-28 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center relative group">
                      {logo ? (
                        <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <Store className="w-10 h-10 text-slate-300" />
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-white font-bold uppercase tracking-wider">Change Logo</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">Recommended: 400x400 PNG</span>
                  </div>

                  {/* Fields */}
                  <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Restaurant Name *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. The Roastery Cafe"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Contact Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={contactNumber}
                          onChange={(e) => setContactNumber(e.target.value)}
                          placeholder="+91 9876543210"
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Custom Domain</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={customDomain}
                          onChange={(e) => setCustomDomain(e.target.value)}
                          placeholder="e.g. order.theroastery.com"
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-mono focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">UPI Payment ID</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="merchant@okhdfcbank"
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Opening Hours</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={openingHours}
                          onChange={(e) => setOpeningHours(e.target.value)}
                          placeholder="e.g. 09:00 AM - 11:00 PM"
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Location Address *</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="e.g. 12 High Street, Suite 4B"
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Brand Styling */}
            {activeTab === 'branding' && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Brand Theme & Appearance</h3>
                  <p className="text-xs text-slate-500">
                    Customize the colors and customer-facing tagline. Your menu will automatically reflect these colors.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <label className="text-xs font-bold text-slate-700 block">Primary Brand Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-xl font-mono text-xs uppercase"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">Used for primary buttons, highlights, badges, and active tabs.</p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <label className="text-xs font-bold text-slate-700 block">Accent Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-xl font-mono text-xs uppercase"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">Used for hover states and subtle gradient accents.</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">Brand Tagline</label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="e.g. Handcrafted Burgers & Artisanal Shakes"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Invoice & Legal Billing */}
            {activeTab === 'invoice' && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Receipt & Invoice Billing Details</h3>
                  <p className="text-xs text-slate-500">
                    These legal tax credentials and footer messages appear directly on digital and printed customer invoices.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      Legal Business / Entity Name
                    </label>
                    <input
                      type="text"
                      value={businessLegalName}
                      onChange={(e) => setBusinessLegalName(e.target.value)}
                      placeholder={name || 'e.g. Roastery Hospitality Private Limited'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      GSTIN / Tax Identification No.
                    </label>
                    <input
                      type="text"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value)}
                      placeholder="e.g. 29AAAAA0000A1Z5"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      FSSAI Food License No.
                    </label>
                    <input
                      type="text"
                      value={fssaiNumber}
                      onChange={(e) => setFssaiNumber(e.target.value)}
                      placeholder="e.g. 11223344556677"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      Custom Invoice Footer Note
                    </label>
                    <input
                      type="text"
                      value={invoiceFooterNote}
                      onChange={(e) => setInvoiceFooterNote(e.target.value)}
                      placeholder="Thank you for dining with us! Please visit again."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Payment Gateway & Fee Split */}
            {activeTab === 'payments' && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Payment Gateway Configuration</h3>
                  <p className="text-xs text-slate-500">
                    Connect Cashfree PG to collect online customer payments (UPI, Cards, NetBanking), plus configure automated developer fee splits.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Enable Gateway Toggle */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Enable Cashfree Payment Gateway</h4>
                      <p className="text-[11px] text-slate-500">
                        Allow customers to settle orders online during checkout or bill request
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={cashfreeEnabled}
                      onChange={(e) => setCashfreeEnabled(e.target.checked)}
                      className="w-4 h-4 text-brand-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Cashfree App ID (Client ID)
                      </label>
                      <input
                        type="text"
                        value={cashfreeAppId}
                        onChange={(e) => setCashfreeAppId(e.target.value)}
                        placeholder="TEST100... or CF_LIVE..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Cashfree Secret Key
                      </label>
                      <input
                        type="password"
                        value={cashfreeSecretKey}
                        onChange={(e) => setCashfreeSecretKey(e.target.value)}
                        placeholder="••••••••••••••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Gateway Environment
                      </label>
                      <select
                        value={cashfreeEnvironment}
                        onChange={(e) => setCashfreeEnvironment(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white font-semibold"
                      >
                        <option value="sandbox">Sandbox (Testing / Simulation)</option>
                        <option value="production">Production (Real Money Settlements)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        UPI VPA Address (For Dynamic QR Bill)
                      </label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="merchant@okhdfcbank"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Developer Split Section */}
                  <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Developer Platform Commission (Easy Split)</h4>
                        <p className="text-[11px] text-slate-500">
                          Automatically route a fee percentage directly into your developer vendor account on every order
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={developerSplitEnabled}
                        onChange={(e) => setDeveloperSplitEnabled(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                      />
                    </div>

                    {developerSplitEnabled && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-blue-100">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-600 block mb-1">
                            Developer Vendor ID
                          </label>
                          <input
                            type="text"
                            value={developerSplitVendorId}
                            onChange={(e) => setDeveloperSplitVendorId(e.target.value)}
                            placeholder="e.g. dev_agency_01"
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-600 block mb-1">
                            Commission Cut (%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={developerSplitPercentage}
                            onChange={(e) => setDeveloperSplitPercentage(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-bold"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: Tables & QR Center */}
            {activeTab === 'tables' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Table Management */}
                <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Dining Tables Management</h3>
                    <p className="text-xs text-slate-500">
                      Add, remove, or organize tables. Each table generates a cryptographically secured QR code.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTable}
                      onChange={(e) => setNewTable(e.target.value)}
                      placeholder="e.g. Table 6, Patio 1, Rooftop 3"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={addTable}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Table
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                    {tables.map((t) => (
                      <div
                        key={t}
                        className={`p-3 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                          selectedTable === t
                            ? 'border-brand-500 bg-brand-50/40 text-brand-700'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                        }`}
                        onClick={() => setSelectedTable(t)}
                      >
                        <span className="font-bold text-xs">{t}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTable(t);
                          }}
                          className="p-1 text-slate-400 hover:text-red-500 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live QR Card */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-4 text-center">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-900">Table QR Generator</h3>
                    <p className="text-[11px] text-slate-400">
                      {customDomain ? `Domain: ${customDomain}` : 'Using default system domain'}
                    </p>
                  </div>

                  <div className="w-full aspect-square max-w-[220px] mx-auto rounded-2xl bg-white border border-slate-100 p-3 flex flex-col items-center justify-center shadow-inner">
                    {qrLoading ? (
                      <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                    ) : qrCodeData?.qrCodeUrl ? (
                      <img src={qrCodeData.qrCodeUrl} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-slate-400 text-center">
                        <QrCode className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                        <span className="text-[10px]">Select a table</span>
                      </div>
                    )}
                  </div>

                  {qrCodeData && (
                    <div className="space-y-2">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-[10px] text-slate-500 font-mono truncate text-left">
                        Target: {qrCodeData.targetUrl}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={downloadQR}
                          className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          PNG
                        </button>
                        <button
                          type="button"
                          onClick={printQR}
                          className="py-2 px-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/20"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Print Tent
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Save Button Bar */}
            <div className="flex justify-end pt-4 border-t border-slate-200">
              <button
                type="submit"
                disabled={loading}
                className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl flex items-center gap-2 transition shadow-md shadow-brand-500/20 disabled:opacity-50 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save All Settings</span>
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default Profile;
