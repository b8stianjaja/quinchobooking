const { pool } = require('../config/db');

/**
 * This is a robust version of the function to prevent 500 errors.
 * It uses safe date calculations and a standard SQL query.
 */
const getAvailableSlotsForMonth = async (year, month) => {
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    throw new Error('Invalid year or month provided.');
  }

  // Use a reliable method to get the first and last day of the target month.
  // The 'month - 1' is because the JavaScript Date constructor is 0-indexed (0=Jan, 1=Feb, etc.)
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  try {
    const query = `
      SELECT 
        to_char(booking_date, 'YYYY-MM-DD') as date,
        slot_type
      FROM bookings
      WHERE 
        booking_date BETWEEN $1 AND $2
        AND status = 'confirmed';
    `;
    
    const { rows } = await pool.query(query, [startDate, endDate]);
    
    const availabilityMap = {};
    rows.forEach(row => {
      if (!availabilityMap[row.date]) {
        availabilityMap[row.date] = { isDaySlotAvailable: true, isNightSlotAvailable: true };
      }
      if (row.slot_type === 'day') {
        availabilityMap[row.date].isDaySlotAvailable = false;
      }
      if (row.slot_type === 'night') {
        availabilityMap[row.date].isNightSlotAvailable = false;
      }
    });

    // Convert the map to the array format the frontend expects.
    return Object.entries(availabilityMap).map(([date, slots]) => ({
      date,
      ...slots
    }));

  } catch (error) {
    console.error('Error fetching booked slots from bookings table:', error);
    // This custom error message will be shown on the frontend.
    throw new Error('Failed to retrieve availability from the database.');
  }
};

module.exports = { getAvailableSlotsForMonth };