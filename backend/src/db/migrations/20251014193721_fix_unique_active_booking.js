/**
 * Nombre del Archivo: YYYYMMDDHHMMSS_fix_unique_active_booking.js
 * Propósito: Eliminar la restricción única amplia de la tabla 'bookings' y crear un 
 * índice único PARCIAL que solo se aplica a las reservas activas ('confirmed' o 'pending').
 * * Corrección de Error (42P07): Se añade un DROP INDEX inicial para asegurar la idempotencia 
 * en caso de que la migración falle a mitad del registro en Knex.
 * * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  // === INICIO DE LA CORRECCIÓN DE IDEMPOTENCIA (Anti-error 42P07) ===
  // 1. Forzamos la eliminación del índice parcial por si existe de un intento fallido.
  console.log('[MIGRATION - UP] 1/3: Asegurando idempotencia: Eliminando índice parcial previo (si existe)...');
  return knex.schema.raw('DROP INDEX IF EXISTS unique_active_booking_idx;')
  // === FIN DE LA CORRECCIÓN DE IDEMPOTENCIA ===

  .then(() => {
    // 2. Eliminar la restricción única original (GENERAL)
    console.log('[MIGRATION - UP] 2/3: Eliminando la restricción única original en bookings...');
    
    // Esto evita conflictos con el índice parcial que vamos a crear.
    return knex.schema.raw(`
      ALTER TABLE bookings 
      DROP CONSTRAINT IF EXISTS bookings_booking_date_slot_type_unique;
    `);
  })
  .then(() => {
    // 3. Crear el nuevo índice único parcial (CONDICIONAL)
    // El índice solo se aplica a las filas con status 'confirmed' o 'pending'.
    console.log('[MIGRATION - UP] 3/3: Creando índice único PARCIAL para reservas activas...');
    return knex.schema.raw(`
      CREATE UNIQUE INDEX unique_active_booking_idx 
      ON bookings (booking_date, slot_type) 
      WHERE status = 'confirmed' OR status = 'pending';
    `);
  })
  .then(() => {
      console.log('[MIGRATION - UP] Migración completada exitosamente.');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  // En el rollback, simplemente eliminamos el índice que creamos.
  console.log('[MIGRATION - DOWN] Rollback: Eliminando índice único parcial...');
  return knex.schema.raw('DROP INDEX IF EXISTS unique_active_booking_idx;')
    .then(() => {
        console.log('[MIGRATION - DOWN] Rollback completado. NOTA: La restricción defectuosa anterior no fue restaurada.');
    });
};
