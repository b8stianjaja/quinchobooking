// frontend/src/services/adminService.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const API_URL = `${API_BASE_URL}/api`;

// Helper para incluir credenciales (cookies) en las peticiones
const fetchWithCredentials = async (url, options = {}) => {
  return fetch(url, {
    ...options,
    credentials: 'include', // Crucial para enviar cookies de sesión
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

// --- getAllBookingsAdmin Modificado para incluir filtros ---
export const getAllBookingsAdmin = async (searchTerm = '', statusFilter = 'all') => {
  // Construir los query parameters
  const params = new URLSearchParams();
  if (searchTerm && searchTerm.trim() !== '') {
    params.append('search', searchTerm.trim());
  }
  // Añadir el filtro de estado solo si no es 'all'
  if (statusFilter && statusFilter !== 'all') {
    params.append('status', statusFilter);
  }

  const queryString = params.toString();
  // Añadir el query string a la URL solo si contiene parámetros
  const url = `${API_URL}/admin/bookings${queryString ? `?${queryString}` : ''}`;

  const response = await fetchWithCredentials(url); // Usar la URL construida
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch bookings');
  return data;
};
// ----------------------------------------------------

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
  if (!response.ok) {
      // Manejar el caso específico de 'No active session' sin lanzar error necesariamente
      if(response.status === 401 && data.message === 'No active session.') {
          return data; // Devuelve el { success: false, ... } esperado
      }
      throw new Error(data.message || 'Failed to check session');
  }
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