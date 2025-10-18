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
        const unavailableSlots = await availabilityService.getAvailableSlotsForMonth(parseInt(year), parseInt(month));
        res.json(unavailableSlots);
    } catch (error) {
        next(error);
    }
};

const submitBookingRequest = async (req, res, next) => {
    try {
        // Se elimina 'email' de la destructuración
        let { booking_date, slot_type, name, phone, guest_count, notes } = req.body;

        // Validaciones básicas (puedes añadir más si necesitas)
        if (!name || !phone || !booking_date || !slot_type) {
             return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos (Nombre, Teléfono, Fecha, Franja Horaria).'
            });
        }

        name = validator.escape(name.trim());
        // Se elimina la normalización de 'email'
        phone = validator.escape(phone.trim()); // Teléfono ahora es requerido
        notes = notes ? validator.escape(notes.trim()) : '';

        const existingBookingQuery = `
            SELECT id FROM bookings
            WHERE booking_date = $1 AND slot_type = $2 AND (status = 'pending' OR status = 'confirmed')
        `;
        const { rows } = await pool.query(existingBookingQuery, [booking_date, slot_type]);

        if (rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Lo sentimos, esta fecha y horario ya han sido reservados. Por favor, refresca el calendario y elige otro.'
            });
        }

        // Se pasa el objeto a createBooking sin 'email'
        const booking = await bookingModel.createBooking({
            name, phone, booking_date, slot_type, guest_count, notes
        });

        res.status(201).json({ success: true, message: 'Booking request submitted successfully.', booking });

    } catch (error) {
        // Manejo de errores específicos de validación o base de datos si es necesario
        if (error.code === '23502') { // Error de columna NOT NULL (si phone fuera null)
             return res.status(400).json({ success: false, message: 'El campo Teléfono es obligatorio.' });
        }
        next(error); // Pasa otros errores al manejador global
    }
};

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
        const bookings = await bookingModel.getAllBookings();
        res.json(bookings);
    } catch (error) {
        next(error);
    }
};

const updateBookingStatusAdminController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const status = validator.escape(req.body.status.trim());
        // Asegurarse que el status es uno de los permitidos
        if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Estado inválido.' });
        }
        const updatedBooking = await bookingModel.updateBookingStatus(id, status);
        if (!updatedBooking) {
            return res.status(404).json({ success: false, message: 'Reserva no encontrada.' });
        }
        res.json({ success: true, message: 'Booking status updated.', booking: updatedBooking });
    } catch (error) {
        next(error);
    }
};

const deleteBookingAdminController = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Podrías verificar si la reserva existe antes de intentar borrarla
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