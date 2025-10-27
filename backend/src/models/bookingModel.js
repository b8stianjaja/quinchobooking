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


// --- getAllBookings Modificado para incluir filtros ---
const getAllBookings = async (searchTerm = '', statusFilter = 'all') => {
  let query = 'SELECT * FROM bookings';
  const values = [];
  let conditions = []; // Para almacenar las condiciones WHERE

  // Condición para searchTerm
  if (searchTerm && searchTerm.trim() !== '') {
    // Usamos ILIKE para búsqueda insensible a mayúsculas/minúsculas y '%' para coincidencias parciales
    conditions.push(`(name ILIKE $${values.length + 1} OR phone ILIKE $${values.length + 1} OR notes ILIKE $${values.length + 1})`);
    values.push(`%${searchTerm.trim()}%`); // Añadir comodines al valor
  }

  // Condición para statusFilter (ignorar si es 'all')
  if (statusFilter && statusFilter !== 'all' && ['pending', 'confirmed', 'cancelled'].includes(statusFilter)) {
    conditions.push(`status = $${values.length + 1}`);
    values.push(statusFilter);
  }

  // Unir condiciones con AND si hay más de una
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY created_at DESC'; // Mantener el orden

  try {
    const { rows } = await pool.query(query, values);
    return rows;
  } catch(error) {
      console.error("Error fetching bookings in model:", error);
      throw error; // Re-lanzar para que el controlador lo maneje
  }
};
// --------------------------------------------------

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