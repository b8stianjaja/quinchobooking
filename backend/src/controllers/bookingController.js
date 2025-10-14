// backend/src/controllers/bookingController.js
const bookingModel = require('../models/bookingModel');
const adminModel = require('../models/adminModel');
const availabilityService = require('../services/availabilityService');

// Importamos el pool de la base de datos para hacer una verificación directa.
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
        const { booking_date, slot_type } = req.body;

        // --- INICIO DE LA MEJORA ---
        // 1. Verificamos si ya existe una reserva (pendiente o confirmada) para ese slot.
        const existingBookingQuery = `
            SELECT id FROM bookings
            WHERE booking_date = $1 AND slot_type = $2 AND (status = 'pending' OR status = 'confirmed')
        `;
        const { rows } = await pool.query(existingBookingQuery, [booking_date, slot_type]);

        // 2. Si encontramos una, devolvemos un error amigable.
        if (rows.length > 0) {
            return res.status(409).json({ // 409 Conflict es el código de estado apropiado
                success: false,
                message: 'Lo sentimos, esta fecha y horario ya han sido reservados. Por favor, refresca el calendario y elige otro.'
            });
        }
        // --- FIN DE LA MEJORA ---

        // 3. Si no hay conflicto, procedemos a crear la reserva.
        const booking = await bookingModel.createBooking(req.body);
        res.status(201).json({ success: true, message: 'Booking request submitted successfully.', booking });

    } catch (error) {
        // Si aun así ocurre un error (muy improbable), lo pasamos al manejador de errores.
        next(error);
    }
};

const adminLoginController = async (req, res, next) => {
    try {
        const { username, password } = req.body;
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
    if (process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL) {
        try {
            const url = new URL(process.env.FRONTEND_URL);
            cookieOptions.domain = '.' + url.hostname.replace(/^www\./, '');
        } catch (e) {
            console.error('Could not parse FRONTEND_URL for logout cookie domain', e);
        }
    }

    req.session.destroy(err => {
        if (err) {
            return next(new Error('Could not log out, please try again.'));
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
        const { status } = req.body;
        const updatedBooking = await bookingModel.updateBookingStatus(id, status);
        res.json({ success: true, message: 'Booking status updated.', booking: updatedBooking });
    } catch (error) {
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