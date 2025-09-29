const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const API_URL = `${API_BASE_URL}/api`;

// FIX: Implemented getBookedSlots to fetch data from the backend.
export const getBookedSlots = async (year, month) => {
  try {
    const response = await fetch(
      `${API_URL}/availability?year=${year}&month=${month}`
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching booked slots:', error);
    throw error; // Re-throw the error so the calling component can handle it
  }
};

export const submitBooking = async (bookingData) => {
  const response = await fetch(`${API_URL}/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to submit booking');
  return data;
};
