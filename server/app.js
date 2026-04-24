// Express app setup
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security headers
app.use(helmet());

// CORS — allow frontend origin
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting — 100 requests per 15 minutes per IP
// EDGE CASE: rate limit applies globally, not per-route — auth endpoints not separately limited
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests. Please try again later.' },
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/investigations', require('./routes/investigationRoutes'));
app.use('/api/datasets', require('./routes/datasetRoutes'));
app.use('/api/activity', require('./routes/activityRoutes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Route not found.' }));

// Global error handler
app.use(errorHandler);

module.exports = app;
