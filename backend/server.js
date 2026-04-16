const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

const app = express();

// ── CORS ─────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      origin.startsWith('http://localhost') ||
      origin.endsWith('.vercel.app') ||
      (process.env.CLIENT_URL && origin === process.env.CLIENT_URL)
    ) {
      return callback(null, true);
    }
    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ── PING — no DB needed, confirms function is invoked ────────────
// Test this first: https://your-app.vercel.app/api/ping
app.get('/api/ping', (req, res) => {
  res.json({
    ok: true,
    env: process.env.NODE_ENV || 'not set',
    mongoUriSet: !!process.env.MONGODB_URI,
    jwtSecretSet: !!process.env.JWT_SECRET,
    nodeVersion: process.version,
  });
});

// ── DB middleware — runs before every API route ──────────────────
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    const isUriMissing = err.message.includes('MONGODB_URI');
    res.status(500).json({
      message: isUriMissing
        ? 'MONGODB_URI is not set in environment variables'
        : `Database connection failed: ${err.message}`,
    });
  }
});

// ── Routes ───────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

if (process.env.NODE_ENV !== 'production') {
  const uploadRoutes = require('./routes/upload');
  app.use('/api/upload', uploadRoutes);
}

// ── Health — requires DB (use /api/ping if DB is down) ───────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    env: process.env.NODE_ENV,
    mongoUriSet: !!process.env.MONGODB_URI,
    mongoState: require('mongoose').connection.readyState,
  });
});

// ── 404 & error handlers ─────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.url}` });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

// ── Local dev only ───────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`\n Green Products API running on http://localhost:${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });
}

module.exports = app;
