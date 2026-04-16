import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';

const CATEGORIES = ['All', 'Home & Garden', 'Food & Beverage', 'Fashion', 'Personal Care', 'Tech & Gadgets', 'Kids & Baby', 'Outdoor & Travel', 'Office & Stationery'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'eco', label: 'Eco Score' },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category = searchParams.get('category') || 'All';
  const search = searchParams.get('search') || '';
  const verified = searchParams.get('verified') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = Number(searchParams.get('page')) || 1;
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const [searchInput, setSearchInput] = useState(search);
  const [priceRange, setPriceRange] = useState({ min: minPrice, max: maxPrice });
  const isFirstRender = useRef(true);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, sort };
      if (category !== 'All') params.category = category;
      if (search) params.search = search;
      if (verified) params.verified = verified;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const { data } = await api.get('/products', { params });
      setProducts(Array.isArray(data.products) ? data.products : []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [category, search, verified, sort, page, minPrice, maxPrice]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Live debounced search — skips the initial mount to avoid a double fetch
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    const timer = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      if (searchInput) next.set('search', searchInput); else next.delete('search');
      next.delete('page');
      setSearchParams(next);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    e.preventDefault();
    updateParam('search', searchInput);
  };

  const handlePriceFilter = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (priceRange.min) next.set('minPrice', priceRange.min); else next.delete('minPrice');
    if (priceRange.max) next.set('maxPrice', priceRange.max); else next.delete('maxPrice');
    next.delete('page');
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchInput('');
    setPriceRange({ min: '', max: '' });
    setSearchParams({});
  };

  const hasActiveFilters = category !== 'All' || search || verified || minPrice || maxPrice;

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-eco-dark to-eco-leaf py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-bold text-white mb-2">
            {category !== 'All' ? category : 'All Products'}
          </h1>
          <p className="text-white/70">{total} verified sustainable products</p>

          {/* Search */}
          <form onSubmit={handleSearch} className="mt-5 flex gap-2 max-w-lg">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search products, brands..."
                className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all"
              />
            </div>
            <button type="submit" className="px-6 py-3 bg-white text-eco-leaf font-semibold rounded-xl hover:bg-primary-50 transition-all">
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Pills */}
        <div className="flex gap-2 flex-wrap mb-6 overflow-x-auto pb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => updateParam('category', cat === 'All' ? '' : cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                (cat === 'All' && category === 'All') || category === cat
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Verified toggle */}
            <button
              onClick={() => updateParam('verified', verified ? '' : 'true')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                verified ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Verified Only
            </button>

            {/* Price filter toggle */}
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:border-primary-300 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </button>

            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={e => updateParam('sort', e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Price filter panel */}
        {filtersOpen && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 animate-slide-up">
            <form onSubmit={handlePriceFilter} className="flex items-end gap-4 flex-wrap">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Min Price (£)</label>
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={e => setPriceRange(p => ({ ...p, min: e.target.value }))}
                  placeholder="0"
                  className="input w-32"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Max Price (£)</label>
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={e => setPriceRange(p => ({ ...p, max: e.target.value }))}
                  placeholder="500"
                  className="input w-32"
                  min="0"
                />
              </div>
              <button type="submit" className="btn-primary py-2.5 text-sm">Apply</button>
            </form>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🌿</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or search query</p>
            <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map(product => <ProductCard key={product._id} product={product} />)}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {[...Array(pages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const next = new URLSearchParams(searchParams);
                      next.set('page', String(i + 1));
                      setSearchParams(next);
                    }}
                    className={`w-10 h-10 rounded-xl font-medium text-sm transition-all ${
                      page === i + 1 ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
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
  );
}
