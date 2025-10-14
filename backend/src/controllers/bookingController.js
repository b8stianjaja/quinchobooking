const bookingModel = require('../models/bookingModel');
const adminModel = require('../models/adminModel');
const availabilityService = require('../services/availabilityService');
const validator = require('validator'); // Usado para sanitización (anti-XSS)

// Importamos el pool de la base de datos para hacer una verificación directa.
const { pool } = require('../config/db');

// Define la condición para SameSite y Secure de forma consistente (DEBE coincidir con app.js)
const IS_DEPLOYED_ENV = process.env.NODE_ENV === 'production' || !!process.env.FRONTEND_URL;


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
        // Desestructuramos y sanitizamos inmediatamente la data del cuerpo
        let { booking_date, slot_type, name, email, phone, guest_count, notes } = req.body;

        // --- MEJORA DE SEGURIDAD (SANITIZACIÓN ANTI-XSS) ---
        name = validator.escape(name.trim());
        email = validator.normalizeEmail(email.trim()) || email; 
        phone = validator.escape(phone.trim());
        notes = validator.escape(notes.trim());
        // --- FIN DE LA MEJORA DE SEGURIDAD ---

        // 1. Verificamos si ya existe una reserva activa para ese slot.
        const existingBookingQuery = `
            SELECT id FROM bookings
            WHERE booking_date = $1 AND slot_type = $2 AND (status = 'pending' OR status = 'confirmed')
        `;
        const { rows } = await pool.query(existingBookingQuery, [booking_date, slot_type]);

        // 2. Si encontramos una, devolvemos un error amigable.
        if (rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Lo sentimos, esta fecha y horario ya han sido reservados. Por favor, refresca el calendario y elige otro.'
            });
        }
        
        // 3. Creamos la reserva con datos sanitizados.
        const booking = await bookingModel.createBooking({
            name, email, phone, booking_date, slot_type, guest_count, notes
        });

        res.status(201).json({ success: true, message: 'Booking request submitted successfully.', booking });

    } catch (error) {
        next(error);
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
    // CRÍTICO: Opciones de cookie para clearCookie DEBEN coincidir exactamente con las opciones de creación.
    const cookieOptions = {
      path: '/',
      secure: IS_DEPLOYED_ENV, 
      httpOnly: true, 
      sameSite: IS_DEPLOYED_ENV ? 'none' : 'lax', 
    };
    
    // Si estamos en un entorno de despliegue, también configuramos el dominio para la eliminación
    if (IS_DEPLOYED_ENV && process.env.FRONTEND_URL) {
        try {
            const url = new URL(process.env.FRONTEND_URL);
            // Esto permite que la cookie sea eliminada correctamente en subdominios o dominios raíz.
            cookieOptions.domain = '.' + url.hostname.replace(/^www\./, ''); 
        } catch (e) {
            console.error('Could not parse FRONTEND_URL for logout cookie domain', e);
        }
    }

    req.session.destroy(err => {
        if (err) {
            return next(new Error('Could not log out, please try again.'));
        }
        
        // Se llama clearCookie con las opciones CRÍTICAS (Secure, HttpOnly, SameSite, Domain)
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
        const status = validator.escape(req.body.status.trim()); // Sanitización
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