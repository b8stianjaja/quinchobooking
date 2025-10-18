// Contenido para los archivos de migración .js faltantes

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Este archivo existe solo para satisfacer a Knex.
  // La base de datos ya tiene esta migración registrada. No hacer nada.
  console.log('Faltaba el archivo de migración, pero la base de datos ya lo tiene. Omitiendo.');
  return Promise.resolve();
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // No hacer nada.
  console.log('Faltaba el archivo de migración (down). Omitiendo.');
  return Promise.resolve();
};