import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/auth/profile').then(({ data }) => { setProfile(data); setLoading(false); }).catch(() => setLoading(false));
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-eco-dark to-eco-leaf py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-24 h-24 bg-white/20 backdrop-blur rounded-3xl flex items-center justify-center text-5xl font-bold text-white mx-auto mb-4">
            {user.name[0].toUpperCase()}
          </div>
          <h1 className="font-display text-4xl font-bold text-white mb-1">{user.name}</h1>
          <p className="text-white/70">{user.email}</p>
          {user.role === 'admin' && (
            <span className="inline-flex items-center gap-1 mt-2 bg-yellow-400/20 text-yellow-300 px-3 py-1 rounded-full text-xs font-semibold">
              ⚙️ Admin
            </span>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats */}
          {[
            { icon: '🛒', label: 'Orders', value: loading ? '...' : profile?.wishlist?.length !== undefined ? '–' : '0' },
            { icon: '❤️', label: 'Wishlist', value: loading ? '...' : profile?.wishlist?.length || 0 },
            { icon: '🌱', label: 'Eco Score', value: '94/100' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <div className="text-4xl mb-3">{stat.icon}</div>
              <p className="text-3xl font-bold font-display text-gray-900">{stat.value}</p>
              <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Account info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mt-6">
          <h2 className="font-display text-xl font-bold text-gray-900 mb-5">Account Information</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-500 font-medium">Full Name</p>
                <p className="font-semibold text-gray-900 mt-0.5">{user.name}</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-500 font-medium">Email Address</p>
                <p className="font-semibold text-gray-900 mt-0.5">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-500 font-medium">Account Role</p>
                <p className="font-semibold text-gray-900 mt-0.5 capitalize">{user.role}</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-xs text-gray-500 font-medium">Member Since</p>
                <p className="font-semibold text-gray-900 mt-0.5">{loading ? '...' : profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }) : '–'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <button onClick={() => navigate('/orders')} className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow text-left group">
            <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-primary-100 transition-colors">📦</div>
            <div>
              <p className="font-semibold text-gray-900">My Orders</p>
              <p className="text-sm text-gray-500">View order history</p>
            </div>
          </button>
          <button onClick={() => navigate('/products')} className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow text-left group">
            <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-primary-100 transition-colors">🛍️</div>
            <div>
              <p className="font-semibold text-gray-900">Continue Shopping</p>
              <p className="text-sm text-gray-500">Browse eco products</p>
            </div>
          </button>
        </div>

        {/* Sign out */}
        <div className="mt-6 text-center">
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
          >
            Sign Out →
          </button>
        </div>
      </div>
    </div>
  );
}
