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
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border border-opacity-10 ${current.bg} ${current.text} border-current`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      {current.label}
    </span>
  );
};
StatusBadge.propTypes = { status: PropTypes.string.isRequired };

const StatCard = ({ title, value, icon, colorClass }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between relative overflow-hidden group">
    <div>
      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
        {title}
      </p>
      <p className="text-2xl md:text-3xl font-bold text-gray-800">{value}</p>
    </div>
    <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 text-opacity-100`}>
      {icon}
    </div>
  </div>
);
StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node,
  colorClass: PropTypes.string,
};

// --- Icons ---
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
  ),
  Calendar: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
  ),
  Clock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  Users: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
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
            return `Guardado`;
         } else {
             throw new Error(data.message || 'Error al actualizar.');
         }
      },
      error: (err) => {
          if (err.message.includes('Ya existe otra reserva confirmada')) {
              return `Cruce de fechas detectado.`;
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
    if (!window.confirm(`¿Eliminar reserva #${bookingId}?`)) return;

    const promise = deleteBookingAdmin(bookingId);
    toast.promise(promise, {
      loading: 'Eliminando...',
      success: (data) => {
        if (data.success) {
            fetchBookings(searchTerm, statusFilter);
            return `Eliminado`;
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
    return `flex-1 md:flex-none px-3 py-2 text-xs md:text-sm font-medium rounded-lg transition-all duration-200 border whitespace-nowrap
      ${isActive 
        ? 'bg-orange-600 text-white border-orange-600 shadow-sm' 
        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
      }`;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans pb-10">
       {/* Header */}
       <header className="bg-white border-b border-gray-200 sticky top-0 z-30 backdrop-blur-md bg-white/90">
        <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold shadow-sm">
              Q
            </div>
            <div>
              <h1 className="text-base md:text-lg font-bold text-gray-800 leading-tight">Panel Admin</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs md:text-sm text-gray-600 hidden sm:inline">
              Hola, <b>{currentAdminUser?.username}</b>
            </span>
            <button
              onClick={() => onLogout(navigate)}
              className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
              title="Cerrar Sesión"
            >
              <Icons.Logout />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-8 py-6 md:py-8">
        
        {/* Stats Cards */}
        <section className="grid grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
          <StatCard title="Total" value={stats.total} icon={<Icons.Total />} colorClass="bg-blue-500 text-blue-600" />
          <StatCard title="Pendiente" value={stats.pending} icon={<Icons.Pending />} colorClass="bg-yellow-500 text-yellow-600" />
          <StatCard title="Confirmada" value={stats.confirmed} icon={<Icons.Confirmed />} colorClass="bg-green-500 text-green-600" />
        </section>

        {/* Toolbar: Search & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
           <div className="relative w-full md:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icons.Search />
              </div>
              <input 
                type="text" 
                placeholder="Buscar..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="block w-full rounded-xl border-gray-200 pl-10 pr-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500 bg-gray-50 focus:bg-white transition-all" 
              />
           </div>

           <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
              <button className={getFilterButtonClasses('all')} onClick={() => setStatusFilter('all')}>Todas</button>
              <button className={getFilterButtonClasses('pending')} onClick={() => setStatusFilter('pending')}>Pendientes</button>
              <button className={getFilterButtonClasses('confirmed')} onClick={() => setStatusFilter('confirmed')}>Confirmadas</button>
              <button className={getFilterButtonClasses('cancelled')} onClick={() => setStatusFilter('cancelled')}>Canceladas</button>
           </div>
        </div>

        {/* --- Desktop Table View (Hidden on Mobile) --- */}
        <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Info</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {bookings.length === 0 ? (
                <tr><td colSpan="5" className="p-10 text-center text-gray-400">No hay reservas</td></tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-orange-50/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold mr-3">
                          {getInitials(booking.name)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{booking.name}</div>
                          <div className="text-xs text-gray-500">{booking.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-sm text-gray-700 font-medium">
                         {new Date(booking.booking_date).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                         <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${booking.slot_type === 'day' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-purple-50 text-purple-700 border border-purple-100'}`}>
                              {booking.slot_type === 'day' ? 'Día' : 'Noche'}
                            </span>
                            <span className="text-xs text-gray-600 flex items-center gap-1">
                              <Icons.Users /> {booking.guest_count || '?'}
                            </span>
                         </div>
                         {booking.notes && (
                           <button onClick={() => openNotesModal(booking.notes, booking.name)} className="text-xs text-orange-600 hover:underline flex items-center gap-1 w-fit">
                             <Icons.Chat /> Nota
                           </button>
                         )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                       <div className="flex items-center justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                         <select 
                           value={editStatus[booking.id] || booking.status} 
                           onChange={(e) => handleStatusChange(booking.id, e.target.value)} 
                           className="block w-28 py-1 pl-2 pr-6 text-xs border-gray-300 focus:ring-orange-500 focus:border-orange-500 rounded bg-white"
                         >
                           <option value="pending">Pendiente</option>
                           <option value="confirmed">Confirmada</option>
                           <option value="cancelled">Cancelada</option>
                         </select>
                         
                         {editStatus[booking.id] && editStatus[booking.id] !== booking.status && (
                           <button onClick={() => handleUpdateStatus(booking.id)} className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200"><Icons.Save /></button>
                         )}
                         <button onClick={() => handleDeleteBooking(booking.id)} className="p-1 bg-red-50 text-red-500 rounded hover:bg-red-100"><Icons.Trash /></button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- Mobile Card View (Visible only on Mobile) --- */}
        <div className="md:hidden space-y-4">
          {isLoading ? (
             <div className="text-center text-gray-400 py-10">Cargando...</div>
          ) : bookings.length === 0 ? (
             <div className="text-center text-gray-400 py-10">No hay reservas</div>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                {/* Card Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-sm font-bold">
                      {getInitials(booking.name)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{booking.name}</h3>
                      <p className="text-xs text-gray-500">{booking.phone}</p>
                    </div>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>

                {/* Card Body */}
                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <div className="flex items-center gap-1 text-gray-400 text-xs mb-1"><Icons.Calendar /> Fecha</div>
                    <div className="font-medium text-gray-700">
                      {new Date(booking.booking_date).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', timeZone: 'UTC' })}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <div className="flex items-center gap-1 text-gray-400 text-xs mb-1"><Icons.Clock /> Horario</div>
                    <div className="font-medium text-gray-700 capitalize">
                      {booking.slot_type === 'day' ? 'Día (09-19)' : 'Noche (20-07)'}
                    </div>
                  </div>
                </div>

                {/* Notes Preview if exists */}
                {booking.notes && (
                  <div 
                    onClick={() => openNotesModal(booking.notes, booking.name)}
                    className="mb-4 text-xs text-gray-500 bg-orange-50 p-2 rounded border border-orange-100 cursor-pointer flex items-start gap-2"
                  >
                    <span className="text-orange-400 mt-0.5"><Icons.Chat /></span>
                    <span className="line-clamp-1 italic">{booking.notes}</span>
                  </div>
                )}

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-1">
                   <div className="flex items-center gap-2 w-full">
                      <select 
                         value={editStatus[booking.id] || booking.status} 
                         onChange={(e) => handleStatusChange(booking.id, e.target.value)} 
                         className="block w-full py-2 pl-3 pr-8 text-sm border-gray-200 focus:ring-orange-500 focus:border-orange-500 rounded-lg bg-gray-50"
                       >
                         <option value="pending">Pendiente</option>
                         <option value="confirmed">Confirmada</option>
                         <option value="cancelled">Cancelada</option>
                       </select>
                       
                       {editStatus[booking.id] && editStatus[booking.id] !== booking.status && (
                         <button 
                           onClick={() => handleUpdateStatus(booking.id)} 
                           className="p-2 bg-green-600 text-white rounded-lg shadow-sm"
                         >
                           <Icons.Save />
                         </button>
                       )}
                       
                       <button 
                         onClick={() => handleDeleteBooking(booking.id)} 
                         className="p-2 text-red-400 hover:bg-red-50 rounded-lg"
                       >
                         <Icons.Trash />
                       </button>
                   </div>
                </div>
              </div>
            ))
          )}
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