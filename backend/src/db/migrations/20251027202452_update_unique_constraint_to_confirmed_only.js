/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  console.log('[MIGRATION - UP] Updating unique constraint to only check for CONFIRMED bookings...');
  // 1. Eliminar el índice parcial anterior (que incluía 'pending' y 'confirmed')
  return knex.schema.raw('DROP INDEX IF EXISTS unique_active_booking_idx;')
    .then(() => {
      // 2. Crear el nuevo índice único parcial (solo para 'confirmed')
      console.log('[MIGRATION - UP] Creating new unique index for CONFIRMED bookings only...');
      return knex.schema.raw(`
        CREATE UNIQUE INDEX unique_confirmed_booking_idx
        ON bookings (booking_date, slot_type)
        WHERE status = 'confirmed';
      `);
    })
    .then(() => {
        console.log('[MIGRATION - UP] Unique constraint updated successfully.');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  console.log('[MIGRATION - DOWN] Rolling back unique constraint changes...');
  // 1. Eliminar el nuevo índice (solo 'confirmed')
  return knex.schema.raw('DROP INDEX IF EXISTS unique_confirmed_booking_idx;')
    .then(() => {
      // 2. Volver a crear el índice anterior (que incluía 'pending' y 'confirmed')
      //    Esto es necesario para que el rollback devuelva la base de datos
      //    al estado que esperaba el código anterior.
      console.log('[MIGRATION - DOWN] Recreating previous unique index for PENDING or CONFIRMED bookings...');
      return knex.schema.raw(`
        CREATE UNIQUE INDEX unique_active_booking_idx
        ON bookings (booking_date, slot_type)
        WHERE status = 'confirmed' OR status = 'pending';
      `);
    })
     .then(() => {
        console.log('[MIGRATION - DOWN] Rollback completed.');
    });
};