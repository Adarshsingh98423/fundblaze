require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit  = require('express-rate-limit');

const authRoutes         = require('./routes/auth.routes');
const campaignRoutes     = require('./routes/campaign.routes');
const donationRoutes     = require('./routes/donation.routes');
const userRoutes         = require('./routes/user.routes');
const notificationRoutes = require('./routes/notification.routes');
const paymentRoutes      = require('./routes/payment.routes');
const { errorHandler }   = require('./middlewares/error.middleware');

const app = express();

// ── Security ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

// ── Rate limiting ────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({ windowMs: 15*60*1000, max: 300,
  message: { success:false, message:'Too many requests, try again later.' }});
const authLimiter   = rateLimit({ windowMs: 15*60*1000, max: 20,
  message: { success:false, message:'Too many auth attempts, try again later.' }});
app.use('/api', globalLimiter);
app.use('/api/v1/auth/login',  authLimiter);
app.use('/api/v1/auth/signup', authLimiter);

// ── Body parsers ─────────────────────────────────────────────────────────────
// Stripe webhook needs raw body BEFORE json() middleware
app.use('/api/v1/payments/stripe/webhook', express.raw({ type:'application/json' }));
app.use(express.json({ limit:'10mb' }));
app.use(express.urlencoded({ extended:true }));
app.use(cookieParser());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/v1/auth',          authRoutes);
app.use('/api/v1/campaigns',     campaignRoutes);
app.use('/api/v1/donations',     donationRoutes);
app.use('/api/v1/users',         userRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/payments',      paymentRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) =>
  res.json({ success:true, message:'FundBlaze API is running 🔥', ts: new Date() }));

// ── 404 ────────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success:false, message:'Route not found' }));

// ── Global error handler ───────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
