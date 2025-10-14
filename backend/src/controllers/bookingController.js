// backend/src/controllers/bookingController.js
const bookingModel = require('../models/bookingModel');
const adminModel = require('../models/adminModel');
const availabilityService = require('../services/availabilityService');
const validator = require('validator'); // Importamos la librería de sanitización

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
        let { booking_date, slot_type, name, email, phone, guest_count, notes } = req.body;

        // --- INICIO DE LA MEJORA DE SEGURIDAD (SANITIZACIÓN) ---
        // Aplicamos sanitización para prevenir XSS persistente.
        // La función 'escape' convierte caracteres HTML especiales (<, >, ', ", /) 
        // a sus entidades HTML correspondientes, neutralizando el código malicioso.
        name = validator.escape(name.trim());
        email = validator.normalizeEmail(email.trim()) || email; // Normaliza y limpia el email
        phone = validator.escape(phone.trim());
        notes = validator.escape(notes.trim());
        // --- FIN DE LA MEJORA DE SEGURIDAD ---

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
        // --- FIN DE LA COMPROBACIÓN DE CONFLICTO ---

        // 3. Si no hay conflicto, procedemos a crear la reserva con los datos sanitizados.
        const booking = await bookingModel.createBooking({
            name, email, phone, booking_date, slot_type, guest_count, notes
        });

        res.status(201).json({ success: true, message: 'Booking request submitted successfully.', booking });

    } catch (error) {
        // Si aun así ocurre un error, lo pasamos al manejador de errores.
        next(error);
    }
};

const adminLoginController = async (req, res, next) => {
    try {
        // Sanitizamos el username antes de la verificación (prevención de XSS en la interfaz de login, aunque es menos crítico aquí)
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
        // NOTA: La salida de la BD (bookings) se asume limpia porque fue sanitizada en la entrada.
        const bookings = await bookingModel.getAllBookings();
        res.json(bookings);
    } catch (error) {
        next(error);
    }
};

const updateBookingStatusAdminController = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Sanitizamos la entrada del estado para evitar inyecciones de datos no válidos, aunque no es XSS.
        const status = validator.escape(req.body.status.trim()); 
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
