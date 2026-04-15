import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const steps = ['Shipping', 'Payment', 'Confirm'];

export default function Checkout() {
  const { cart, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(null);

  const shipping = subtotal >= 50 ? 0 : 4.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const [shippingData, setShippingData] = useState({
    fullName: user?.name || '',
    address: '',
    city: '',
    postalCode: '',
    country: 'United Kingdom',
  });

  const [paymentData, setPaymentData] = useState({
    method: 'Credit Card',
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  const updateShipping = (key, val) => setShippingData(p => ({ ...p, [key]: val }));
  const updatePayment = (key, val) => setPaymentData(p => ({ ...p, [key]: val }));

  const placeOrder = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/orders', {
        items: cart.map(i => ({
          product: i._id,
          name: i.name,
          image: i.images[0],
          price: i.price,
          quantity: i.quantity,
        })),
        shippingAddress: shippingData,
        paymentMethod: paymentData.method,
        itemsPrice: subtotal,
        shippingPrice: shipping,
        taxPrice: tax,
        totalPrice: total,
      });
      clearCart();
      setOrderPlaced(data);
      toast.success('Order placed successfully! 🌿');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Your cart is empty</h2>
          <Link to="/products" className="btn-primary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-lg">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">🌿</span>
          </div>
          <h2 className="font-display text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
          <p className="text-gray-500 mb-6">Thank you for shopping sustainably. Your order is being processed.</p>
          <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Order ID</span>
              <span className="font-mono font-semibold text-gray-900 text-xs">{orderPlaced._id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total</span>
              <span className="font-bold text-gray-900">£{orderPlaced.totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Carbon Offset</span>
              <span className="font-medium text-primary-600">£{Number(orderPlaced.carbonOffset).toFixed(2)} donated 🌱</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/orders" className="flex-1 btn-primary text-sm py-2.5">My Orders</Link>
            <Link to="/products" className="flex-1 btn-outline text-sm py-2.5">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-eco-dark to-eco-leaf py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-bold text-white mb-4">Checkout</h1>
          {/* Step indicator */}
          <div className="flex items-center gap-0">
            {steps.map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-2 ${i <= step ? 'text-white' : 'text-white/40'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    i < step ? 'bg-primary-400' : i === step ? 'bg-white text-eco-leaf' : 'bg-white/20'
                  }`}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{s}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 ${i < step ? 'bg-primary-400' : 'bg-white/20'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main form */}
          <div className="lg:col-span-2">
            {step === 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-display text-xl font-bold text-gray-900 mb-5">Shipping Address</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                    <input value={shippingData.fullName} onChange={e => updateShipping('fullName', e.target.value)} className="input" placeholder="John Doe" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address</label>
                    <input value={shippingData.address} onChange={e => updateShipping('address', e.target.value)} className="input" placeholder="123 Green Street" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                      <input value={shippingData.city} onChange={e => updateShipping('city', e.target.value)} className="input" placeholder="London" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Postal Code</label>
                      <input value={shippingData.postalCode} onChange={e => updateShipping('postalCode', e.target.value)} className="input" placeholder="SW1A 1AA" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
                    <select value={shippingData.country} onChange={e => updateShipping('country', e.target.value)} className="input">
                      {['United Kingdom', 'United States', 'Canada', 'Australia', 'Germany', 'France', 'Ireland'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!shippingData.fullName || !shippingData.address || !shippingData.city || !shippingData.postalCode) {
                      toast.error('Please fill all shipping fields');
                      return;
                    }
                    setStep(1);
                  }}
                  className="btn-primary w-full mt-6"
                >
                  Continue to Payment →
                </button>
              </div>
            )}

            {step === 1 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-display text-xl font-bold text-gray-900 mb-5">Payment Details</h2>

                {/* Payment method selector */}
                <div className="flex gap-3 mb-5">
                  {['Credit Card', 'PayPal'].map(m => (
                    <button
                      key={m}
                      onClick={() => updatePayment('method', m)}
                      className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                        paymentData.method === m ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {m === 'Credit Card' ? '💳' : '🅿️'} {m}
                    </button>
                  ))}
                </div>

                {paymentData.method === 'Credit Card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Name on Card</label>
                      <input value={paymentData.cardName} onChange={e => updatePayment('cardName', e.target.value)} className="input" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Card Number</label>
                      <input value={paymentData.cardNumber} onChange={e => updatePayment('cardNumber', e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim())} className="input" placeholder="1234 5678 9012 3456" maxLength={19} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Expiry Date</label>
                        <input value={paymentData.expiry} onChange={e => updatePayment('expiry', e.target.value)} className="input" placeholder="MM/YY" maxLength={5} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">CVV</label>
                        <input type="password" value={paymentData.cvv} onChange={e => updatePayment('cvv', e.target.value.slice(0, 3))} className="input" placeholder="•••" maxLength={3} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-xl">
                      <span>🔒</span>
                      <span>Your payment info is encrypted and secure. We never store card details.</span>
                    </div>
                  </div>
                )}

                {paymentData.method === 'PayPal' && (
                  <div className="bg-blue-50 rounded-xl p-6 text-center">
                    <span className="text-4xl">🅿️</span>
                    <p className="text-blue-700 font-medium mt-2">You'll be redirected to PayPal to complete your payment securely.</p>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(0)} className="btn-outline flex-1">← Back</button>
                  <button onClick={() => setStep(2)} className="btn-primary flex-1">Review Order →</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-display text-xl font-bold text-gray-900 mb-5">Review Your Order</h2>

                {/* Shipping summary */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-semibold text-gray-700 text-sm">Shipping to</p>
                    <button onClick={() => setStep(0)} className="text-xs text-primary-600 hover:text-primary-700">Edit</button>
                  </div>
                  <p className="text-sm text-gray-600">{shippingData.fullName}</p>
                  <p className="text-sm text-gray-600">{shippingData.address}, {shippingData.city}</p>
                  <p className="text-sm text-gray-600">{shippingData.postalCode}, {shippingData.country}</p>
                </div>

                {/* Items */}
                <div className="space-y-3 mb-4">
                  {cart.map(item => (
                    <div key={item._id} className="flex gap-3 items-center">
                      <img src={item.images[0]} alt={item.name} className="w-14 h-14 rounded-xl object-cover" onError={e => { e.target.src = 'https://placehold.co/100x100/dcfce7/166534?text=🌿'; }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-semibold text-gray-900 text-sm">£{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(1)} className="btn-outline flex-1">← Back</button>
                  <button onClick={placeOrder} disabled={loading} className="btn-primary flex-1">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Placing Order...
                      </span>
                    ) : `Place Order • £${total.toFixed(2)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm mb-4">
                {cart.map(item => (
                  <div key={item._id} className="flex justify-between text-gray-600">
                    <span className="truncate pr-2">{item.name} ×{item.quantity}</span>
                    <span className="font-medium text-gray-900 flex-shrink-0">£{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span><span>£{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-primary-600' : ''}>{shipping === 0 ? 'Free' : `£${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span><span>£{tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900">
                  <span>Total</span><span>£{total.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-4 bg-primary-50 rounded-xl p-3 text-xs text-primary-700 flex items-start gap-2">
                <span className="text-base">🌱</span>
                <span>£{(total * 0.02).toFixed(2)} from your order supports reforestation projects worldwide.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
