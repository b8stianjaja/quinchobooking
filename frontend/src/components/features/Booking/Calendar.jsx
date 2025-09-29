import React from 'react';
import { useCalendar } from '../../../hooks/useCalendar';

function Calendar({ onDateSelect, initialSelectedDate }) {
  const {
    selectedDate,
    days,
    monthName,
    year,
    isLoadingBookedDates,
    fetchError,
    goToNextMonth,
    goToPrevMonth,
    selectDate,
  } = useCalendar();

  React.useEffect(() => {
    if (onDateSelect && selectedDate) {
      const dayData = days.find(
        (d) =>
          d.date && selectedDate && d.date.getTime() === selectedDate.getTime()
      );
      onDateSelect(selectedDate, {
        isDaySlotAvailable: dayData ? dayData.isDaySlotAvailable : true,
        isNightSlotAvailable: dayData ? dayData.isNightSlotAvailable : true,
      });
    } else if (onDateSelect && !selectedDate) {
      onDateSelect(null, {
        isDaySlotAvailable: true,
        isNightSlotAvailable: true,
      });
    }
  }, [selectedDate, onDateSelect, days]);

  React.useEffect(() => {
    if (initialSelectedDate && !selectedDate) {
      const initialDateObj = new Date(initialSelectedDate);
      initialDateObj.setHours(0, 0, 0, 0);
      selectDate(initialDateObj);
    }
  }, [initialSelectedDate, selectDate, selectedDate]);

  const daysOfWeek = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

  const handleDayClick = (day) => {
    if (day.isEmpty || day.status === 'past' || isLoadingBookedDates) {
      return;
    }
    selectDate(day.date);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 min-h-[420px]">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={goToPrevMonth}
          disabled={isLoadingBookedDates}
          className="p-2 rounded-full hover:bg-gray-100 focus:bg-yellow-100 focus:outline-none transition-colors text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Mes anterior"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            ></path>
          </svg>
        </button>
        <h4 className="text-lg font-semibold text-gray-800 capitalize w-40 text-center">
          {monthName} {year}
        </h4>
        <button
          onClick={goToNextMonth}
          disabled={isLoadingBookedDates}
          className="p-2 rounded-full hover:bg-gray-100 focus:bg-yellow-100 focus:outline-none transition-colors text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Mes siguiente"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 mb-3">
        {daysOfWeek.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {isLoadingBookedDates && (
        <div className="text-center py-10 text-sm text-orange-600 animate-pulse">
          Cargando disponibilidad...
        </div>
      )}
      {fetchError && !isLoadingBookedDates && (
        <div className="text-center py-10 text-sm text-red-600 bg-red-50 p-3 rounded-md">
          Error al cargar: {fetchError}
        </div>
      )}

      {!isLoadingBookedDates && !fetchError && (
        <div
          className={`grid grid-cols-7 gap-1 ${isLoadingBookedDates ? 'opacity-50 pointer-events-none' : ''}`}
        >
          {days.map((day) => {
            if (day.isEmpty) {
              return (
                <div
                  key={day.key}
                  className="h-10 w-10 border border-transparent"
                ></div>
              );
            }

            let dayClasses =
              'p-0 h-10 w-10 flex items-center justify-center text-sm rounded-full transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-70 ';

            switch (day.status) {
              case 'past':
                dayClasses += 'text-gray-300 bg-gray-50 cursor-not-allowed';
                break;
              case 'booked':
                dayClasses +=
                  'bg-red-200 text-red-500 line-through cursor-pointer opacity-70 hover:bg-red-200';
                break;
              case 'partial':
                dayClasses +=
                  'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 cursor-pointer';
                break;
              case 'available':
              default:
                dayClasses +=
                  'text-gray-700 bg-green-50 hover:bg-green-100 cursor-pointer';
                break;
            }

            if (day.isSelected && day.status !== 'past') {
              dayClasses +=
                ' ring-2 ring-offset-1 ring-orange-500 bg-orange-500 text-white font-bold shadow-md transform scale-105';
            } else if (day.isToday && day.status !== 'past') {
              dayClasses += ' border-2 border-orange-500';
            }
            if (day.status === 'past') {
              dayClasses += ' cursor-not-allowed';
            } else {
              dayClasses += ' cursor-pointer';
            }

            return (
              <button
                key={day.key}
                onClick={() => handleDayClick(day)}
                disabled={day.status === 'past' || isLoadingBookedDates}
                className={dayClasses}
                aria-label={`Seleccionar fecha ${day.dayOfMonth} de ${monthName} de ${year}${day.status === 'booked' ? ' (No disponible)' : day.status === 'partial' ? ' (Parcialmente disponible)' : ''}`}
              >
                {day.dayOfMonth}
              </button>
            );
          })}
        </div>
      )}

      {!isLoadingBookedDates && !fetchError && (
        <div className="mt-6 text-xs text-gray-500 space-y-1.5 border-t pt-4">
          <h5 className="font-semibold text-gray-600 mb-1">Leyenda:</h5>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-green-50 border border-gray-300 mr-2"></span>{' '}
            Disponible
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-yellow-100 border border-gray-300 mr-2"></span>{' '}
            Parcialmente Disponible
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-red-200 border border-gray-300 mr-2"></span>{' '}
            Reservado / No Disponible
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-orange-500 mr-2"></span>{' '}
            Día Seleccionado
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full border-2 border-orange-500 mr-2"></span>{' '}
            Hoy
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;
