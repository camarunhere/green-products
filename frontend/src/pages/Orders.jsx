import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-purple-100 text-purple-700',
  Delivered: 'bg-primary-100 text-primary-700',
  Cancelled: 'bg-red-100 text-red-700',
};

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/orders/myorders')
      .then(({ data }) => { setOrders(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-eco-dark to-eco-leaf py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-bold text-white">My Orders</h1>
          <p className="text-white/70 mt-1">Track all your sustainable purchases</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="flex justify-between mb-4">
                  <div className="h-4 bg-gray-200 rounded w-40" />
                  <div className="h-6 bg-gray-200 rounded-full w-24" />
                </div>
                <div className="h-3 bg-gray-200 rounded w-64 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-48" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6">Start your eco-friendly shopping journey today!</p>
            <Link to="/products" className="btn-primary">Shop Now 🌿</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order._id} className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                {/* Order header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Order #{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <span className={`badge font-semibold ${STATUS_COLORS[order.status]}`}>
                    {order.status}
                  </span>
                </div>

                {/* Items preview */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                  {order.items.slice(0, 4).map((item, i) => (
                    <img
                      key={i}
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      onError={e => { e.target.src = 'https://placehold.co/80x80/dcfce7/166534?text=🌿'; }}
                    />
                  ))}
                  {order.items.length > 4 && (
                    <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-sm text-gray-500 flex-shrink-0 font-medium">
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>

                {/* Order summary row */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                    <span className="text-primary-600 font-medium text-xs flex items-center gap-1">
                      🌱 £{Number(order.carbonOffset).toFixed(2)} offset donated
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-gray-900">£{order.totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Items list (collapsed) */}
                <div className="mt-3 space-y-1">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs text-gray-500">
                      <span className="truncate pr-2">{item.name} × {item.quantity}</span>
                      <span className="flex-shrink-0">£{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
