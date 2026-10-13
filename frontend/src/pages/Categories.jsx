import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Tag, 
  Loader2, 
  AlertTriangle,
  Search
} from 'lucide-react';

const Categories = () => {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [name, setName] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch Categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Fetch categories error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCategories();
    }
  }, [token]);

  // Open forms
  const openAddModal = () => {
    setIsEditMode(false);
    setSelectedId(null);
    setName('');
    setDisplayOrder('0');
    setErrorMsg('');
    setIsOpen(true);
  };

  const openEditModal = (category) => {
    setIsEditMode(true);
    setSelectedId(category._id);
    setName(category.name);
    setDisplayOrder(category.displayOrder.toString());
    setErrorMsg('');
    setIsOpen(true);
  };

  // Submit Modal
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Category name is required.');
      return;
    }

    setSubmitLoading(true);
    setErrorMsg('');

    const url = isEditMode ? `/api/categories/${selectedId}` : '/api/categories';
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          displayOrder: Number(displayOrder) || 0,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setIsOpen(false);
        fetchCategories();
      } else {
        setErrorMsg(data.message || 'Failed to save category.');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Server error occurred.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Delete category
  const handleDelete = async (id) => {
    if (!window.confirm('WARNING: Deleting this category will PERMANENTLY delete ALL associated dishes! Are you sure you want to proceed?')) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        fetchCategories();
      } else {
        alert(data.message || 'Failed to delete category.');
      }
    } catch (error) {
      console.error(error);
      alert('Server error occurred.');
    }
  };

  // Filter Categories
  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar title="Categories" />

        <main className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Header toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 border border-slate-200/60 rounded-2xl shadow-soft">
            <div>
              <h2 className="text-base font-extrabold text-slate-800 uppercase tracking-tight">Food Groupings</h2>
              <p className="text-xs text-slate-400 mt-1 font-medium">Create sections like Appetizers, Main Course, and Desserts for custom brand menus.</p>
            </div>

            <button
              onClick={openAddModal}
              className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all shadow-md shadow-brand-500/10 flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>Create Category</span>
            </button>
          </div>

          {/* Quick search and tables panel */}
          <div className="bg-white border border-slate-200/65 rounded-2xl shadow-soft p-6 flex flex-col gap-6">
            
            {/* Search Input bar */}
            <div className="relative max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search category tags..."
                className="w-full pl-10 pr-4 py-2 surface-input"
              />
            </div>

            {/* Tables content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/40">
                    <th className="py-3 pl-4">Display Priority</th>
                    <th className="py-3">Category Name</th>
                    <th className="py-3 text-center">Status</th>
                    <th className="py-3 text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-slate-400 font-medium">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
                          <span>Fetching categories...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-slate-400 font-medium">
                        <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                          <Tag className="w-10 h-10 stroke-[1.2] text-slate-300" />
                          <span className="font-bold text-slate-400 mt-1">No Category tags found</span>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">Create a category to begin adding food recipes to your catalog.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((cat) => (
                      <tr key={cat._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 pl-4">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-50 font-bold text-brand-600 text-xs border border-slate-200 shadow-inner">
                            {cat.displayOrder}
                          </span>
                        </td>
                        <td className="py-4 font-bold text-slate-700">{cat.name}</td>
                        <td className="py-4 text-center">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-[9px] uppercase font-bold text-emerald-600">
                            Active Catalog
                          </span>
                        </td>
                        <td className="py-4 text-right pr-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(cat)}
                              className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors border border-slate-150 shadow-sm"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(cat._id)}
                              className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-700 flex items-center justify-center transition-colors border border-rose-100 shadow-sm"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Configure Form */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={isEditMode ? 'Modify Food Category' : 'Create Food Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-100 text-rose-800 text-xs px-4 py-3 rounded-xl flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category Tag Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Traditional Pasta"
              className="w-full px-4 py-2.5 surface-input"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Display Priority Order</label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-2.5 surface-input"
            />
            <span className="text-[9px] text-slate-400 font-semibold">Lower numbers sort to display first on guest menus.</span>
          </div>

          {isEditMode && (
            <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-amber-600">Cascading Warning</span>
                <p className="text-[9px] text-slate-400 font-semibold leading-relaxed">Updating category will sync child dishes immediately. Deletion wipes child dishes permanently.</p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold rounded-xl text-xs uppercase tracking-widest border border-slate-150 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="bg-brand-600 hover:bg-brand-500 disabled:bg-brand-800 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs uppercase tracking-widest px-5 py-2.5 flex items-center gap-1.5 shadow-md shadow-brand-500/10"
            >
              {submitLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>{isEditMode ? 'Update' : 'Create'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Categories;
