/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  // 1. Deshabilitar la restricción única original y general
  console.log('[Migration] Eliminando la restricción única original en bookings...');
  return knex.schema.table('bookings', function (table) {
    // Esto intenta eliminar la restricción única combinada de la migración inicial.
    // Si falla por un nombre de índice diferente, deberá eliminarse manualmente el índice SQL.
    table.dropUnique(['booking_date', 'slot_type']); 
  })
  .then(() => {
    // 2. Crear el nuevo índice único parcial (Conditional Unique Index)
    // Esto SÓLO aplica la unicidad si el campo 'status' es 'confirmed' o 'pending'.
    console.log('[Migration] Creando nuevo índice único parcial para reservas activas...');
    return knex.schema.raw(`
      CREATE UNIQUE INDEX unique_active_booking_idx 
      ON bookings (booking_date, slot_type) 
      WHERE status = 'confirmed' OR status = 'pending';
    `);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  // Para un rollback, primero eliminamos el nuevo índice parcial.
  console.log('[Migration] Eliminando el índice único parcial...');
  return knex.schema.raw('DROP INDEX IF EXISTS unique_active_booking_idx;')
    .then(() => {
        // Luego, si es necesario, restauramos la restricción original (aunque era el problema)
        // La restauración se incluye por si se desea hacer rollback a la versión anterior del código.
        console.log('[Migration] Restaurando la restricción única general (¡PRECAUCIÓN!)');
        return knex.schema.table('bookings', function (table) {
            table.unique(['booking_date', 'slot_type']);
        });
    });
};
