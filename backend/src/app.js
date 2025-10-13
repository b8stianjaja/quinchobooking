// backend/src/app.js
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

app.set('trust proxy', 1);

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

const allowedOrigins = ['http://localhost:5173'];
const frontendUrl = process.env.FRONTEND_URL;

if (frontendUrl) {
    if (frontendUrl.startsWith('https://www.')) {
        allowedOrigins.push(frontendUrl);
        allowedOrigins.push(frontendUrl.replace('www.', ''));
    } else {
        allowedOrigins.push(frontendUrl);
        allowedOrigins.push(frontendUrl.replace('https://', 'https://www.'));
    }
}

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
};
app.use(cors(corsOptions));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

let cookieDomain;
if (process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL) {
  try {
    const url = new URL(process.env.FRONTEND_URL);
    cookieDomain = '.' + url.hostname.replace(/^www\./, '');
  } catch (e) {
    console.error('Invalid FRONTEND_URL for cookie domain:', e);
  }
}

app.use(session({
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
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        domain: cookieDomain
    }
}));

app.use('/api', bookingRoutes);
app.use(errorHandler);

module.exports = app;