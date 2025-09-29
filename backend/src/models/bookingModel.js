// backend/src/models/bookingModel.js

const { pool } = require('../config/db');

const createBooking = async (bookingData) => {
  const { name, email, phone, booking_date, slot_type, guest_count, notes } =
    bookingData;
  const query = `
        INSERT INTO bookings (name, email, phone, booking_date, slot_type, guest_count, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
    `;
  const values = [
    name,
    email,
    phone,
    booking_date,
    slot_type,
    guest_count,
    notes,
  ];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const getAllBookings = async () => {
  const { rows } = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC');
  return rows;
};

const updateBookingStatus = async (id, status) => {
  const { rows } = await pool.query(
    'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
    [status, id]
  );
  return rows[0];
};

const deleteBooking = async (id) => {
  await pool.query('DELETE FROM bookings WHERE id = $1', [id]);
};

module.exports = {
  createBooking,
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
};