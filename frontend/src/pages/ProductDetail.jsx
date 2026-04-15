import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Stars = ({ rating, size = 'md', interactive = false, onRate }) => {
  const [hovered, setHovered] = useState(0);
  const s = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type={interactive ? 'button' : undefined}
          onClick={() => interactive && onRate && onRate(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={`${s} transition-colors ${interactive ? 'cursor-pointer' : 'cursor-default'} ${
            star <= (hovered || Math.round(rating)) ? 'text-yellow-400' : 'text-gray-200'
          }`}
        >
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
};

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState('description');

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(({ data }) => { setProduct(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, qty);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to review'); return; }
    setSubmitting(true);
    try {
      await api.post(`/products/${id}/reviews`, reviewForm);
      toast.success('Review submitted!');
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🌿</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Product not found</h2>
          <Link to="/products" className="btn-primary">Back to Shop</Link>
        </div>
      </div>
    );
  }

  const scoreColor = product.sustainabilityScore >= 90 ? 'text-primary-600 bg-primary-50' :
    product.sustainabilityScore >= 70 ? 'text-yellow-600 bg-yellow-50' : 'text-orange-600 bg-orange-50';

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-primary-600">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-primary-600">Products</Link>
            <span>/</span>
            <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-primary-600">{product.category}</Link>
            <span>/</span>
            <span className="text-gray-700 font-medium truncate max-w-xs">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Images */}
          <div>
            <div className="rounded-3xl overflow-hidden bg-white shadow-sm mb-4 aspect-square">
              <img
                src={imgError ? `https://placehold.co/800x800/dcfce7/166534?text=${encodeURIComponent(product.name)}` : product.images[activeImg]}
                alt={product.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => { setActiveImg(i); setImgError(false); }}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-primary-500' : 'border-transparent'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-sm text-primary-600 font-semibold mb-1">{product.brand}</p>
                <h1 className="font-display text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>
              </div>
              {product.verified && (
                <div className="flex-shrink-0 bg-primary-50 text-primary-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified
                </div>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <Stars rating={product.rating} />
              <span className="text-sm text-gray-500">{product.rating.toFixed(1)} ({product.numReviews} reviews)</span>
            </div>

            {/* Eco Score */}
            <div className={`inline-flex items-center gap-3 px-4 py-3 rounded-2xl ${scoreColor} mb-5`}>
              <div>
                <p className="text-xs font-medium opacity-70">Sustainability Score</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{product.sustainabilityScore}</span>
                  <span className="text-sm opacity-70">/ 100</span>
                </div>
              </div>
              <div className="w-16 bg-white/50 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-current opacity-70"
                  style={{ width: `${product.sustainabilityScore}%` }}
                />
              </div>
            </div>

            {/* Eco Badges */}
            <div className="flex flex-wrap gap-2 mb-5">
              {product.ecoBadges.map(badge => (
                <span key={badge} className="eco-badge">{badge}</span>
              ))}
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl font-bold font-display text-gray-900">£{product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-gray-400 line-through">£{product.originalPrice.toFixed(2)}</span>
                  <span className="badge bg-red-100 text-red-600">
                    Save £{(product.originalPrice - product.price).toFixed(2)}
                  </span>
                </>
              )}
            </div>

            {/* Stock */}
            <div className={`flex items-center gap-2 mb-6 text-sm font-medium ${product.stock > 0 ? 'text-primary-600' : 'text-red-500'}`}>
              <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-primary-500' : 'bg-red-500'}`} />
              {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left!` : 'Out of Stock'}
            </div>

            {/* Quantity + Add to cart */}
            {product.stock > 0 && (
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-3 hover:bg-gray-50 transition-colors text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="px-5 py-3 font-semibold text-gray-900 border-x border-gray-200 min-w-[3rem] text-center">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-4 py-3 hover:bg-gray-50 transition-colors text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                <button onClick={handleAddToCart} className="flex-1 btn-primary flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Add to Cart
                </button>
              </div>
            )}

            {/* Product meta */}
            <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-sm">
              {product.material && <div className="flex justify-between"><span className="text-gray-500">Material</span><span className="font-medium text-gray-700">{product.material}</span></div>}
              {product.origin && <div className="flex justify-between"><span className="text-gray-500">Origin</span><span className="font-medium text-gray-700">{product.origin}</span></div>}
              {product.weight && <div className="flex justify-between"><span className="text-gray-500">Weight/Size</span><span className="font-medium text-gray-700">{product.weight}</span></div>}
              <div className="flex justify-between"><span className="text-gray-500">Category</span><span className="font-medium text-gray-700">{product.category}</span></div>
            </div>

            {/* Carbon note */}
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 bg-primary-50 px-4 py-3 rounded-xl">
              <span className="text-lg">🌍</span>
              <span>2% of your purchase goes to reforestation projects. Carbon neutral shipping included.</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12">
          <div className="flex gap-1 border-b border-gray-200 mb-6">
            {[
              { id: 'description', label: 'Description' },
              { id: 'sustainability', label: 'Sustainability' },
              { id: 'reviews', label: `Reviews (${product.numReviews})` },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-6 py-3 text-sm font-semibold transition-all border-b-2 ${
                  tab === t.id ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'description' && (
            <div className="bg-white rounded-2xl p-6">
              <p className="text-gray-600 leading-relaxed text-base">{product.description}</p>
              {product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {product.tags.map(tag => (
                    <span key={tag} className="badge bg-gray-100 text-gray-600">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'sustainability' && (
            <div className="bg-white rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${scoreColor}`}>
                  <span className="text-3xl font-bold">{product.sustainabilityScore}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Eco Score: {product.sustainabilityScore}/100</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {product.sustainabilityScore >= 90 ? 'Excellent – Top sustainability standards' :
                      product.sustainabilityScore >= 70 ? 'Good – Above average sustainability' :
                        'Fair – Some sustainability measures in place'}
                  </p>
                </div>
              </div>
              {product.verified && product.verificationNotes && (
                <div className="bg-primary-50 rounded-xl p-4">
                  <p className="text-sm font-semibold text-primary-700 mb-1">Verification Notes</p>
                  <p className="text-sm text-primary-600">{product.verificationNotes}</p>
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900 mb-3">Certifications & Badges</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {product.ecoBadges.map(badge => (
                    <div key={badge} className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                      <span className="text-xl">✅</span>
                      <span className="text-sm font-medium text-gray-700">{badge}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'reviews' && (
            <div className="space-y-4">
              {/* Review form */}
              {user && (
                <div className="bg-white rounded-2xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Write a Review</h3>
                  <form onSubmit={submitReview} className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Your Rating</label>
                      <Stars rating={reviewForm.rating} size="lg" interactive onRate={r => setReviewForm(f => ({ ...f, rating: r }))} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Your Review</label>
                      <textarea
                        value={reviewForm.comment}
                        onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                        className="input resize-none"
                        rows={3}
                        placeholder="Share your experience with this product..."
                        required
                      />
                    </div>
                    <button type="submit" disabled={submitting} className="btn-primary text-sm py-2.5">
                      {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                </div>
              )}

              {/* Reviews list */}
              {product.reviews.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-gray-500">
                  <div className="text-4xl mb-2">⭐</div>
                  <p>No reviews yet. Be the first to review!</p>
                </div>
              ) : (
                product.reviews.map(r => (
                  <div key={r._id} className="bg-white rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-eco-leaf rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {r.name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{r.name}</p>
                          <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Stars rating={r.rating} size="sm" />
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{r.comment}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
