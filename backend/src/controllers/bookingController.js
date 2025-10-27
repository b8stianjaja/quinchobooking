// backend/src/controllers/bookingController.js
const bookingModel = require('../models/bookingModel');
const adminModel = require('../models/adminModel');
const availabilityService = require('../services/availabilityService');
const validator = require('validator');
const { pool } = require('../config/db');

const getAvailability = async (req, res, next) => {
    try {
        const { year, month } = req.query;
        if (!year || !month) {
            return res.status(400).json({ message: 'Year and month query parameters are required.' });
        }
        // Este servicio ya filtra correctamente por 'confirmed' para la vista del calendario
        const unavailableSlots = await availabilityService.getAvailableSlotsForMonth(parseInt(year), parseInt(month));
        res.json(unavailableSlots);
    } catch (error) {
        next(error);
    }
};

const submitBookingRequest = async (req, res, next) => {
    try {
        let { booking_date, slot_type, name, phone, guest_count, notes } = req.body;
        const NOTES_MAX_LENGTH = 333;

        // Validaciones básicas
        if (!name || !phone || !booking_date || !slot_type) {
             return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos (Nombre, Teléfono, Fecha, Franja Horaria).'
            });
        }

        name = validator.escape(name.trim());
        phone = validator.escape(phone.trim());
        notes = notes ? validator.escape(notes.trim()) : '';

        if (notes.length > NOTES_MAX_LENGTH) {
            return res.status(400).json({
                success: false,
                message: `Las notas adicionales no pueden exceder los ${NOTES_MAX_LENGTH} caracteres.`
            });
        }

        // --- MODIFICACIÓN CLAVE ---
        // Ahora solo buscamos reservas CONFIRMADAS para bloquear una nueva solicitud.
        const existingBookingQuery = `
            SELECT id FROM bookings
            WHERE booking_date = $1 AND slot_type = $2 AND status = 'confirmed'
        `;
        // -------------------------

        const { rows } = await pool.query(existingBookingQuery, [booking_date, slot_type]);

        if (rows.length > 0) {
            // El mensaje ahora solo se muestra si está confirmado
            return res.status(409).json({
                success: false,
                message: 'Lo sentimos, esta fecha y horario ya se encuentran confirmados para otra reserva. Por favor, elige otro.'
            });
        }

        // Si no hay reserva confirmada (puede haber pendientes), se crea la nueva solicitud pendiente.
        const booking = await bookingModel.createBooking({
            name, phone, booking_date, slot_type, guest_count, notes // status por defecto es 'pending'
        });

        res.status(201).json({ success: true, message: 'Booking request submitted successfully.', booking });

    } catch (error) {
         // El error de base de datos por duplicado (23505) ya no debería ocurrir para pendientes
         // gracias a la nueva migración, pero lo dejamos por si acaso.
        if (error.code === '23505') { // unique_violation
             return res.status(409).json({
                success: false,
                message: 'Error: La base de datos impidió crear una reserva duplicada confirmada.'
            });
        }
        if (error.code === '23502') { // not_null_violation
             return res.status(400).json({ success: false, message: 'El campo Teléfono es obligatorio.' });
        }
        next(error); // Pasa otros errores al manejador global
    }
};

// --- Resto de los controladores sin cambios ---
const adminLoginController = async (req, res, next) => {
    try {
        const username = validator.escape(req.body.username.trim());
        const password = req.body.password;

        const admin = await adminModel.verifyAdmin(username, password);
        if (admin) {
            req.session.admin = { id: admin.id, username: admin.username };
            req.session.save((err) => {
                if (err) {
                    return next(err);
                }
                res.json({ success: true, message: 'Admin login successful.', user: admin });
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }
    } catch (error) {
        next(error);
    }
};

const adminLogoutController = (req, res, next) => {
    const cookieOptions = {
      path: '/',
    };

    req.session.destroy(err => {
        if (err) {
            return next(new Error('No se pudo cerrar la sesión, por favor intente de nuevo.'));
        }
        res.clearCookie('quincho-booking.sid', cookieOptions);
        res.status(200).json({ success: true, message: 'Logout successful.' });
    });
};

const checkAdminSessionController = (req, res) => {
    if (req.session && req.session.admin) {
        res.json({ success: true, admin: req.session.admin });
    } else {
        res.status(401).json({ success: false, message: 'No active session.' });
    }
};

const getAllBookingsAdminController = async (req, res, next) => {
    try {
        const searchTerm = req.query.search || '';
        const bookings = await bookingModel.getAllBookings(searchTerm);
        res.json(bookings);
    } catch (error) {
        next(error);
    }
};

const updateBookingStatusAdminController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const status = validator.escape(req.body.status.trim());
        if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Estado inválido.' });
        }
        const updatedBooking = await bookingModel.updateBookingStatus(id, status);
        if (!updatedBooking) {
            return res.status(404).json({ success: false, message: 'Reserva no encontrada.' });
        }
        res.json({ success: true, message: 'Booking status updated.', booking: updatedBooking });
    } catch (error) {
        // --- Manejo Específico para Violación de Unicidad al Confirmar ---
        if (error.code === '23505' && status === 'confirmed') { // unique_violation
            return res.status(409).json({
                success: false,
                message: 'Error: Ya existe otra reserva confirmada para esta fecha y horario. No se puede confirmar esta.'
            });
        }
        // -----------------------------------------------------------------
        next(error);
    }
};


const deleteBookingAdminController = async (req, res, next) => {
    try {
        const { id } = req.params;
        await bookingModel.deleteBooking(id);
        res.json({ success: true, message: 'Booking deleted successfully.' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAvailability,
    submitBookingRequest,
    adminLoginController,
    adminLogoutController,
    checkAdminSessionController,
    getAllBookingsAdminController,
    updateBookingStatusAdminController,
    deleteBookingAdminController
};