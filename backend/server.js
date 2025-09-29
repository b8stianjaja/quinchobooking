// In backend/server.js

const app = require('./src/app');
const { ensureDefaultAdmin } = require('./src/models/adminModel'); // <-- Import added here

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    // Migrations are now run manually.
    // We still ensure the default admin user exists after the tables are created.
    await ensureDefaultAdmin();

    // Start the Express server
    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start the server:', error);
    process.exit(1);
  }
};

startServer();