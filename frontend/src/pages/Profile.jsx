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
  AlertCircle 
} from 'lucide-react';

const Profile = () => {
  const { token, restaurant, updateLocalRestaurant } = useAuth();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [logo, setLogo] = useState('');
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
      setStatusMsg({ type: 'error', text: 'Please fill in all required fields.' });
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
        }),
      });

      const data = await response.json();
      if (data.success) {
        updateLocalRestaurant(data.data);
        setStatusMsg({ type: 'success', text: 'Settings updated successfully!' });
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'Failed to update settings.' });
      }
    } catch (error) {
      console.error(error);
      setStatusMsg({ type: 'error', text: 'Server error occurred.' });
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
        setQrCodeData(data.data);
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
    const updated = tables.filter(t => t !== tableToRemove);
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
    link.download = `QR_${restaurant.name.replace(/\s+/g, '_')}_${selectedTable.replace(/\s+/g, '_')}.png`;
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
        <Navbar title="Settings Console" />

        <main className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Toast notifications */}
          {statusMsg.text && (
            <div className={`p-4 rounded-xl border flex items-center gap-3 animate-slide-up text-xs font-semibold ${
              statusMsg.type === 'success' 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                : 'bg-rose-50 border-rose-100 text-rose-600'
            }`}>
              {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Form details (2 columns) */}
            <div className="xl:col-span-2 space-y-8">
              
              {/* Profile Config card */}
              <div className="bg-white border border-slate-200/65 rounded-2xl p-6 shadow-soft">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                  <Store className="w-4.5 h-4.5 text-brand-600" />
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">Restaurant Branding</h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    
                    {/* Logo Section */}
                    <div className="flex flex-col items-center gap-3 self-center md:self-start">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Logo Photo</label>
                      <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-slate-200 hover:border-brand-500/50 flex flex-col items-center justify-center relative overflow-hidden transition-colors bg-slate-50 group">
                        {logo ? (
                          <>
                            <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-bold text-white transition-opacity cursor-pointer">
                              Change
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-slate-400 cursor-pointer select-none">
                            <Plus className="w-5 h-5 stroke-[1.2]" />
                            <span className="text-[9px] font-bold uppercase">Select Photo</span>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Form Grid */}
                    <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Restaurant Name *</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Traditional Pasta"
                          className="w-full px-4 py-2 surface-input"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact Number *</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            required
                            value={contactNumber}
                            onChange={(e) => setContactNumber(e.target.value)}
                            placeholder="+1 234 567 890"
                            className="w-full pl-9 pr-4 py-2 surface-input"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Opening Hours</label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            value={openingHours}
                            onChange={(e) => setOpeningHours(e.target.value)}
                            placeholder="e.g. 09:00 AM - 10:00 PM"
                            className="w-full pl-9 pr-4 py-2 surface-input"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Restaurant Location Address *</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            required
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="123 Bistro lane, Suite B"
                            className="w-full pl-9 pr-4 py-2 surface-input"
                          />
                        </div>
                      </div>
                    </div>

                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors disabled:bg-brand-850 disabled:cursor-not-allowed shadow-md shadow-brand-500/10"
                    >
                      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      <span>Save Profile Settings</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Table Manager card */}
              <div className="bg-white border border-slate-200/65 rounded-2xl p-6 shadow-soft">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                  <QrCode className="w-4.5 h-4.5 text-brand-600" />
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">Active Tables</h3>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-3 max-w-sm">
                    <input
                      type="text"
                      value={newTable}
                      onChange={(e) => setNewTable(e.target.value)}
                      placeholder="e.g. Table 6"
                      className="flex-1 px-3 py-2 surface-input"
                    />
                    <button
                      onClick={addTable}
                      className="px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 text-xs font-bold uppercase tracking-widest rounded-xl transition-all border border-slate-200 flex items-center gap-1 shrink-0 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  {/* List badges */}
                  <div className="flex flex-wrap gap-2.5">
                    {tables.length === 0 ? (
                      <span className="text-xs text-slate-400 font-semibold py-2">No tables added yet. Config them above!</span>
                    ) : (
                      tables.map((t) => (
                        <div 
                          key={t}
                          className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-xs font-bold shadow-sm"
                        >
                          <span>{t}</span>
                          <button
                            onClick={() => removeTable(t)}
                            className="text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 shrink-0" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* QR Card (1 column) */}
            <div className="space-y-6">
              <div className="bg-white border border-slate-200/65 rounded-2xl p-6 shadow-soft flex flex-col gap-6 text-center">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4 justify-center">
                  <QrCode className="w-4.5 h-4.5 text-brand-600" />
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">QR Generator</h3>
                </div>

                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Table</label>
                  <select
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-xs bg-white border border-slate-200 text-slate-700 focus:outline-none focus:border-brand-500/50 shadow-sm"
                  >
                    {tables.length === 0 ? (
                      <option value="">No tables active</option>
                    ) : (
                      tables.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))
                    )}
                  </select>
                </div>

                {/* QR Canvas Box */}
                <div className="w-full aspect-square max-w-[240px] mx-auto rounded-2xl bg-white border border-slate-100 p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                  {qrLoading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-slate-350" />
                  ) : qrCodeData?.qrCodeUrl ? (
                    <img 
                      src={qrCodeData.qrCodeUrl} 
                      alt={`Table ${selectedTable} QR`} 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400 select-none">
                      <QrCode className="w-10 h-10 stroke-[1.2]" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">Awaiting Generation</span>
                    </div>
                  )}
                </div>

                {qrCodeData && (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={downloadQR}
                      className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PNG</span>
                    </button>

                    <button
                      onClick={printQR}
                      className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/10"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Table Tent</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Hidden printed design page */}
      {qrCodeData && (
        <div id="printable-qr-area" className="hidden">
          <div className="flex flex-col items-center p-8 border-[4px] border-slate-900 rounded-3xl w-[360px] bg-white text-slate-950 font-sans shadow-xl text-center">
            {restaurant?.logo && (
              <img src={restaurant.logo} alt="Logo" className="w-14 h-14 rounded-2xl object-cover border border-slate-100 mb-4 bg-white" />
            )}
            <h1 className="text-xl font-extrabold tracking-tight">{restaurant?.name || 'QuickServe'}</h1>
            <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest border-b border-slate-100 pb-3.5 w-4/5 mx-auto">Scan & Place Order</p>
            
            <div className="w-[240px] h-[240px] my-6 p-4 border border-slate-100 rounded-2xl bg-white shadow-inner">
              <img src={qrCodeData.qrCodeUrl} alt="Printable QR" className="w-full h-full object-contain" />
            </div>

            <div className="bg-slate-900 text-white rounded-xl px-5 py-2.5 shadow-md text-sm font-black">
              <span>{selectedTable}</span>
            </div>
            
            <p className="text-[9px] text-slate-400 font-semibold uppercase mt-6 tracking-wider">No app required. Scan via phone camera.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
