/**
 * Nombre del Archivo: YYYYMMDDHHMMSS_fix_unique_active_booking.js
 * Propósito: Eliminar la restricción única amplia de la tabla 'bookings' y crear un 
 * índice único PARCIAL que solo se aplica a las reservas activas ('confirmed' o 'pending').
 * Esto permite re-reservar cupos previamente cancelados.
 * * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  // 1. Eliminar la restricción única original (GENERAL)
  console.log('[MIGRATION - UP] 1/2: Eliminando la restricción única original en bookings...');
  
  // Usamos SQL nativo para eliminar la restricción por su nombre generado por Knex.
  // Usar IF EXISTS previene que falle si ya se eliminó previamente.
  return knex.schema.raw(`
    ALTER TABLE bookings 
    DROP CONSTRAINT IF EXISTS bookings_booking_date_slot_type_unique;
  `)
  .then(() => {
    // 2. Crear el nuevo índice único parcial (CONDICIONAL)
    // ESTA es la corrección de seguridad: la unicidad SÓLO aplica a reservas activas.
    console.log('[MIGRATION - UP] 2/2: Creando índice único PARCIAL para reservas activas...');
    return knex.schema.raw(`
      CREATE UNIQUE INDEX unique_active_booking_idx 
      ON bookings (booking_date, slot_type) 
      WHERE status = 'confirmed' OR status = 'pending';
    `);
  })
  .then(() => {
      console.log('[MIGRATION - UP] Migración completada exitosamente. El calendario ahora permite re-reservar cupos cancelados.');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  // Lógica para deshacer la migración (rollback)
  console.log('[MIGRATION - DOWN] Rollback: Eliminando índice único parcial...');

  // Eliminamos el índice creado en el paso UP.
  // Es la acción más segura, ya que restaurar la restricción original causaría el problema de nuevo.
  return knex.schema.raw('DROP INDEX IF EXISTS unique_active_booking_idx;')
    .then(() => {
        console.log('[MIGRATION - DOWN] Rollback completado. NOTA: La restricción defectuosa anterior no fue restaurada.');
    });
};
