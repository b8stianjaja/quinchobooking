// frontend/src/components/admin/AdminDashboard.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';

import {
  getAllBookingsAdmin,
  updateBookingStatusAdmin,
  deleteBookingAdmin,
} from '../../services/adminService';
import NotesModal from '../common/NotesModal';

// --- Helper: Get Initials ---
const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

// --- Components ---

const StatusBadge = ({ status }) => {
  const config = {
    pending: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      dot: 'bg-yellow-500',
      label: 'Pendiente',
    },
    confirmed: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      dot: 'bg-green-500',
      label: 'Confirmada',
    },
    cancelled: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      dot: 'bg-red-500',
      label: 'Cancelada',
    },
  };

  const current = config[status] || config.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-opacity-10 ${current.bg} ${current.text} border-current`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      {current.label}
    </span>
  );
};
StatusBadge.propTypes = { status: PropTypes.string.isRequired };

const StatCard = ({ title, value, icon, colorClass }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md flex items-center space-x-4 relative overflow-hidden group">
    {/* Decorative background shape */}
    <div
      className={`absolute right-0 top-0 w-24 h-24 ${colorClass} opacity-5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}
    />

    <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 text-opacity-100`}>
      {icon}
    </div>
    <div className="relative z-10">
      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
        {title}
      </p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);
StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node,
  colorClass: PropTypes.string,
};

// --- Icons (inline SVGs for zero dependencies) ---
const Icons = {
  Search: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
  ),
  Logout: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
  ),
  Total: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
  ),
  Pending: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  Confirmed: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
  ),
  Save: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
  ),
  Chat: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
  )
};

function AdminDashboard({ currentAdminUser, onLogout }) {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editStatus, setEditStatus] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [currentNotes, setCurrentNotes] = useState('');
  const [currentNotesTitle, setCurrentNotesTitle] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  const fetchBookings = useCallback(async (currentSearchTerm, currentStatusFilter) => {
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
      if (err.message?.toLowerCase().includes('unauthorized') || err.message?.toLowerCase().includes('no active session')) {
        toast.error('Tu sesión ha expirado.');
        if (onLogout) onLogout(navigate);
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentAdminUser, onLogout, navigate]);

   useEffect(() => {
    if (currentAdminUser) {
      fetchBookings(searchTerm, statusFilter);
    } else {
       setIsLoading(false);
       setBookings([]);
    }
  }, [currentAdminUser]);

  useEffect(() => {
    if (!currentAdminUser) return;
    const debounceTimer = setTimeout(() => {
      fetchBookings(searchTerm, statusFilter);
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, statusFilter, currentAdminUser, fetchBookings]);


  const handleStatusChange = (bookingId, newStatus) => {
    setEditStatus((prev) => ({ ...prev, [bookingId]: newStatus }));
  };

  const handleUpdateStatus = async (bookingId) => {
    const newStatus = editStatus[bookingId];
    const originalBooking = bookings.find((b) => b.id === bookingId);
    if (!newStatus || newStatus === originalBooking?.status) return;

    const promise = updateBookingStatusAdmin(bookingId, newStatus);
    toast.promise(promise, {
      loading: 'Actualizando...',
      success: (data) => {
         if (data.success) {
            fetchBookings(searchTerm, statusFilter);
            return `Actualizado a ${newStatus === 'confirmed' ? 'Confirmada' : newStatus === 'cancelled' ? 'Cancelada' : 'Pendiente'}`;
         } else {
             throw new Error(data.message || 'Error al actualizar.');
         }
      },
      error: (err) => {
          if (err.message.includes('Ya existe otra reserva confirmada')) {
              return `Cruce de Fechas: Ya existe una reserva confirmada.`;
          }
          return `Error: ${err.message}`;
      }
    });
    setEditStatus((prev) => {
      const newState = { ...prev };
      delete newState[bookingId];
      return newState;
    });
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm(`¿Eliminar reserva #${bookingId}? Esta acción es irreversible.`)) return;

    const promise = deleteBookingAdmin(bookingId);
    toast.promise(promise, {
      loading: 'Eliminando...',
      success: (data) => {
        if (data.success) {
            fetchBookings(searchTerm, statusFilter);
            return `Reserva eliminada.`;
        } else {
            throw new Error(data.message || 'Error al eliminar.');
        }
      },
      error: (err) => `Error: ${err.message}`,
    });
  };

  const stats = useMemo(() => ({
      total: bookings.length,
      pending: bookings.filter((b) => b.status === 'pending').length,
      confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    }), [bookings]
  );

  const getFilterButtonClasses = (filterValue) => {
    const isActive = statusFilter === filterValue;
    return `px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 
      ${isActive 
        ? 'bg-orange-600 text-white shadow-md shadow-orange-200' 
        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-orange-200'
      }`;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans">
       {/* Header */}
       <header className="bg-white border-b border-gray-200 sticky top-0 z-30 backdrop-blur-md bg-white/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold">
              Q
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800 leading-tight">Panel Admin</h1>
              <p className="text-xs text-gray-500">Gestión de Quincho El Ruco</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:inline">
              Hola, <span className="font-semibold text-gray-900">{currentAdminUser?.username}</span>
            </span>
            <button
              onClick={() => onLogout(navigate)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <Icons.Logout />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <StatCard title="Total Reservas" value={stats.total} icon={<Icons.Total />} colorClass="bg-blue-500 text-blue-600" />
          <StatCard title="Pendientes" value={stats.pending} icon={<Icons.Pending />} colorClass="bg-yellow-500 text-yellow-600" />
          <StatCard title="Confirmadas" value={stats.confirmed} icon={<Icons.Confirmed />} colorClass="bg-green-500 text-green-600" />
        </section>

        {/* Toolbar: Search & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
           <div className="flex flex-wrap gap-2">
              <button className={getFilterButtonClasses('all')} onClick={() => setStatusFilter('all')}>Todas</button>
              <button className={getFilterButtonClasses('pending')} onClick={() => setStatusFilter('pending')}>Pendientes</button>
              <button className={getFilterButtonClasses('confirmed')} onClick={() => setStatusFilter('confirmed')}>Confirmadas</button>
              <button className={getFilterButtonClasses('cancelled')} onClick={() => setStatusFilter('cancelled')}>Canceladas</button>
           </div>

           <div className="relative w-full md:w-72 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icons.Search />
              </div>
              <input 
                type="text" 
                placeholder="Buscar cliente, teléfono..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="block w-full rounded-xl border-gray-200 pl-10 pr-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-500 transition-shadow group-hover:shadow-md" 
              />
           </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha del Evento</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Detalles</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {isLoading ? (
                  <tr><td colSpan="5" className="p-12 text-center text-gray-400 animate-pulse">Cargando datos...</td></tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        <p className="text-sm font-medium">No se encontraron reservas</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-orange-50/30 transition-colors group">
                      
                      {/* Client Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-orange-100 to-amber-200 rounded-full flex items-center justify-center text-amber-700 font-bold text-sm shadow-inner">
                            {getInitials(booking.name)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">{booking.name}</div>
                            <div className="text-sm text-gray-500 font-mono">{booking.phone}</div>
                          </div>
                        </div>
                      </td>

                      {/* Date Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                         <div className="flex flex-col">
                           <span className="text-sm font-bold text-gray-700 capitalize">
                             {new Date(booking.booking_date).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', timeZone: 'UTC' })}
                           </span>
                           <span className="text-xs text-gray-400">
                             {new Date(booking.booking_date).getFullYear()}
                           </span>
                         </div>
                      </td>

                      {/* Details Column (Slot + Guests + Notes) */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                           <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${booking.slot_type === 'day' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                {booking.slot_type === 'day' ? 'Día' : 'Noche'}
                              </span>
                              <span className="text-xs text-gray-600 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                {booking.guest_count || '?'} pax
                              </span>
                           </div>
                           {booking.notes && (
                             <button 
                               onClick={() => openNotesModal(booking.notes, booking.name)}
                               className="mt-1 text-xs text-orange-600 hover:text-orange-800 flex items-center gap-1 font-medium transition-colors"
                             >
                               <Icons.Chat />
                               Ver nota
                             </button>
                           )}
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={booking.status} />
                      </td>

                      {/* Actions Column */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                         <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                           <div className="relative">
                             <select 
                               value={editStatus[booking.id] || booking.status} 
                               onChange={(e) => handleStatusChange(booking.id, e.target.value)} 
                               className="block w-32 pl-3 pr-8 py-1.5 text-xs border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 rounded-md bg-gray-50"
                             >
                               <option value="pending">Pendiente</option>
                               <option value="confirmed">Confirmada</option>
                               <option value="cancelled">Cancelada</option>
                             </select>
                           </div>
                           
                           {editStatus[booking.id] && editStatus[booking.id] !== booking.status && (
                             <button 
                               onClick={() => handleUpdateStatus(booking.id)} 
                               className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                               title="Guardar cambios"
                             >
                               <Icons.Save />
                             </button>
                           )}

                           <button 
                             onClick={() => handleDeleteBooking(booking.id)} 
                             className="p-1.5 bg-gray-100 text-gray-500 rounded hover:bg-red-100 hover:text-red-600 transition-colors ml-1"
                             title="Eliminar reserva"
                           >
                             <Icons.Trash />
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

      {/* Modal */}
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