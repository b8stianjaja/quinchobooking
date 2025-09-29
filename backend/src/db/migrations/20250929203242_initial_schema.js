/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('bookings', function (table) {
      table.increments('id').primary();
      table.string('name', 255).notNullable();
      table.string('email', 255).notNullable();
      table.string('phone', 50);
      table.date('booking_date').notNullable();
      table.string('slot_type', 10).notNullable();
      table.integer('guest_count');
      table.text('notes');
      table.string('status', 20).defaultTo('pending');
      table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
      table.unique(['booking_date', 'slot_type']);
    })
    .createTable('admins', function (table) {
      table.increments('id').primary();
      table.string('username', 255).notNullable().unique();
      table.string('password_hash', 255).notNullable();
      table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    })
    .createTable('sessions', function (table) {
      table.string('sid').notNullable().primary();
      table.json('sess').notNullable();
      table.timestamp('expire', { useTz: true }).notNullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('sessions')
    .dropTableIfExists('admins')
    .dropTableIfExists('bookings');
};