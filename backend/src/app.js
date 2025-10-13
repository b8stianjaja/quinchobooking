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

// This is CRITICAL for Render. It tells Express to trust the proxy that Render
// places in front of your service. Without this, secure cookies will fail.
app.set('trust proxy', 1);

const allowedOrigins = ['http://localhost:5173'];
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
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

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter);

app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'sessions'
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        // In production, 'secure' must be true. The 'trust proxy' setting
        // allows this to work correctly even though the final connection
        // inside Render's network is not HTTPS.
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        // 'none' is required for cross-site cookies. 'secure' must be true for this to work.
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        // We add 'proxy: true' to ensure the 'secure' setting is respected
        // behind Render's proxy. This is the main fix.
        proxy: true
    }
}));

app.use('/api', bookingRoutes);

app.use(errorHandler);

module.exports = app;
