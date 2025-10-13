// quincho-booking-backend/src/app.js
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const pgSession = require('connect-pg-simple')(session);

const { pool } = require('./config/db');
const bookingRoutes = require('./routes/bookingRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// This is CRITICAL for Render. It tells Express to trust the proxy.
app.set('trust proxy', 1);

// --- START OF THE FIX ---
// This new logic robustly handles both www and naked domains.
const allowedOrigins = ['http://localhost:5173'];
const frontendUrl = process.env.FRONTEND_URL;

if (frontendUrl) {
    if (frontendUrl.startsWith('https://www.')) {
        // If the URL has 'www', add both versions to the allowed list.
        allowedOrigins.push(frontendUrl); // e.g., https://www.quinchoelruco.com
        allowedOrigins.push(frontendUrl.replace('www.', '')); // e.g., https://quinchoelruco.com
    } else {
        // If the URL does not have 'www', add both versions.
        allowedOrigins.push(frontendUrl); // e.g., https://quinchoelruco.com
        allowedOrigins.push(frontendUrl.replace('https://', 'https://www.')); // e.g., https://www.quinchoelruco.com
    }
}
// --- END OF THE FIX ---

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
};

app.use(cors(corsOptions));

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter);

// --- START: FIX FOR COOKIE DOMAIN ---
// Logic to determine the root domain for the cookie
let cookieDomain;
if (process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL) {
  try {
    const url = new URL(process.env.FRONTEND_URL);
    // This will get 'quinchoelruco.com' from 'www.quinchoelruco.com'
    cookieDomain = url.hostname.replace(/^www\./, '');
  } catch (e) {
    console.error('Invalid FRONTEND_URL for cookie domain:', e);
  }
}
// --- END: FIX FOR COOKIE DOMAIN ---

app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'sessions'
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        proxy: true,
        // This makes the cookie available to the root domain and all its subdomains
        domain: cookieDomain
    }
}));

app.use('/api', bookingRoutes);

app.use(errorHandler);

module.exports = app;