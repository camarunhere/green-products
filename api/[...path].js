// Vercel catch-all serverless function — handles ALL /api/* requests
// Vercel file-based routing ensures Express receives the original request URL
module.exports = require('../backend/server');
