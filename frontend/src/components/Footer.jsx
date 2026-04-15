import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-eco-dark text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
                <span className="text-xl">🌿</span>
              </div>
              <span className="font-display font-bold text-xl">Green<span className="text-primary-400">Products</span></span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              A dedicated e-commerce platform connecting eco-conscious consumers with verified sustainable products. Shop green. Live clean.
            </p>
            <div className="flex gap-3 mt-4">
              {['🐦', '📘', '📸', '💼'].map((icon, i) => (
                <button key={i} className="w-9 h-9 bg-white/10 hover:bg-primary-500 rounded-lg flex items-center justify-center transition-colors text-base">
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/products', label: 'Shop' },
                { to: '/about', label: 'About Us' },
                { to: '/products?verified=true', label: 'Verified Products' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-white mb-4">Categories</h3>
            <ul className="space-y-2">
              {['Home & Garden', 'Personal Care', 'Food & Beverage', 'Fashion', 'Tech & Gadgets'].map(cat => (
                <li key={cat}>
                  <Link to={`/products?category=${encodeURIComponent(cat)}`} className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2025 Green Products. Gopalakrishna Balaboina – A00046745
          </p>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <span>🌱</span>
            <span>Carbon neutral shipping on all orders</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
