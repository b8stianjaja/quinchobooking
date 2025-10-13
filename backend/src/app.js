// quincho-booking-backend/src/app.js
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const morgan = require('morgan');
const helmet = require('helmet');
// --- FIX: This line has been corrected ---
const rateLimit = require('express-rate-limit');
const pgSession = require('connect-pg-simple')(session);

const { pool } = require('./config/db');
const bookingRoutes = require('./routes/bookingRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// This is CRITICAL for Render. It tells Express to trust the proxy.
app.set('trust proxy', 1);

const allowedOrigins = ['http://localhost:5173'];
const frontendUrl = process.env.FRONTEND_URL;

if (frontendUrl) {
    try {
        const url = new URL(frontendUrl);
        const hostname = url.hostname; // e.g., "www.quinchoelruco.com"
        const baseHostname = hostname.replace(/^www\./, ''); // e.g., "quinchoelruco.com"

        // Allow the exact URL, the URL without 'www', and the URL with 'www'
        allowedOrigins.push(`https://${baseHostname}`);
        allowedOrigins.push(`https://www.${baseHostname}`);
    } catch (e) {
        console.error("Invalid FRONTEND_URL provided:", e);
    }
}

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.error(`CORS error: Origin ${origin} not allowed.`);
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

let cookieDomain;
if (process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL) {
  try {
    const url = new URL(process.env.FRONTEND_URL);
    // This creates a domain like '.quinchoelruco.com', which is valid for 'www.quinchoelruco.com' and the root domain.
    cookieDomain = '.' + url.hostname.replace(/^www\./, '');
  } catch (e) {
    console.error('Invalid FRONTEND_URL for cookie domain:', e);
  }
}

app.use(session({
    // Use a unique name for the session cookie
    name: 'quincho-booking.sid',
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
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        // Explicitly set the domain for the cookie.
        domain: cookieDomain
    }
}));


app.use('/api', bookingRoutes);

app.use(errorHandler);

module.exports = app;