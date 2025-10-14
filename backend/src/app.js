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

// Confiar en los encabezados de proxy de plataformas como Render. Es crucial.
app.set('trust proxy', 1);

// --- Middlewares de Configuración y Seguridad ---
app.use(
  helmet({
    contentSecurityPolicy: false,
    xXssProtection: false,
  })
);
app.use(express.json());
app.use(morgan('dev'));

// --- Configuración de CORS ---
const allowedOrigins = ['http://localhost:5173'];
const frontendUrl = process.env.FRONTEND_URL;
const isProduction = process.env.NODE_ENV === 'production' || !!frontendUrl;

if (frontendUrl) {
  allowedOrigins.push(frontendUrl);
  if (frontendUrl.includes('www.')) {
    allowedOrigins.push(frontendUrl.replace('www.', ''));
  } else {
    allowedOrigins.push(frontendUrl.replace('https://', 'https://www.'));
  }
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Origen no permitido por CORS'));
      }
    },
    credentials: true,
  })
);

// --- Rate Limiter ---
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message:
    'Demasiadas peticiones desde esta IP, por favor intente de nuevo en 15 minutos.',
});
app.use('/api/', apiLimiter);

// --- Middleware anti-cache para la API ---
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// --- Configuración de Sesiones Definitiva ---
// Al no especificar un 'domain', el navegador lo asignará automáticamente
// al dominio del backend, que es el comportamiento correcto y seguro.
app.use(
  session({
    name: 'quincho-booking.sid',
    store: new pgSession({
      pool: pool,
      tableName: 'sessions',
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 día
      sameSite: isProduction ? 'none' : 'lax',
      // La propiedad 'domain' se ha eliminado intencionadamente para cumplir
      // con las políticas de seguridad de los navegadores sobre sufijos públicos.
    },
  })
);

// --- Rutas de la API ---
app.use('/api', bookingRoutes);

// --- Manejador de Errores ---
app.use(errorHandler);

module.exports = app;