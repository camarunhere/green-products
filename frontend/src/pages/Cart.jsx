import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, subtotal, totalItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const shipping = subtotal > 0 ? (subtotal >= 50 ? 0 : 4.99) : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleCheckout = () => {
    if (!user) {
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">🛒</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Start filling it with verified eco-friendly products!</p>
          <Link to="/products" className="btn-primary">Explore Products 🌿</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-eco-dark to-eco-leaf py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-bold text-white">Shopping Cart</h1>
          <p className="text-white/70 mt-1">{totalItems} item{totalItems !== 1 ? 's' : ''} in your cart</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => (
              <div key={item._id} className="bg-white rounded-2xl p-4 sm:p-5 flex gap-4">
                <Link to={`/products/${item._id}`} className="flex-shrink-0">
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover"
                    onError={e => { e.target.src = `https://placehold.co/200x200/dcfce7/166534?text=🌿`; }}
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-primary-600 font-medium">{item.brand}</p>
                      <Link to={`/products/${item._id}`} className="font-semibold text-gray-900 hover:text-primary-700 leading-snug line-clamp-2">
                        {item.name}
                      </Link>
                    </div>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {item.verified && (
                    <span className="inline-flex items-center gap-1 text-xs text-primary-600 font-medium mt-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified Eco Product
                    </span>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="px-3 py-1.5 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="px-3 py-1.5 text-sm font-semibold border-x border-gray-200 min-w-[2.5rem] text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="px-3 py-1.5 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                    <span className="font-bold text-lg text-gray-900">£{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-2xl p-6 sticky top-24">
              <h2 className="font-display text-xl font-bold text-gray-900 mb-5">Order Summary</h2>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>£{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className={shipping === 0 ? 'text-primary-600 font-medium' : 'text-gray-900'}>
                    {shipping === 0 ? 'Free' : `£${shipping.toFixed(2)}`}
                  </span>
                </div>
                {shipping === 0 && (
                  <p className="text-xs text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg">🎉 Free shipping on orders over £50!</p>
                )}
                {shipping > 0 && (
                  <p className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                    Add £{(50 - subtotal).toFixed(2)} more for free shipping
                  </p>
                )}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax (8%)</span>
                  <span>£{tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex justify-between font-bold text-lg text-gray-900">
                    <span>Total</span>
                    <span>£{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Carbon offset note */}
              <div className="bg-primary-50 rounded-xl p-3 flex items-center gap-2 text-xs text-primary-700 mb-5">
                <span className="text-lg">🌱</span>
                <span>£{(total * 0.02).toFixed(2)} from this order goes to reforestation</span>
              </div>

              <button onClick={handleCheckout} className="btn-primary w-full text-base">
                Proceed to Checkout →
              </button>

              <Link to="/products" className="block text-center mt-3 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                ← Continue Shopping
              </Link>

              {/* Secure badges */}
              <div className="flex items-center justify-center gap-4 mt-5 text-xs text-gray-400">
                <span className="flex items-center gap-1">🔒 Secure</span>
                <span className="flex items-center gap-1">♻️ Eco Shipping</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
