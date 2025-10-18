/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  console.log('[MIGRATION - UP] Removing email column from bookings table...');
  return knex.schema.table('bookings', function(table) {
    // Elimina la columna 'email'
    table.dropColumn('email');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  console.log('[MIGRATION - DOWN] Re-adding email column to bookings table...');
  return knex.schema.table('bookings', function(table) {
    // Vuelve a añadir la columna 'email' si necesitas revertir la migración
    // Ajusta el tipo de dato si era diferente, y considera si debe ser nullable
    table.string('email', 255).nullable(); // O .notNullable() si era requerido antes
  });
};