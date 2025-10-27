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
import NotesModal from '../common/NotesModal'; // <--- Importa el modal

// ... (Componentes StatusBadge y StatCard sin cambios) ...
const StatusBadge = ({ status }) => {
  // ... (código existente)
};
StatusBadge.propTypes = { status: PropTypes.string.isRequired };
const StatCard = ({ title, value, icon }) => {
  // ... (código existente)
};
StatCard.propTypes = { /* ... (props existentes) */ };


function AdminDashboard({ currentAdminUser, onLogout }) {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editStatus, setEditStatus] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  // --- Nuevos estados para el modal ---
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [currentNotes, setCurrentNotes] = useState('');
  const [currentNotesTitle, setCurrentNotesTitle] = useState('');
  // ------------------------------------

  const navigate = useNavigate();

  // --- Funciones para abrir/cerrar modal ---
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
  // ---------------------------------------

  const fetchBookings = useCallback(async () => {
    // ... (código existente sin cambios)
  }, [onLogout]);

  useEffect(() => {
    // ... (código existente sin cambios)
  }, [currentAdminUser, fetchBookings]);

  // ... (handleStatusChange, handleUpdateStatus, handleDeleteBooking sin cambios) ...
  const handleStatusChange = (bookingId, newStatus) => { /* ... */ };
  const handleUpdateStatus = async (bookingId) => { /* ... */ };
  const handleDeleteBooking = async (bookingId) => { /* ... */ };


  const filteredBookings = useMemo(
    () =>
      // ... (código existente sin cambios)
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
      // ... (código existente sin cambios)
       total: bookings.length,
      pending: bookings.filter((b) => b.status === 'pending').length,
      confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    }),
    [bookings]
  );

  // Función auxiliar para truncar texto
  const truncateText = (text, maxLength = 60) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* ... (Header sin cambios) ... */}
       <header className="bg-white shadow-sm sticky top-0 z-40"> {/* ... */} </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* ... (Sección de StatCards sin cambios) ... */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"> {/* ... */} </section>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          {/* ... (Título y barra de búsqueda sin cambios) ... */}
           <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4"> {/* ... */} </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    'Cliente', 'Teléfono', 'Detalles del Evento',
                    'Invitados', 'Notas', 'Estado', 'Acciones',
                  ].map((header) => (
                     <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr> <td colSpan="7" className="text-center p-8 text-gray-500"> Cargando reservas... </td> </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr> <td colSpan="7" className="text-center p-8 text-gray-500"> No se encontraron reservas. </td> </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      {/* ... (Celdas Cliente, Teléfono, Detalles, Invitados sin cambios) ... */}
                      <td className="px-6 py-4 whitespace-nowrap"> <div className="text-sm font-semibold text-gray-900">{booking.name || '-'}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap"> <div className="text-sm text-gray-600">{booking.phone || '-'}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap"> {/* ... Detalles ... */} </td>
                      <td className="px-6 py-4 whitespace-nowrap"> <div className="text-sm text-gray-600 text-center">{booking.guest_count || '-'}</div></td>

                      {/* --- Celda de Notas Modificada --- */}
                      <td className="px-6 py-4 max-w-xs">
                        <div className="flex items-center space-x-2">
                           <span className="text-sm text-gray-600 flex-grow overflow-hidden whitespace-nowrap overflow-ellipsis">
                              {/* Mostramos texto truncado o '-' */}
                              {truncateText(booking.notes, 50)}
                           </span>
                           {/* Botón para abrir modal solo si hay notas */}
                           {booking.notes && booking.notes.length > 50 && (
                             <button
                               onClick={() => openNotesModal(booking.notes, booking.name)}
                               className="text-orange-600 hover:text-orange-800 text-xs font-medium p-1 rounded hover:bg-orange-50 flex-shrink-0"
                               aria-label="Ver notas completas"
                             >
                               Ver más
                             </button>
                           )}
                        </div>
                      </td>
                      {/* ------------------------------------ */}

                      <td className="px-6 py-4 whitespace-nowrap"> <StatusBadge status={booking.status} /> </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium"> <div className="flex items-center space-x-2"> {/* ... Acciones ... */} </div> </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* --- Renderizar el modal si está abierto --- */}
      {isNotesModalOpen && (
        <NotesModal
          title={currentNotesTitle}
          content={currentNotes}
          onClose={closeNotesModal}
        />
      )}
      {/* ------------------------------------------ */}
    </div>
  );
}

AdminDashboard.propTypes = {
 // ... (propTypes existentes)
};

export default AdminDashboard;