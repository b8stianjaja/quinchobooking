// frontend/src/components/features/Booking/BookingForm.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { toast } from 'react-hot-toast';
import { submitBooking } from '../../../services/bookingService';

function BookingForm({
  selectedDate,
  slotAvailability,
  selectedSlot,
  onSlotSelect,
  onBookingSuccess,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState({ message: '', type: '' });
  const [formDataState, setFormDataState] = useState({
    name: '',
    phone: '',
    guests: '',
    notes: '',
  });
  const NOTES_MAX_LENGTH = 333; // Límite de caracteres

  const formattedDateForDisplay = selectedDate
    ? new Date(selectedDate).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      })
    : 'Ninguna fecha seleccionada';

  useEffect(() => {
    // Resetea el estado inicial sin el campo 'email'
    setFormDataState({ name: '', phone: '', guests: '', notes: '' });
    setFormStatus({ message: '', type: '' });
  }, [selectedDate, selectedSlot]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    // Asegurarse de no exceder el límite para el textarea de notas
    if (name === 'notes' && value.length > NOTES_MAX_LENGTH) {
       // Opcional: Podrías truncar el valor aquí si prefieres,
       // pero `maxLength` en el textarea ya previene escribir más.
       // Esto asegura que si pegan texto, no exceda.
       setFormDataState((prev) => ({ ...prev, [name]: value.substring(0, NOTES_MAX_LENGTH) }));
       return;
    }
    setFormDataState((prev) => ({ ...prev, [name]: value }));
  };


  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedDate || !selectedSlot) {
      toast.error('Por favor, selecciona una fecha y franja horaria.');
      return;
    }

    setIsSubmitting(true);
    setFormStatus({ message: '', type: '' });

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const bookingDateString = `${year}-${month}-${day}`;

    // Payload sin 'email'
    const bookingPayload = {
      booking_date: bookingDateString,
      slot_type: selectedSlot,
      name: formDataState.name,
      phone: formDataState.phone,
      guest_count: formDataState.guests
        ? parseInt(formDataState.guests, 10)
        : null,
      notes: formDataState.notes, // Ya limitado por handleInputChange y maxLength
    };

    try {
      const response = await submitBooking(bookingPayload);
      if (response.success) {
        toast.success('¡Solicitud de reserva enviada!');
        setFormStatus({
          message:
            'Tu solicitud ha sido enviada con éxito. Te contactaremos pronto para confirmar. ¡Gracias!',
          type: 'success',
        });
        // Resetea el estado sin 'email'
        setFormDataState({ name: '', phone: '', guests: '', notes: '' });
        if (onBookingSuccess) onBookingSuccess();
      } else {
        toast.error(response.message || 'No se pudo enviar la solicitud.');
        setFormStatus({ message: response.message, type: 'error' });
      }
    } catch (error) {
      const errorMessage = error.message || 'Ocurrió un error inesperado.';
      toast.error(errorMessage);
      setFormStatus({ message: errorMessage, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const slotButtonBaseClasses =
    'w-full p-3 border rounded-lg text-sm text-left transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-70';
  const slotButtonSelectedClasses =
    'bg-orange-500 text-white border-orange-600 ring-orange-500 shadow-md';
  const slotButtonAvailableClasses =
    'bg-white hover:bg-orange-50 border-gray-300 text-gray-800 hover:border-orange-300';
  const slotButtonDisabledClasses =
    'bg-gray-100 text-gray-400 border-gray-200 line-through cursor-not-allowed';

  // --- Determinar color del contador ---
  const notesLength = formDataState.notes.length;
  const counterColor = notesLength >= NOTES_MAX_LENGTH
    ? 'text-red-600 font-semibold' // Rojo y negrita al límite
    : notesLength > NOTES_MAX_LENGTH - 50
    ? 'text-orange-600' // Naranja cuando se acerca
    : 'text-gray-500'; // Normal
  // ------------------------------------

  return formStatus.type === 'success' ? (
    <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-xl text-center min-h-[400px] flex flex-col justify-center items-center">
      <h4 className="font-bold text-xl mb-2">¡Solicitud Enviada!</h4>
      <p>{formStatus.message}</p>
    </div>
  ) : (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 space-y-6"
    >
      <div>
        <label
          htmlFor="selected-date-display"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Fecha Seleccionada
        </label>
        <input
          type="text"
          id="selected-date-display"
          value={formattedDateForDisplay}
          readOnly
          className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700"
        />
      </div>

      {selectedDate && (
        <div className="space-y-3">
          <p className="block text-sm font-medium text-gray-700 mb-1">
            Elige una Franja Horaria:
          </p>
          <button
            type="button"
            onClick={() =>
              slotAvailability?.isDaySlotAvailable && onSlotSelect('day')
            }
            disabled={!slotAvailability?.isDaySlotAvailable || isSubmitting}
            className={`${slotButtonBaseClasses} ${
              slotAvailability?.isDaySlotAvailable
                ? selectedSlot === 'day'
                  ? slotButtonSelectedClasses
                  : slotButtonAvailableClasses
                : slotButtonDisabledClasses
            }`}
          >
            <span className="font-semibold block">Franja Día</span>
            <span className="text-xs">09:00 - 19:00 hrs</span>
            {!slotAvailability?.isDaySlotAvailable && (
              <span className="text-xs block">(No disponible)</span>
            )}
          </button>
          <button
            type="button"
            onClick={() =>
              slotAvailability?.isNightSlotAvailable && onSlotSelect('night')
            }
            disabled={!slotAvailability?.isNightSlotAvailable || isSubmitting}
            className={`${slotButtonBaseClasses} ${
              slotAvailability?.isNightSlotAvailable
                ? selectedSlot === 'night'
                  ? slotButtonSelectedClasses
                  : slotButtonAvailableClasses
                : slotButtonDisabledClasses
            }`}
          >
            <span className="font-semibold block">Franja Noche</span>
            <span className="text-xs">20:00 - 07:00 hrs (+1 día)</span>
            {!slotAvailability?.isNightSlotAvailable && (
              <span className="text-xs block">(No disponible)</span>
            )}
          </button>
        </div>
      )}

      <fieldset
        disabled={!selectedDate || !selectedSlot || isSubmitting}
        className="space-y-6"
      >
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nombre Completo<span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formDataState.name}
            onChange={handleInputChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 placeholder:text-gray-400 disabled:bg-gray-100"
            placeholder="Ej: Juan Pérez"
          />
        </div>
        {/* Campo de Email Eliminado */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Teléfono<span className="text-red-500 ml-0.5">*</span> {/* Hacerlo requerido */}
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formDataState.phone}
            onChange={handleInputChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 placeholder:text-gray-400 disabled:bg-gray-100"
            placeholder="Ej: +56 9 1234 5678"
          />
        </div>
        <div>
          <label
            htmlFor="guests"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nº de Invitados (aprox.)
          </label>
          <input
            type="number"
            id="guests"
            name="guests"
            value={formDataState.guests}
            onChange={handleInputChange}
            min="1"
            max="50" // Puedes ajustar el máximo si es necesario
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 placeholder:text-gray-400 disabled:bg-gray-100"
            placeholder="Ej: 25"
          />
        </div>
        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Notas Adicionales (opcional)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formDataState.notes}
            onChange={handleInputChange}
            rows="3"
            maxLength={NOTES_MAX_LENGTH} // Límite aplicado
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 placeholder:text-gray-400 disabled:bg-gray-100"
            placeholder="Ej: ¿Alergias? ¿Necesitas algo especial? ¿Motivo (cumpleaños, etc.)?" // Placeholder mejorado
          ></textarea>
          {/* Contador con color dinámico */}
          <p className={`text-xs ${counterColor} text-right mt-1 transition-colors`}>
            {notesLength} / {NOTES_MAX_LENGTH} caracteres
          </p>
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={!selectedDate || !selectedSlot || isSubmitting}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
            Enviando Solicitud...
          </>
        ) : (
          'Solicitar Reserva'
        )}
      </button>

      {formStatus.type === 'error' && (
        <p role="alert" className="text-sm text-center text-red-600 mt-3">
          {formStatus.message}
        </p>
      )}
    </form>
  );
}

BookingForm.propTypes = {
  selectedDate: PropTypes.instanceOf(Date),
  slotAvailability: PropTypes.shape({
    isDaySlotAvailable: PropTypes.bool,
    isNightSlotAvailable: PropTypes.bool,
  }).isRequired,
  selectedSlot: PropTypes.string,
  onSlotSelect: PropTypes.func.isRequired,
  onBookingSuccess: PropTypes.func.isRequired,
};

export default BookingForm;