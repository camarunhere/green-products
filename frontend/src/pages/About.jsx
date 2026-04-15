import React from 'react';
import { Link } from 'react-router-dom';

const team = [
  { name: 'Gopalakrishna Balaboina', role: 'MSc Student Developer', id: 'A00046745', emoji: '👨‍💻' },
  { name: 'Rabail Tahir', role: 'Project Supervisor', emoji: '👩‍🏫' },
];

const milestones = [
  { phase: 'Requirement Analysis', desc: 'Identified user needs, functional specs, and sustainability criteria through research.', icon: '📋', done: true },
  { phase: 'Design & Architecture', desc: 'Designed system architecture, UI prototypes in Figma, and database schema.', icon: '🎨', done: true },
  { phase: 'Development', desc: 'Built React frontend, Node.js backend, MongoDB database, and JWT authentication.', icon: '⚙️', done: true },
  { phase: 'Testing & QA', desc: 'Functional, usability, and performance testing to ensure platform quality.', icon: '🧪', done: false },
  { phase: 'Deployment', desc: 'Launching platform on Vercel for public eco-conscious shoppers.', icon: '🚀', done: false },
];

const values = [
  { icon: '🔍', title: 'Radical Transparency', desc: 'Every product listing shows sustainability scores, certifications, and verification notes. No hidden claims.' },
  { icon: '✅', title: 'Rigorous Verification', desc: 'Our team reviews every brand against strict eco-criteria. We reject products that don\'t meet our standards.' },
  { icon: '🤝', title: 'Small Brand First', desc: 'We prioritize small ethical brands, giving them equal visibility to compete with large corporations.' },
  { icon: '🌍', title: 'Planetary Impact', desc: '2% of every sale funds verified reforestation and ocean cleanup projects around the world.' },
  { icon: '📚', title: 'Consumer Education', desc: 'Our eco score system helps consumers understand exactly why a product is (or isn\'t) sustainable.' },
  { icon: '🔒', title: 'Privacy & Security', desc: 'JWT authentication, encrypted transactions, and zero data selling — your privacy is not for sale.' },
];

export default function About() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-eco-dark via-eco-leaf to-eco-mint min-h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-80 h-80 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-60 h-60 bg-white rounded-full blur-3xl" />
        </div>
        {['🌿', '🍃', '🌱', '🌎', '♻️'].map((e, i) => (
          <div key={i} className="absolute text-4xl opacity-15 animate-float" style={{ left: `${8 + i * 21}%`, top: `${20 + (i % 2) * 40}%`, animationDelay: `${i * 0.6}s` }}>{e}</div>
        ))}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center py-16">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 bg-primary-300 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-white/90">MSc Project – CMP060L050S</span>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
            Fighting Greenwashing,<br />
            <span className="text-primary-300">One Product at a Time</span>
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Green Products is a dedicated e-commerce platform built to solve the trust crisis in sustainable shopping — verified products, transparent scores, no compromise.
          </p>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-red-50 rounded-3xl p-8">
              <div className="text-4xl mb-4">❌</div>
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">The Problem</h2>
              <ul className="space-y-3">
                {[
                  'Current platforms lack clear eco vs non-eco distinction',
                  'Greenwashing makes it impossible to trust sustainability labels',
                  'Consumers spend hours verifying product claims',
                  'Small ethical brands lose to greenwashing giants',
                  'No consistent sustainability scoring system exists',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-red-500 mt-0.5 flex-shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-primary-50 rounded-3xl p-8">
              <div className="text-4xl mb-4">✅</div>
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">Our Solution</h2>
              <ul className="space-y-3">
                {[
                  'Verified product listing with eco badges and scores',
                  'Third-party verification status shown on every product',
                  'Proprietary Eco Score (0–100) for quick comparison',
                  'Dedicated space for small ethical brands to thrive',
                  'Transparent sustainability notes on every listing',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-primary-500 mt-0.5 flex-shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50 bg-leaf-pattern">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title mb-3">Our Core Values</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Everything we build is guided by these principles.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map((v, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{v.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title mb-3">Technology Stack</h2>
            <p className="text-gray-500">Built with modern, scalable technologies</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Technology</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Purpose</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { cat: 'Frontend', tech: 'React.js + TailwindCSS', purpose: 'Dynamic UI, responsive design, utility-first styling', icon: '⚛️' },
                  { cat: 'Backend', tech: 'Node.js + Express.js', purpose: 'RESTful API, server logic, middleware', icon: '🟢' },
                  { cat: 'Database', tech: 'MongoDB + Mongoose', purpose: 'Flexible, scalable NoSQL data storage', icon: '🍃' },
                  { cat: 'Security', tech: 'JWT Authentication', purpose: 'Secure user sessions and protected routes', icon: '🔒' },
                  { cat: 'Design', tech: 'Figma', purpose: 'UI prototyping and design system', icon: '🎨' },
                  { cat: 'Deployment', tech: 'Vercel + GitHub', purpose: 'CI/CD, version control, cloud hosting', icon: '🚀' },
                  { cat: 'Methodology', tech: 'Agile + Kanban', purpose: 'Iterative development with visual task tracking', icon: '📋' },
                ].map((row, i) => (
                  <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}>
                    <td className="py-3 px-4 font-medium text-gray-700 text-sm">{row.icon} {row.cat}</td>
                    <td className="py-3 px-4 text-primary-600 font-semibold text-sm">{row.tech}</td>
                    <td className="py-3 px-4 text-gray-500 text-sm">{row.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Development Timeline */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title mb-3">Development Journey</h2>
            <p className="text-gray-500">Agile development phases following Kanban workflow</p>
          </div>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-6">
              {milestones.map((m, i) => (
                <div key={i} className="relative flex gap-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 z-10 ${m.done ? 'bg-primary-500' : 'bg-gray-200'}`}>
                    {m.icon}
                  </div>
                  <div className={`bg-white rounded-2xl p-5 flex-1 border-l-4 ${m.done ? 'border-primary-500' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900">{m.phase}</h3>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m.done ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'}`}>
                        {m.done ? 'Complete' : 'In Progress'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="section-title mb-3">The Team</h2>
          <p className="text-gray-500 mb-10">The people behind Green Products</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            {team.map((member, i) => (
              <div key={i} className="bg-gray-50 rounded-3xl p-8 flex-1">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-eco-leaf rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4">
                  {member.emoji}
                </div>
                <h3 className="font-display font-bold text-gray-900 text-xl mb-1">{member.name}</h3>
                <p className="text-primary-600 font-medium text-sm mb-2">{member.role}</p>
                {member.id && <p className="text-gray-400 text-xs font-mono">{member.id}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-eco-dark to-eco-leaf text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-6xl mb-4">🌍</div>
          <h2 className="font-display text-4xl font-bold mb-4">Ready to Shop Sustainably?</h2>
          <p className="text-white/70 text-lg mb-8">Join thousands of eco-conscious consumers making a difference every day.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/products" className="bg-white text-eco-leaf font-bold px-8 py-4 rounded-2xl hover:bg-primary-50 transition-all shadow-lg">
              Explore Products 🌿
            </Link>
            <Link to="/register" className="border-2 border-white/50 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/10 transition-all">
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
