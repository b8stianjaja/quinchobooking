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

// CRÍTICO: Permite que Express confíe en los encabezados de proxy (Render) para HTTPS,
// lo que es necesario para que la cookie sea marcada como Secure.
app.set('trust proxy', 1);

// --- Middlewares de Configuración y Seguridad ---
app.use(
  // Desactivamos headers no esenciales para APIs REST.
  helmet({ contentSecurityPolicy: false, xXssProtection: false })
); 
app.use(express.json()); 
app.use(morgan('dev'));

// --- Configuración de CORS ---
const allowedOrigins = ['http://localhost:5173']; 
const frontendUrl = process.env.FRONTEND_URL;

if (frontendUrl) {
    allowedOrigins.push(frontendUrl);
    allowedOrigins.push(frontendUrl.replace('www.', ''));
    allowedOrigins.push(frontendUrl.replace('https://', 'https://www'));
}

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Origen no permitido por CORS'));
        }
    },
    credentials: true 
}));

// --- Rate Limiter ---
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo en 15 minutos.'
});
app.use('/api/', apiLimiter);

// --- Middleware para forzar NO CACHE ---
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});


// --- Configuración de Sesiones (FIX CRÍTICO) ---
const IS_DEPLOYED_ENV = process.env.NODE_ENV === 'production' || !!process.env.FRONTEND_URL;

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
        // CRÍTICO 1: Debe ser TRUE (Secure) porque SameSite=None lo requiere, y Render usa HTTPS.
        secure: IS_DEPLOYED_ENV, 
        httpOnly: true, 
        maxAge: 24 * 60 * 60 * 1000, 
        // CRÍTICO 2: Debe ser 'none' para cookies cross-site. 
        sameSite: IS_DEPLOYED_ENV ? 'none' : 'lax', 
    }
}));


// --- Rutas de la API ---
app.use('/api', bookingRoutes);

// --- Manejador de Errores ---
app.use(errorHandler);

module.exports = app;