// In frontend/src/components/admin/AdminDashboard.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types'; // Import PropTypes
import toast from 'react-hot-toast';

import {
  getAllBookingsAdmin,
  updateBookingStatusAdmin,
  deleteBookingAdmin,
} from '../../services/adminService';

const StatusBadge = ({ status }) => {
  const baseClasses =
    'px-2.5 py-0.5 text-xs font-semibold rounded-full inline-block';
  const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  const statusText = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    cancelled: 'Cancelada',
  };
  return (
    <span
      className={`${baseClasses} ${
        statusStyles[status] || 'bg-gray-100 text-gray-800'
      }`}
    >
      {statusText[status] || status}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
};

const StatCard = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-center space-x-4">
    <div className="bg-orange-100 p-3 rounded-full">{icon}</div>
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node.isRequired,
};

function AdminDashboard({ currentAdminUser, onLogout }) {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editStatus, setEditStatus] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedBookings = await getAllBookingsAdmin();
      setBookings(fetchedBookings || []);
    } catch (err) {
      toast.error(err.message || 'No se pudieron cargar las reservas.');
      if (err.message?.toLowerCase().includes('unauthorized')) {
        if (onLogout) onLogout(); // Se llama a onLogout si hay error de autorización
      }
    } finally {
      setIsLoading(false);
    }
  }, [onLogout]); // onLogout se añade como dependencia

  useEffect(() => {
    if (currentAdminUser) {
      fetchBookings();
    }
  }, [currentAdminUser, fetchBookings]);

  const handleStatusChange = (bookingId, newStatus) => {
    setEditStatus((prev) => ({ ...prev, [bookingId]: newStatus }));
  };

  const handleUpdateStatus = async (bookingId) => {
    const newStatus = editStatus[bookingId];
    const originalBooking = bookings.find((b) => b.id === bookingId);
    if (!newStatus || newStatus === originalBooking?.status) return;

    const promise = updateBookingStatusAdmin(bookingId, newStatus);
    toast.promise(promise, {
      loading: 'Actualizando estado...',
      success: (data) => {
         if (data.success) {
            fetchBookings(); // Refreshes the data on success
            return `Reserva actualizada con éxito.`;
         } else {
             // Si el backend devuelve success: false
             throw new Error(data.message || 'No se pudo actualizar la reserva.');
         }
      },
      error: (err) => `Error: ${err.message}`,
    });
    // Limpiar el estado de edición para esta reserva después de intentar actualizar
    setEditStatus((prev) => {
      const newState = { ...prev };
      delete newState[bookingId];
      return newState;
    });
  };

  const handleDeleteBooking = async (bookingId) => {
    if (
      !window.confirm(
        `¿Estás seguro que quieres eliminar la reserva ID ${bookingId}? Esta acción es permanente.`
      )
    )
      return;

    const promise = deleteBookingAdmin(bookingId);
    toast.promise(promise, {
      loading: 'Eliminando reserva...',
      success: (data) => {
        if (data.success) {
            fetchBookings(); // Refreshes the data on success
            return `Reserva eliminada con éxito.`;
        } else {
            throw new Error(data.message || 'No se pudo eliminar la reserva.');
        }
      },
      error: (err) => `Error: ${err.message}`,
    });
  };

  // Actualizar filtro para buscar solo por nombre o teléfono
  const filteredBookings = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          (booking.name &&
            booking.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (booking.phone && // Añadir búsqueda por teléfono
            booking.phone.toLowerCase().includes(searchTerm.toLowerCase()))
      ),
    [bookings, searchTerm]
  );

  const stats = useMemo(
    () => ({
      total: bookings.length,
      pending: bookings.filter((b) => b.status === 'pending').length,
      confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    }),
    [bookings]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Panel de Administración
            </h1>
            <p className="text-sm text-gray-500">
              Bienvenido,{' '}
              <span className="font-semibold text-orange-600">
                {currentAdminUser?.username}
              </span>
            </p>
          </div>
          <button
             // Pasamos navigate a onLogout si es necesario
            onClick={() => onLogout(navigate)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 font-semibold transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total de Reservas"
            value={stats.total}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-orange-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
          <StatCard
            title="Pendientes de Confirmación"
            value={stats.pending}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
          <StatCard
            title="Eventos Confirmados"
            value={stats.confirmed}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
        </section>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-xl font-bold text-gray-800">
              Gestión de Reservas
            </h2>
            <div className="relative w-full sm:w-auto">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  className="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre o teléfono..." // Actualizar placeholder
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-md border-gray-300 py-2 pl-10 pr-3 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {/* --- MODIFICADO: Añadir 'Notas' --- */}
                  {[
                    'Cliente',
                    'Teléfono',
                    'Detalles del Evento',
                    'Invitados',
                    'Notas', // <--- Añadido aquí
                    'Estado',
                    'Acciones',
                  ].map((header) => (
                    <th
                      key={header}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    {/* --- MODIFICADO: Ajustar colSpan --- */}
                    <td
                      colSpan="7" // <--- Cambiado de 6 a 7
                      className="text-center p-8 text-gray-500"
                    >
                      Cargando reservas...
                    </td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    {/* --- MODIFICADO: Ajustar colSpan --- */}
                    <td
                      colSpan="7" // <--- Cambiado de 6 a 7
                      className="text-center p-8 text-gray-500"
                    >
                      No se encontraron reservas.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {booking.name || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {booking.phone || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {new Date(booking.booking_date).toLocaleDateString(
                            'es-CL',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              timeZone: 'UTC',
                            }
                          )}
                          <br />
                          <span className="font-semibold capitalize">
                            {booking.slot_type === 'day' ? 'Día' : booking.slot_type === 'night' ? 'Noche' : booking.slot_type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 text-center">
                          {booking.guest_count || '-'}
                        </div>
                      </td>
                      {/* --- MODIFICADO: Añadir celda para Notas --- */}
                      <td className="px-6 py-4 max-w-xs"> {/* Limitamos ancho */}
                        <div className="text-sm text-gray-600 truncate" title={booking.notes || ''}> {/* Truncamos texto largo, mostramos completo en tooltip */}
                          {booking.notes || '-'} {/* Mostramos '-' si no hay notas */}
                        </div>
                      </td>
                      {/* ------------------------------------------- */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <select
                            value={editStatus[booking.id] || booking.status}
                            onChange={(e) =>
                              handleStatusChange(booking.id, e.target.value)
                            }
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-xs py-1.5 px-2"
                          >
                            <option value="pending">Pendiente</option>
                            <option value="confirmed">Confirmada</option>
                            <option value="cancelled">Cancelada</option>
                          </select>
                          <button
                            onClick={() => handleUpdateStatus(booking.id)}
                            disabled={
                              !editStatus[booking.id] ||
                              editStatus[booking.id] === booking.status
                            }
                            className="p-2 text-green-600 hover:text-green-900 disabled:text-gray-300 disabled:cursor-not-allowed"
                            aria-label="Guardar estado"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteBooking(booking.id)}
                            className="p-2 text-red-600 hover:text-red-900"
                            aria-label="Eliminar reserva"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

AdminDashboard.propTypes = {
  currentAdminUser: PropTypes.shape({
    id: PropTypes.number,
    username: PropTypes.string,
  }),
  onLogout: PropTypes.func.isRequired,
};

export default AdminDashboard;