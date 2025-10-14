// backend/server.js
const app = require('./src/app');
const { ensureDefaultAdmin } = require('./src/models/adminModel');
const knex = require('knex');
const knexfile = require('./knexfile'); // Tu archivo de configuración de Knex

const PORT = process.env.PORT || 3001;

// Determina si estamos en 'production' (en Render) o 'development' (local)
const environment = process.env.NODE_ENV || 'development';
const dbConfig = knexfile[environment];

const startServer = async () => {
  try {
    // 1. Conectar a la base de datos y ejecutar migraciones pendientes.
    console.log(`[Server] Running in ${environment} mode.`);
    console.log('[DB] Initializing and running migrations...');
    const db = knex(dbConfig);
    await db.migrate.latest(); // Esto aplica las migraciones que falten.
    console.log('[DB] Migrations completed successfully.');

    // 2. Asegurar que el usuario administrador exista (lo crea si no está).
    await ensureDefaultAdmin();

    // 3. Iniciar el servidor Express para aceptar peticiones.
    app.listen(PORT, () => {
      console.log(`[Server] Backend server is running and listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('[Server Startup Error] Failed to start the server:', error);
    process.exit(1); // Detiene el proceso si hay un error crítico al iniciar.
  }
};

startServer();