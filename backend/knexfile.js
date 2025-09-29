require('dotenv').config({ path: './.env' });

module.exports = {
  development: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      // This SSL configuration is required to connect to Render from your local machine
      ssl: { rejectUnauthorized: false },
    },
    migrations: {
      directory: './src/db/migrations',
      tableName: 'knex_migrations',
    },
  },
};