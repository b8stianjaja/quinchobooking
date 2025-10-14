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

// --- LÓGICA DE COOKIE CENTRALIZADA Y CORREGIDA ---

// 1. Definir la configuración base de la cookie.
const cookieConfig = {
  secure: isProduction,
  httpOnly: true,
  maxAge: 24 * 60 * 60 * 1000, // 1 día
  sameSite: isProduction ? 'none' : 'lax',
};

// 2. Dinámicamente añadir el dominio principal si estamos en producción.
//    Esta es la lógica robusta que extrajimos del logout y ahora aplicamos aquí.
if (isProduction && frontendUrl) {
  try {
    const url = new URL(frontendUrl);
    // Extrae el dominio principal (ej. onrender.com) del subdominio completo.
    const hostnameParts = url.hostname.split('.');
    if (hostnameParts.length >= 2) {
      const rootDomain = hostnameParts.slice(-2).join('.');
      // Le anteponemos un punto para que sea válida para TODOS los subdominios.
      cookieConfig.domain = `.${rootDomain}`;
      console.log(`[Cookie Auth] Dominio de cookie configurado para: ${cookieConfig.domain}`);
    }
  } catch (e) {
    console.error('[Error Crítico] No se pudo parsear el FRONTEND_URL para configurar el dominio de la cookie:', e);
  }
}

// 3. Usar la configuración de cookie generada en el middleware de sesión.
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
    cookie: cookieConfig, // Usamos la configuración dinámica y consistente
  })
);

// --- Rutas de la API ---
app.use('/api', bookingRoutes);

// --- Manejador de Errores ---
app.use(errorHandler);

module.exports = app;