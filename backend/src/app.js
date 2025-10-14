// backend/src/app.js
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const morgan = require('morgan'); // Recomendado: Logger para debugging en producción.
const helmet = require('helmet'); // Recomendado: Middleware de seguridad esencial.
const rateLimit = require('express-rate-limit');
const pgSession = require('connect-pg-simple')(session);

const { pool } = require('./config/db');
const bookingRoutes = require('./routes/bookingRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware esencial para que Express confíe en los encabezados de proxy de Render.
app.set('trust proxy', 1);

// --- Middlewares de Configuración y Seguridad ---

// 1. Seguridad (Helmet): protege contra vulnerabilidades web conocidas.
// Configurado para desactivar headers no esenciales para APIs (Webhint Advisory fix).
app.use(
  helmet({
    contentSecurityPolicy: false,
    xXssProtection: false,
  })
);
app.use(express.json()); // 2. Parser: permite a tu app entender peticiones con JSON.
app.use(morgan('dev')); // 3. Logger: Muestra las peticiones en la consola (muy útil en logs de Render).

// --- Configuración de CORS (Cross-Origin Resource Sharing) ---
// Define qué dominios de frontend tienen permiso para comunicarse con este backend.
const allowedOrigins = ['http://localhost:5173']; // Origen para desarrollo local
const frontendUrl = process.env.FRONTEND_URL;

// Determina si estamos en un entorno de despliegue (producción o staging)
const isProduction =
  process.env.NODE_ENV === 'production' || !!process.env.FRONTEND_URL;

if (frontendUrl) {
  allowedOrigins.push(frontendUrl);
  // Añade la versión con y sin 'www' por si acaso.
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
    credentials: true, // ¡Crítico para que las cookies de sesión funcionen!
  })
);

// --- Rate Limiter ---
// Protege tus rutas contra un exceso de peticiones (ataques de fuerza bruta).
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limita cada IP a 100 peticiones por ventana de 15 min.
  standardHeaders: true,
  legacyHeaders: false,
  message:
    'Demasiadas peticiones desde esta IP, por favor intente de nuevo en 15 minutos.',
});
app.use('/api/', apiLimiter);

// --- Middleware para asegurar que las respuestas de la API no se cacheen (Cache-Control fix) ---
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// --- Configuración de Sesiones ---
// Se usa la base de datos para almacenar sesiones.
app.use(
  session({
    name: 'quincho-booking.sid',
    store: new pgSession({
      pool: pool,
      tableName: 'sessions',
    }),
    secret: process.env.SESSION_SECRET, // ¡Debe ser una variable de entorno!
    resave: false,
    saveUninitialized: false,
    cookie: {
      // FIX: Configuraciones de seguridad críticas para cookies entre dominios (Webhint fix)
      // En producción, SÓLO se envía por HTTPS y con SameSite=None
      secure: isProduction,
      httpOnly: true, // Previene que el JavaScript del cliente acceda a la cookie.
      maxAge: 24 * 60 * 60 * 1000, // 1 día de duración.
      sameSite: isProduction ? 'none' : 'lax', // Requerido para cookies entre dominios.
    },
  })
);

// --- Rutas de la API ---
app.use('/api', bookingRoutes);

// --- Manejador de Errores ---
// Este es el último middleware. Atrapa cualquier error que ocurra en las rutas.
app.use(errorHandler);

module.exports = app;
