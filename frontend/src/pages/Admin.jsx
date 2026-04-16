import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Home & Garden',
  'Food & Beverage',
  'Fashion',
  'Personal Care',
  'Tech & Gadgets',
  'Kids & Baby',
  'Outdoor & Travel',
  'Office & Stationery',
];

const ECO_BADGES = [
  'Organic', 'Recycled', 'Carbon Neutral', 'Fair Trade',
  'Vegan', 'Biodegradable', 'Zero Waste', 'Cruelty Free', 'B Corp', 'Rainforest Alliance',
];

const EMPTY_FORM = {
  name: '', description: '', price: '', originalPrice: '',
  images: [''],
  category: 'Home & Garden', brand: '', stock: '', sustainabilityScore: '50',
  ecoBadges: [], verified: false, verificationNotes: '', featured: false,
  tags: '', weight: '', material: '', origin: '',
};

// Converts a File to a base64 data URI
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // tracks which image slot is currently being read from disk
  const [uploadingIndex, setUploadingIndex] = useState(null);
  // 'url' | 'upload' per slot
  const [imageMode, setImageMode] = useState([]);

  const [stats, setStats] = useState({});

  // Debounced search — fires 400ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Redirect non-admins
  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'admin') { navigate('/'); toast.error('Admin access required'); }
  }, [user, navigate]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15, sort: 'newest' };
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (search) params.search = search;
      const { data } = await api.get('/products', { params });
      setProducts(Array.isArray(data.products) ? data.products : []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, categoryFilter, search]);

  const fetchStats = useCallback(async () => {
    try {
      const counts = {};
      await Promise.all(
        CATEGORIES.map(async (cat) => {
          const { data } = await api.get('/products', { params: { category: cat, limit: 1 } });
          counts[cat] = data.total;
        })
      );
      setStats(counts);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') { fetchProducts(); fetchStats(); }
  }, [fetchProducts, fetchStats, user]);

  // ── Modal helpers ──────────────────────────────────────────────
  const openAdd = () => {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setImageMode(['url']);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    const imgs = product.images.length > 0 ? product.images : [''];
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : '',
      images: imgs,
      category: product.category,
      brand: product.brand,
      stock: String(product.stock),
      sustainabilityScore: String(product.sustainabilityScore),
      ecoBadges: [...product.ecoBadges],
      verified: product.verified,
      verificationNotes: product.verificationNotes || '',
      featured: product.featured,
      tags: product.tags.join(', '),
      weight: product.weight || '',
      material: product.material || '',
      origin: product.origin || '',
    });
    // if image is already a data URI treat it as upload mode; otherwise url mode
    setImageMode(imgs.map(img => img.startsWith('data:') ? 'upload' : 'url'));
    setModalOpen(true);
  };

  const handleFormChange = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleBadgeToggle = (badge) =>
    setForm(f => ({
      ...f,
      ecoBadges: f.ecoBadges.includes(badge)
        ? f.ecoBadges.filter(b => b !== badge)
        : [...f.ecoBadges, badge],
    }));

  // ── Image management ───────────────────────────────────────────
  const setImageValue = (index, value) => {
    const updated = [...form.images];
    updated[index] = value;
    setForm(f => ({ ...f, images: updated }));
  };

  const setSlotMode = (index, mode) => {
    const updated = [...imageMode];
    updated[index] = mode;
    setImageMode(updated);
    // clear the value when switching mode
    setImageValue(index, '');
  };

  const addImageSlot = () => {
    setForm(f => ({ ...f, images: [...f.images, ''] }));
    setImageMode(m => [...m, 'url']);
  };

  const removeImageSlot = (index) => {
    if (form.images.length === 1) return;
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
    setImageMode(m => m.filter((_, i) => i !== index));
  };

  const handleFileSelect = async (index, file) => {
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      toast.error('Image must be under 4 MB');
      return;
    }
    setUploadingIndex(index);
    try {
      const dataUrl = await readFileAsDataURL(file);
      setImageValue(index, dataUrl);
      toast.success('Image loaded — will be saved to database on submit');
    } catch {
      toast.error('Could not read file');
    } finally {
      setUploadingIndex(null);
    }
  };

  // ── Save product ───────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    const validImages = form.images.filter(img => img.trim() !== '');
    if (validImages.length === 0) {
      toast.error('At least one image is required');
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      images: validImages,           // URLs or base64 data URIs — both stored in MongoDB
      category: form.category,
      brand: form.brand.trim(),
      stock: Number(form.stock),
      sustainabilityScore: Number(form.sustainabilityScore),
      ecoBadges: form.ecoBadges,
      verified: form.verified,
      verificationNotes: form.verificationNotes.trim(),
      featured: form.featured,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      weight: form.weight.trim(),
      material: form.material.trim(),
      origin: form.origin.trim(),
    };

    try {
      if (editProduct) {
        await api.put(`/products/${editProduct._id}`, payload);
        toast.success('Product updated and saved to database');
      } else {
        await api.post('/products', payload);
        toast.success('Product added and saved to database');
      }
      setModalOpen(false);
      fetchProducts();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete product ─────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${deleteTarget._id}`);
      toast.success('Product deleted');
      setDeleteTarget(null);
      fetchProducts();
      fetchStats();
    } catch {
      toast.error('Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };


  if (!user || user.role !== 'admin') return null;

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-eco-dark to-eco-leaf py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
            <div>
              <h1 className="font-display text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-white/70 mt-1">Manage all products across every category</p>
            </div>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-eco-leaf font-semibold rounded-xl hover:bg-primary-50 transition-all shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </button>
          </div>

          {/* Search bar — prominent, in header */}
          <div className="relative max-w-xl">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search products by name, brand or tag..."
              className="w-full pl-12 pr-10 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all text-sm"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => { setCategoryFilter(cat); setPage(1); }}
              className={`p-3 rounded-xl border text-left transition-all ${
                categoryFilter === cat
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : 'bg-white border-gray-200 hover:border-primary-300'
              }`}
            >
              <p className={`text-lg font-bold ${categoryFilter === cat ? 'text-white' : 'text-gray-900'}`}>
                {stats[cat] ?? '—'}
              </p>
              <p className={`text-xs mt-0.5 leading-tight ${categoryFilter === cat ? 'text-white/80' : 'text-gray-500'}`}>
                {cat}
              </p>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <select
            value={categoryFilter}
            onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {(categoryFilter !== 'All' || searchInput) && (
            <button
              onClick={() => { setCategoryFilter('All'); setSearch(''); setSearchInput(''); setPage(1); }}
              className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear filters
            </button>
          )}

          <span className="ml-auto text-sm text-gray-500">{total} product{total !== 1 ? 's' : ''}</span>
        </div>

        {/* Products table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">🌿</div>
              <p className="text-gray-600 font-medium">No products found</p>
              <button onClick={openAdd} className="mt-4 px-5 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors">
                Add First Product
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Eco Score</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.map(product => (
                      <tr key={product._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-12 h-12 rounded-xl object-cover bg-gray-100 flex-shrink-0"
                              onError={e => { e.target.src = `https://placehold.co/48x48/dcfce7/166534?text=🌿`; }}
                            />
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate max-w-[200px]">{product.name}</p>
                              <p className="text-xs text-gray-500">{product.brand}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-900 text-sm">£{product.price.toFixed(2)}</p>
                          {product.originalPrice && (
                            <p className="text-xs text-gray-400 line-through">£{product.originalPrice.toFixed(2)}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-medium ${product.stock === 0 ? 'text-red-600' : product.stock < 10 ? 'text-orange-600' : 'text-gray-700'}`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-12 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${product.sustainabilityScore >= 90 ? 'bg-primary-500' : product.sustainabilityScore >= 70 ? 'bg-yellow-500' : 'bg-orange-500'}`}
                                style={{ width: `${product.sustainabilityScore}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-600">{product.sustainabilityScore}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            {product.verified && (
                              <span className="inline-flex items-center gap-1 text-xs text-primary-700 font-medium">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Verified
                              </span>
                            )}
                            {product.featured && (
                              <span className="text-xs text-yellow-600 font-medium">⭐ Featured</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEdit(product)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeleteTarget(product)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pages > 1 && (
                <div className="flex justify-center gap-2 px-4 py-4 border-t border-gray-50">
                  {[...Array(pages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-9 h-9 rounded-xl font-medium text-sm transition-all ${
                        page === i + 1 ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          Add / Edit Modal
      ═══════════════════════════════════════════════════════════ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-display text-xl font-bold text-gray-900">
                {editProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="px-6 py-5 space-y-6">

              {/* ── Basic Info ── */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Basic Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text" required maxLength={100}
                      value={form.name}
                      onChange={e => handleFormChange('name', e.target.value)}
                      placeholder="e.g. Bamboo Toothbrush Set"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required rows={3}
                      value={form.description}
                      onChange={e => handleFormChange('description', e.target.value)}
                      placeholder="Describe the product and its eco-friendly qualities..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text" required
                      value={form.brand}
                      onChange={e => handleFormChange('brand', e.target.value)}
                      placeholder="e.g. EcoBrush Co."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={form.category}
                      onChange={e => handleFormChange('category', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </section>

              {/* ── Images ── */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Product Images <span className="text-red-500">*</span>
                </h3>
                <div className="space-y-3">
                  {form.images.map((imgValue, index) => {
                    const mode = imageMode[index] || 'url';
                    const isUploading = uploadingIndex === index;

                    return (
                      <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                        {/* Slot header */}
                        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
                          <span className="text-xs font-semibold text-gray-500">
                            {index === 0 ? 'Primary Image' : `Image ${index + 1}`}
                          </span>
                          <div className="flex items-center gap-3">
                            {/* Mode toggle */}
                            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
                              <button
                                type="button"
                                onClick={() => setSlotMode(index, 'url')}
                                className={`px-3 py-1 transition-colors ${mode === 'url' ? 'bg-primary-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                              >
                                URL
                              </button>
                              <button
                                type="button"
                                onClick={() => setSlotMode(index, 'upload')}
                                className={`px-3 py-1 transition-colors ${mode === 'upload' ? 'bg-primary-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                              >
                                Upload
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeImageSlot(index)}
                              disabled={form.images.length === 1}
                              className="text-xs text-red-400 hover:text-red-600 disabled:opacity-30 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        {/* Slot body */}
                        <div className="p-4 flex gap-4 items-start">
                          {/* Preview */}
                          <div className="w-20 h-20 rounded-xl border border-gray-200 bg-gray-50 flex-shrink-0 flex items-center justify-center overflow-hidden">
                            {isUploading ? (
                              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                            ) : imgValue ? (
                              <img
                                src={imgValue}
                                alt="preview"
                                className="w-full h-full object-cover"
                                onError={e => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            )}
                          </div>

                          {/* Input area */}
                          <div className="flex-1">
                            {mode === 'url' ? (
                              <div>
                                <input
                                  type="url"
                                  value={imgValue}
                                  onChange={e => setImageValue(index, e.target.value)}
                                  placeholder="https://images.unsplash.com/photo-...?w=600&q=80"
                                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                <p className="text-xs text-gray-400 mt-1.5">
                                  Paste any public image URL. The URL is stored directly in the database.
                                </p>
                              </div>
                            ) : (
                              <div>
                                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50/40 transition-all group">
                                  {isUploading ? (
                                    <div className="flex flex-col items-center gap-2">
                                      <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                                      <span className="text-xs text-gray-500">Reading file...</span>
                                    </div>
                                  ) : imgValue ? (
                                    <div className="flex flex-col items-center gap-1">
                                      <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                      <span className="text-xs text-primary-600 font-medium">Image loaded — click to replace</span>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center gap-1.5">
                                      <svg className="w-7 h-7 text-gray-400 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                      </svg>
                                      <span className="text-xs text-gray-500 group-hover:text-primary-600 font-medium">Click to choose a file</span>
                                      <span className="text-xs text-gray-400">JPG, PNG, WEBP — max 4 MB</span>
                                    </div>
                                  )}
                                  <input
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                                    className="hidden"
                                    disabled={isUploading}
                                    onChange={e => {
                                      if (e.target.files[0]) handleFileSelect(index, e.target.files[0]);
                                      e.target.value = '';
                                    }}
                                  />
                                </label>
                                <p className="text-xs text-gray-400 mt-1.5">
                                  File is converted to base64 and stored directly in MongoDB — no external storage needed.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={addImageSlot}
                    className="flex items-center gap-1.5 text-sm text-primary-600 font-medium hover:text-primary-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add another image
                  </button>
                </div>
              </section>

              {/* ── Pricing & Stock ── */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Pricing & Stock</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (£) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number" required min="0" step="0.01"
                      value={form.price}
                      onChange={e => handleFormChange('price', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (£)</label>
                    <input
                      type="number" min="0" step="0.01"
                      value={form.originalPrice}
                      onChange={e => handleFormChange('originalPrice', e.target.value)}
                      placeholder="Leave blank if no sale"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number" required min="0"
                      value={form.stock}
                      onChange={e => handleFormChange('stock', e.target.value)}
                      placeholder="0"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </section>

              {/* ── Sustainability ── */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Sustainability</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Eco Score: <span className="text-primary-600 font-bold">{form.sustainabilityScore}</span> / 100
                    </label>
                    <input
                      type="range" min="0" max="100"
                      value={form.sustainabilityScore}
                      onChange={e => handleFormChange('sustainabilityScore', e.target.value)}
                      className="w-full accent-primary-600"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>0 — Low</span><span>50 — Moderate</span><span>100 — Excellent</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Eco Badges</label>
                    <div className="flex flex-wrap gap-2">
                      {ECO_BADGES.map(badge => (
                        <button
                          key={badge} type="button"
                          onClick={() => handleBadgeToggle(badge)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                            form.ecoBadges.includes(badge)
                              ? 'bg-primary-600 text-white border-primary-600'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          {badge}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.verified}
                        onChange={e => handleFormChange('verified', e.target.checked)}
                        className="w-4 h-4 accent-primary-600 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Eco Verified</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.featured}
                        onChange={e => handleFormChange('featured', e.target.checked)}
                        className="w-4 h-4 accent-primary-600 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Featured on Home</span>
                    </label>
                  </div>

                  {form.verified && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Verification Notes</label>
                      <textarea
                        rows={2}
                        value={form.verificationNotes}
                        onChange={e => handleFormChange('verificationNotes', e.target.value)}
                        placeholder="e.g. GOTS certified. OEKO-TEX Standard 100 verified."
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      />
                    </div>
                  )}
                </div>
              </section>

              {/* ── Extra Details ── */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Additional Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight / Size</label>
                    <input
                      type="text"
                      value={form.weight}
                      onChange={e => handleFormChange('weight', e.target.value)}
                      placeholder="e.g. 500ml, 200g"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
                    <input
                      type="text"
                      value={form.material}
                      onChange={e => handleFormChange('material', e.target.value)}
                      placeholder="e.g. Organic Cotton"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
                    <input
                      type="text"
                      value={form.origin}
                      onChange={e => handleFormChange('origin', e.target.value)}
                      placeholder="e.g. India, Germany"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags <span className="text-gray-400 font-normal">(comma-separated)</span>
                    </label>
                    <input
                      type="text"
                      value={form.tags}
                      onChange={e => handleFormChange('tags', e.target.value)}
                      placeholder="e.g. bamboo, zero waste, kitchen"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </section>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-60 flex items-center gap-2"
                >
                  {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {saving ? 'Saving to Database...' : editProduct ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          Delete Confirmation
      ═══════════════════════════════════════════════════════════ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Delete Product</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-gray-700">"{deleteTarget.name}"</span>?
              This will remove it from the database permanently.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
