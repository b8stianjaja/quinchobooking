// backend/src/models/bookingModel.js

const { pool } = require('../config/db');

const createBooking = async (bookingData) => {
  // Se elimina 'email' de la destructuración
  const { name, phone, booking_date, slot_type, guest_count, notes } =
    bookingData;
  // Se elimina 'email' de la query y '$2' de los valores
  const query = `
        INSERT INTO bookings (name, phone, booking_date, slot_type, guest_count, notes)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `;
  // Se reajustan los índices de los valores
  const values = [
    name,
    phone,
    booking_date,
    slot_type,
    guest_count,
    notes,
  ];
  try {
      const { rows } = await pool.query(query, values);
      return rows[0];
  } catch(error) {
      console.error("Error creating booking in model:", error);
      // Re-lanzar el error para que el controlador lo maneje
      throw error;
  }
};

const getAllBookings = async () => {
  // Selecciona todas las columnas existentes, incluyendo guest_count
  const { rows } = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC');
  return rows;
};

const updateBookingStatus = async (id, status) => {
    try {
        const { rows } = await pool.query(
            'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );
        // Si no se actualizó ninguna fila, rows[0] será undefined
        return rows[0];
    } catch(error) {
        console.error("Error updating booking status in model:", error);
        throw error;
    }
};

const deleteBooking = async (id) => {
    try {
        // Podrías verificar cuántas filas fueron eliminadas si necesitas confirmación
        await pool.query('DELETE FROM bookings WHERE id = $1', [id]);
    } catch(error) {
        console.error("Error deleting booking in model:", error);
        throw error;
    }
};

module.exports = {
  createBooking,
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
};