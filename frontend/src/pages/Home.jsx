import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';

const stats = [
  { icon: '🌱', value: '500+', label: 'Verified Products' },
  { icon: '♻️', value: '98%', label: 'Plastic-Free Packaging' },
  { icon: '🌍', value: '12K+', label: 'Happy Customers' },
  { icon: '🤝', value: '200+', label: 'Ethical Brands' },
];

const categories = [
  { name: 'Home & Garden', icon: '🏡', color: 'from-green-400 to-emerald-500', bg: 'bg-emerald-50' },
  { name: 'Personal Care', icon: '🌸', color: 'from-pink-400 to-rose-500', bg: 'bg-rose-50' },
  { name: 'Food & Beverage', icon: '🥗', color: 'from-lime-400 to-green-500', bg: 'bg-lime-50' },
  { name: 'Fashion', icon: '👗', color: 'from-purple-400 to-violet-500', bg: 'bg-violet-50' },
  { name: 'Tech & Gadgets', icon: '⚡', color: 'from-blue-400 to-cyan-500', bg: 'bg-cyan-50' },
  { name: 'Outdoor & Travel', icon: '🏕️', color: 'from-orange-400 to-amber-500', bg: 'bg-amber-50' },
  { name: 'Kids & Baby', icon: '🧸', color: 'from-yellow-400 to-orange-400', bg: 'bg-yellow-50' },
  { name: 'Office & Stationery', icon: '📝', color: 'from-teal-400 to-green-500', bg: 'bg-teal-50' },
];

const ecoFeatures = [
  { icon: '✅', title: 'Verified Products', desc: 'Every item is vetted against strict sustainability criteria. No greenwashing, ever.' },
  { icon: '🌿', title: 'Eco Score', desc: 'Our proprietary sustainability score helps you make truly informed choices quickly.' },
  { icon: '📦', title: 'Zero-Waste Shipping', desc: 'All orders ship in 100% compostable or recycled packaging. Carbon offset included.' },
  { icon: '🤝', title: 'Small Brand Support', desc: 'We partner directly with small ethical brands, giving them the visibility they deserve.' },
];

export default function Home() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroSearch, setHeroSearch] = useState('');

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const q = heroSearch.trim();
    if (q) navigate(`/products?search=${encodeURIComponent(q)}`);
  };

  const heroSlides = [
    {
      title: 'Shop Green. Live Clean.',
      subtitle: 'Discover hundreds of verified eco-friendly products from ethical brands who care about the planet.',
      bg: 'from-eco-dark via-eco-leaf to-eco-mint',
      img: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
      cta: 'Explore Products',
      link: '/products',
    },
    {
      title: 'No Greenwashing Here.',
      subtitle: 'Every product on Green Products is rigorously verified for authentic sustainability claims.',
      bg: 'from-teal-900 via-teal-700 to-emerald-600',
      img: 'https://images.unsplash.com/photo-1587614295999-6c1317895d28?w=800&q=80',
      cta: 'Verified Products',
      link: '/products?verified=true',
    },
    {
      title: 'Every Purchase Gives Back.',
      subtitle: '2% of every order goes to global reforestation projects. Together we plant a greener future.',
      bg: 'from-green-900 via-green-700 to-lime-600',
      img: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
      cta: 'Learn More',
      link: '/about',
    },
  ];

  useEffect(() => {
    api.get('/products/featured').then(({ data }) => {
      setFeatured(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setCurrentSlide(s => (s + 1) % heroSlides.length), 5000);
    return () => clearInterval(interval);
  }, []);

  const slide = heroSlides[currentSlide];

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className={`relative min-h-[92vh] bg-gradient-to-br ${slide.bg} flex items-center overflow-hidden transition-all duration-1000`}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
        </div>

        {/* Floating particles */}
        {['🌿', '🍃', '♻️', '🌱', '🌍'].map((emoji, i) => (
          <div
            key={i}
            className="absolute text-2xl opacity-20 animate-float"
            style={{
              left: `${10 + i * 20}%`,
              top: `${15 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${3 + i * 0.5}s`
            }}
          >
            {emoji}
          </div>
        ))}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <span className="w-2 h-2 bg-primary-300 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-white/90">Verified Sustainable Shopping</span>
              </div>

              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-fade-in">
                {slide.title.split(' ').map((word, i) => (
                  <span key={i} className={i === 1 ? 'text-primary-300' : ''}>{word} </span>
                ))}
              </h1>

              <p className="text-lg sm:text-xl text-white/80 leading-relaxed mb-8 max-w-lg animate-slide-up">
                {slide.subtitle}
              </p>

              {/* Hero Search */}
              <form onSubmit={handleHeroSearch} className="flex gap-2 max-w-md mb-6">
                <div className="relative flex-1">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={heroSearch}
                    onChange={e => setHeroSearch(e.target.value)}
                    placeholder="Search eco products, brands..."
                    className="w-full pl-10 pr-4 py-3 bg-white/15 backdrop-blur border border-white/25 rounded-xl text-white placeholder-white/50 focus:outline-none focus:bg-white/25 focus:border-white/50 transition-all"
                  />
                </div>
                <button type="submit" className="px-6 py-3 bg-white text-eco-leaf font-semibold rounded-xl hover:bg-primary-50 transition-all shadow-md whitespace-nowrap">
                  Search
                </button>
              </form>

              <div className="flex flex-wrap gap-4">
                <Link to={slide.link} className="inline-flex items-center gap-2 bg-white text-eco-leaf font-bold px-8 py-4 rounded-2xl hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl active:scale-95">
                  {slide.cta}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link to="/about" className="inline-flex items-center gap-2 border-2 border-white/50 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/10 transition-all">
                  Our Mission
                </Link>
              </div>

              {/* Slide indicators */}
              <div className="flex gap-2 mt-8">
                {heroSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-1.5 rounded-full transition-all ${i === currentSlide ? 'bg-white w-8' : 'bg-white/40 w-3'}`}
                  />
                ))}
              </div>
            </div>

            {/* Hero image */}
            <div className="hidden lg:block relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={slide.img}
                  alt="Sustainable living"
                  className="w-full h-[520px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-xl">🌿</div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Eco Score</p>
                    <p className="text-lg font-bold text-primary-600">92 / 100</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✅</span>
                  <div>
                    <p className="text-xs text-gray-500">Verified</p>
                    <p className="text-sm font-bold text-gray-900">500+ Products</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold font-display text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50 bg-leaf-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="eco-badge mb-3">Shop by Category</span>
            <h2 className="section-title mt-2">Find Your Green Essentials</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className={`${cat.bg} rounded-2xl p-5 flex flex-col items-center gap-3 hover:shadow-md transition-all group hover:-translate-y-1 duration-200`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-3xl shadow-md group-hover:scale-110 transition-transform`}>
                  {cat.icon}
                </div>
                <span className="text-sm font-semibold text-gray-700 text-center">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="eco-badge mb-2">Handpicked for You</span>
              <h2 className="section-title mt-1">Featured Products</h2>
            </div>
            <Link to="/products" className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center gap-1">
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
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
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {featured.map(product => <ProductCard key={product._id} product={product} />)}
            </div>
          )}
        </div>
      </section>

      {/* Why Green Products */}
      <section className="py-16 bg-gradient-to-br from-eco-dark to-eco-leaf text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold mb-4">Why Green Products?</h2>
            <p className="text-white/70 max-w-2xl mx-auto text-lg">
              We built this platform to solve the biggest problem in sustainable shopping — trust. Every product here earns its place.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ecoFeatures.map((f, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-2xl p-6 hover:bg-white/15 transition-colors">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-xl mb-2">{f.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-primary-50 bg-leaf-pattern">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-6xl mb-4">🌍</div>
          <h2 className="section-title mb-4">Ready to Make a Difference?</h2>
          <p className="text-gray-600 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of eco-conscious shoppers choosing verified sustainable products every day.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/products" className="btn-primary">Start Shopping 🌿</Link>
            <Link to="/register" className="btn-outline">Create Account</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
