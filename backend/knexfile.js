// Only load .env file in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: './.env' });
}

module.exports = {
  development: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      // This SSL configuration may be needed for local development against a cloud DB
      // For Fly.io, the DATABASE_URL it provides handles this automatically.
      ssl: { rejectUnauthorized: false },
    },
    migrations: {
      directory: './src/db/migrations',
      tableName: 'knex_migrations',
    },
  },
  // Add a production configuration
  production: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // Fly.io's internal network doesn't require SSL, but this is a safe setting.
    },
    migrations: {
      directory: './src/db/migrations',
      tableName: 'knex_migrations',
    },
  },
};