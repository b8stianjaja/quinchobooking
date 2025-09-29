import React, { useState, useCallback } from 'react';
import Calendar from './Calendar';
import BookingForm from './BookingForm';

function BookingSection() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [slotAvailability, setSlotAvailability] = useState({
    isDaySlotAvailable: true,
    isNightSlotAvailable: true,
  });
  const [selectedSlot, setSelectedSlot] = useState(null);

  const handleDateSelection = useCallback((date, availability) => {
    setSelectedDate(date);
    setSlotAvailability(
      availability || { isDaySlotAvailable: true, isNightSlotAvailable: true }
    );
    setSelectedSlot(null);
  }, []);

  const handleSlotSelection = useCallback((slot) => {
    setSelectedSlot(slot);
  }, []);

  // FIX: This function will reset the calendar after a successful booking.
  const handleBookingSuccess = useCallback(() => {
    setTimeout(() => {
      setSelectedDate(null);
      setSelectedSlot(null);
      setSlotAvailability({
        isDaySlotAvailable: true,
        isNightSlotAvailable: true,
      });
    }, 5000); // Reset after 5 seconds to allow user to read the success message.
  }, []);

  return (
    <section id="booking" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-yellow-900 mb-4 font-hero-title">
            Realiza tu Reserva
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed font-hero-title">
            Consulta nuestra disponibilidad y elige la fecha perfecta para tu
            evento.
          </p>
        </div>

        {/* FIX: The general status message has been removed from here. */}

        <div className="max-w-5xl mx-auto bg-gray-50 p-6 sm:p-8 md:p-10 rounded-xl shadow-2xl grid md:grid-cols-2 gap-8 md:gap-12 items-start">
          <div className="w-full">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center md:text-left font-hero-title">
              1. Selecciona una Fecha
            </h3>
            <Calendar
              onDateSelect={handleDateSelection}
              initialSelectedDate={selectedDate}
            />
          </div>
          <div className="w-full">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center md:text-left font-hero-title">
              2. Elige Franja y Completa Datos
            </h3>
            <BookingForm
              selectedDate={selectedDate}
              onBookingSuccess={handleBookingSuccess} // Changed prop
              slotAvailability={slotAvailability}
              selectedSlot={selectedSlot}
              onSlotSelect={handleSlotSelection}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
export default BookingSection;
