// In frontend/src/components/admin/AdminDashboard.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';

import {
  getAllBookingsAdmin,
  updateBookingStatusAdmin,
  deleteBookingAdmin,
} from '../../services/adminService';
import NotesModal from '../common/NotesModal'; // Asegúrate que la ruta sea correcta

// --- Componentes StatusBadge y StatCard ---
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
StatusBadge.propTypes = { status: PropTypes.string.isRequired };

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
// ------------------------------------------


function AdminDashboard({ currentAdminUser, onLogout }) {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editStatus, setEditStatus] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [currentNotes, setCurrentNotes] = useState('');
  const [currentNotesTitle, setCurrentNotesTitle] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // Estado para el filtro

  const navigate = useNavigate();

  const openNotesModal = (notes, bookingName) => {
    setCurrentNotes(notes);
    setCurrentNotesTitle(`Notas de ${bookingName}`);
    setIsNotesModalOpen(true);
  };

  const closeNotesModal = () => {
    setIsNotesModalOpen(false);
    setCurrentNotes('');
    setCurrentNotesTitle('');
  };

  // --- fetchBookings ahora acepta ambos filtros ---
  const fetchBookings = useCallback(async (currentSearchTerm, currentStatusFilter) => {
    // Solo intentar cargar si hay un usuario logueado
    if (!currentAdminUser) {
        setIsLoading(false);
        setBookings([]);
        return;
    }

    setIsLoading(true);
    try {
      const fetchedBookings = await getAllBookingsAdmin(currentSearchTerm, currentStatusFilter);
      setBookings(fetchedBookings || []);
    } catch (err) {
      toast.error(err.message || 'No se pudieron cargar las reservas.');
       // Manejo mejorado del error de sesión/autorización
      if (err.message?.toLowerCase().includes('unauthorized') || err.message?.toLowerCase().includes('no active session')) {
        toast.error('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
        if (onLogout) onLogout(navigate); // Llama a onLogout para desloguear
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentAdminUser, onLogout, navigate]); // Añadir currentAdminUser a las dependencias
  // ---------------------------------------------

   // --- useEffect para carga inicial y cambios de usuario ---
  useEffect(() => {
    // Si hay usuario, cargar todo al inicio. Si no, limpiar.
    if (currentAdminUser) {
      fetchBookings(searchTerm, statusFilter); // Usar filtros actuales en carga inicial si ya existen
    } else {
       setIsLoading(false);
       setBookings([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAdminUser]); // Depende solo de currentAdminUser para la carga inicial/logout
  // ----------------------------------------------------

  // --- useEffect para buscar/filtrar con debounce ---
  useEffect(() => {
    if (!currentAdminUser) return; // No hacer nada si no hay usuario

    const debounceTimer = setTimeout(() => {
      fetchBookings(searchTerm, statusFilter);
    }, 500); // Espera 500ms

    return () => clearTimeout(debounceTimer);
     // Depende de searchTerm Y statusFilter
  }, [searchTerm, statusFilter, currentAdminUser, fetchBookings]);
  // -----------------------------------------------


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
            // Refrescar usando los filtros actuales
            fetchBookings(searchTerm, statusFilter);
            return `Reserva actualizada con éxito.`;
         } else {
             throw new Error(data.message || 'No se pudo actualizar la reserva.');
         }
      },
      error: (err) => {
          // Si el error es de conflicto (409), mostrar mensaje específico
          if (err.message.includes('Ya existe otra reserva confirmada')) {
              return `Error: ${err.message}`;
          }
          return `Error al actualizar: ${err.message}`;
      }
    });
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
            // Refrescar usando los filtros actuales
            fetchBookings(searchTerm, statusFilter);
            return `Reserva eliminada con éxito.`;
        } else {
            throw new Error(data.message || 'No se pudo eliminar la reserva.');
        }
      },
      error: (err) => `Error: ${err.message}`,
    });
  };


  // Stats calculados sobre los 'bookings' ya filtrados por el backend
  const stats = useMemo(
    () => ({
      // Podríamos necesitar una llamada separada para el total real si quisiéramos mostrarlo
      // independientemente del filtro actual. Por ahora, muestra el total de la vista actual.
      total: bookings.length,
      pending: bookings.filter((b) => b.status === 'pending').length,
      confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    }),
    [bookings]
  );

  const truncateText = (text, maxLength = 60) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Helper para clases de botones de filtro
  const getFilterButtonClasses = (filterValue) => {
    const base = "px-4 py-1.5 text-sm font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50";
    if (statusFilter === filterValue) {
      return `${base} bg-orange-600 text-white shadow`;
    }
    return `${base} bg-gray-100 text-gray-700 hover:bg-gray-200`;
  };


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
            onClick={() => onLogout(navigate)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 font-semibold transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"> <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /> </svg>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Sección de Estadísticas */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard title="Total (Vista Actual)" value={stats.total} icon={/* Icono Total */} />
          <StatCard title="Pendientes (Vista Actual)" value={stats.pending} icon={/* Icono Pendiente */} />
          <StatCard title="Confirmadas (Vista Actual)" value={stats.confirmed} icon={/* Icono Confirmado */} />
        </section>

        {/* Tabla de Gestión de Reservas */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          {/* Cabecera con Título, Filtros y Búsqueda */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
             <div className="flex-grow flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                <h2 className="text-xl font-bold text-gray-800 flex-shrink-0"> Gestión de Reservas </h2>
                {/* Botones de Filtro por Estado */}
                <div className="flex flex-wrap justify-center sm:justify-start space-x-2 border border-gray-200 p-1 rounded-lg">
                  <button className={getFilterButtonClasses('all')} onClick={() => setStatusFilter('all')}>Todas</button>
                  <button className={getFilterButtonClasses('pending')} onClick={() => setStatusFilter('pending')}>Pendientes</button>
                  <button className={getFilterButtonClasses('confirmed')} onClick={() => setStatusFilter('confirmed')}>Confirmadas</button>
                  <button className={getFilterButtonClasses('cancelled')} onClick={() => setStatusFilter('cancelled')}>Canceladas</button>
                </div>
             </div>
             {/* Barra de Búsqueda */}
            <div className="relative w-full md:w-auto flex-shrink-0">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"> <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"> <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /> </svg> </div>
              <input type="text" placeholder="Buscar por nombre, tel o notas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full rounded-md border-gray-300 py-2 pl-10 pr-3 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm" />
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[ 'Cliente', 'Teléfono', 'Detalles del Evento', 'Invitados', 'Notas', 'Estado', 'Acciones', ].map((header) => (
                     <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"> {header} </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr> <td colSpan="7" className="text-center p-8 text-gray-500 animate-pulse"> Cargando reservas... </td> </tr>
                ) : bookings.length === 0 ? (
                  <tr> <td colSpan="7" className="text-center p-8 text-gray-500">
                     {searchTerm || statusFilter !== 'all' ? 'No se encontraron reservas para los filtros aplicados.' : 'No hay reservas registradas.'}
                  </td> </tr>
                ) : (
                  bookings.map((booking) => ( // Usar 'bookings' directamente
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      {/* Celdas de datos ... */}
                       <td className="px-6 py-4 whitespace-nowrap"> <div className="text-sm font-semibold text-gray-900">{booking.name || '-'}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap"> <div className="text-sm text-gray-600">{booking.phone || '-'}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <div className="text-sm text-gray-600">
                           {new Date(booking.booking_date).toLocaleDateString( 'es-CL', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC', } )}
                           <br />
                           <span className="font-semibold capitalize"> {booking.slot_type === 'day' ? 'Día' : booking.slot_type === 'night' ? 'Noche' : booking.slot_type} </span>
                         </div>
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap"> <div className="text-sm text-gray-600 text-center">{booking.guest_count || '-'}</div></td>
                      <td className="px-6 py-4 max-w-xs"> {/* Notas con Modal */}
                        <div className="flex items-center space-x-2">
                           {/* Icono indicador si hay notas */}
                           {booking.notes && <span className="text-gray-400" title="Esta reserva tiene notas">💬</span>}
                           <span className="text-sm text-gray-600 flex-grow overflow-hidden whitespace-nowrap overflow-ellipsis">
                              {truncateText(booking.notes, 40)} {/* Acortar un poco más */}
                           </span>
                           {booking.notes && booking.notes.length > 40 && (
                             <button onClick={() => openNotesModal(booking.notes, booking.name)} className="text-orange-600 hover:text-orange-800 text-xs font-medium p-1 rounded hover:bg-orange-50 flex-shrink-0" aria-label="Ver notas completas"> Ver más </button>
                           )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap"> <StatusBadge status={booking.status} /> </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium"> {/* Acciones */}
                         <div className="flex items-center space-x-2">
                           <select value={editStatus[booking.id] || booking.status} onChange={(e) => handleStatusChange(booking.id, e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-xs py-1.5 px-2" >
                             <option value="pending">Pendiente</option>
                             <option value="confirmed">Confirmada</option>
                             <option value="cancelled">Cancelada</option>
                           </select>
                           <button onClick={() => handleUpdateStatus(booking.id)} disabled={ !editStatus[booking.id] || editStatus[booking.id] === booking.status } className="p-2 text-green-600 hover:text-green-900 disabled:text-gray-300 disabled:cursor-not-allowed" aria-label="Guardar estado" > <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"> <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /> </svg> </button>
                           <button onClick={() => handleDeleteBooking(booking.id)} className="p-2 text-red-600 hover:text-red-900" aria-label="Eliminar reserva" > <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"> <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /> </svg> </button>
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

      {/* Modal de Notas */}
      {isNotesModalOpen && (
        <NotesModal
          title={currentNotesTitle}
          content={currentNotes}
          onClose={closeNotesModal}
        />
      )}
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