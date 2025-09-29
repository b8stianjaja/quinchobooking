// quincho-booking-backend/src/app.js
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const pgSession = require('connect-pg-simple')(session);

const { pool } = require('./config/db'); // db module
const bookingRoutes = require('./routes/bookingRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

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

// This line is important for Render to trust the proxy and secure cookies.
app.set('trust proxy', 1);

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
        secure: process.env.NODE_ENV === 'production', // Will be true on Render
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        // ** THE FIX IS HERE **
        // This setting allows the cookie to be sent from your frontend's domain.
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));

app.use('/api', bookingRoutes);

app.use(errorHandler);

module.exports = app;