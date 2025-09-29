const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const API_URL = `${API_BASE_URL}/api`;

// Use a credentials helper to handle cookies
const fetchWithCredentials = async (url, options = {}) => {
  return fetch(url, {
    ...options,
    credentials: 'include', // This is crucial for sending session cookies
  });
};

export const loginAdmin = async (credentials) => {
  const response = await fetchWithCredentials(`${API_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to login');
  return data;
};

export const getAllBookingsAdmin = async () => {
  const response = await fetchWithCredentials(`${API_URL}/admin/bookings`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch bookings');
  return data;
};

export const updateBookingStatusAdmin = async (id, status) => {
  const response = await fetchWithCredentials(
    `${API_URL}/admin/bookings/${id}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update booking');
  return data;
};

export const deleteBookingAdmin = async (id) => {
  const response = await fetchWithCredentials(
    `${API_URL}/admin/bookings/${id}`,
    {
      method: 'DELETE',
    }
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to delete booking');
  return data;
};

export const checkSession = async () => {
  const response = await fetchWithCredentials(`${API_URL}/admin/session`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to check session');
  return data;
};

export const logout = async () => {
  const response = await fetchWithCredentials(`${API_URL}/admin/logout`, {
    method: 'POST',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to logout');
  return data;
};
