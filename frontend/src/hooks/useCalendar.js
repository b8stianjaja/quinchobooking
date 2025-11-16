import { useState, useMemo, useEffect, useCallback } from 'react';
import { getBookedSlots } from '../services/bookingService';

// This version uses a named export
export function useCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [availabilityData, setAvailabilityData] = useState([]);
  const [isLoadingBookedDates, setIsLoadingBookedDates] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long' });

  const fetchBookedDataForMonth = useCallback(async (fetchYear, fetchMonth) => {
    setIsLoadingBookedDates(true);
    setFetchError(null);
    try {
      const dataFromApi = await getBookedSlots(fetchYear, fetchMonth + 1);
      setAvailabilityData(dataFromApi || []);
    } catch (error) {
      console.error('Hook: Error fetching availability data:', error);
      setFetchError(error.message || 'Error al cargar disponibilidad.');
      setAvailabilityData([]);
    } finally {
      setIsLoadingBookedDates(false);
    }
  }, []);

  useEffect(() => {
    fetchBookedDataForMonth(year, month);
  }, [year, month, fetchBookedDataForMonth]);

  const goToNextMonth = () => {
    // Create a new date object based on the current state
    const nextMonthDate = new Date(currentDate.getTime());
    
    // Set the date to the 1st to avoid month-end issues
    nextMonthDate.setDate(1);
    
    // Set the month to the *next* month. 
    // .setMonth() reliably handles year rollovers (e.g., Dec -> Jan).
    nextMonthDate.setMonth(currentDate.getMonth() + 1);

    setCurrentDate(nextMonthDate);
    setSelectedDate(null);
  };

  const goToPrevMonth = () => {
    const today = new Date();
    today.setDate(1);
    today.setHours(0, 0, 0, 0);

    const newPrevMonth = new Date(year, month - 1, 1);
    if (
      newPrevMonth.getFullYear() < today.getFullYear() ||
      (newPrevMonth.getFullYear() === today.getFullYear() &&
        newPrevMonth.getMonth() < today.getMonth())
    ) {
      return;
    }
    setCurrentDate(newPrevMonth);
    setSelectedDate(null);
  };

  const selectDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return;

    setSelectedDate(date);
  };

  const days = useMemo(() => {
    const daysArray = [];
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const correctedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < correctedFirstDay; i++) {
      daysArray.push({ key: `empty-${i}-${month}-${year}`, isEmpty: true });
    }

    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const dateObj = new Date(year, month, day);
      dateObj.setHours(0, 0, 0, 0);
      const dateString = dateObj.toISOString().split('T')[0];

      const isPast = dateObj < today;

      let dayStatus = 'available';
      let actualDaySlotAvailable = !isPast;
      let actualNightSlotAvailable = !isPast;

      if (isPast) {
        dayStatus = 'past';
      } else {
        const dayAvailabilityInfo = availabilityData.find(
          (slotInfo) => slotInfo.date === dateString
        );

        if (dayAvailabilityInfo) {
          actualDaySlotAvailable = dayAvailabilityInfo.isDaySlotAvailable;
          actualNightSlotAvailable = dayAvailabilityInfo.isNightSlotAvailable;
        }

        if (!actualDaySlotAvailable && !actualNightSlotAvailable) {
          dayStatus = 'booked';
        } else if (!actualDaySlotAvailable || !actualNightSlotAvailable) {
          dayStatus = 'partial';
        } else {
          dayStatus = 'available';
        }
      }

      daysArray.push({
        key: dateString,
        date: dateObj,
        dayOfMonth: day,
        isCurrentMonth: true,
        isToday: dateObj.getTime() === today.getTime(),
        isSelected: selectedDate
          ? dateObj.getTime() === selectedDate.getTime()
          : false,
        status: dayStatus,
        isDaySlotAvailable: actualDaySlotAvailable,
        isNightSlotAvailable: actualNightSlotAvailable,
      });
    }
    return daysArray;
  }, [year, month, selectedDate, availabilityData]);

  return {
    currentDate,
    selectedDate,
    days,
    monthName,
    year,
    isLoadingBookedDates,
    fetchError,
    goToNextMonth,
    goToPrevMonth,
    selectDate,
  };
}
