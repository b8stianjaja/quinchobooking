// backend/src/controllers/bookingController.js

const bookingModel = require('../models/bookingModel');
const adminModel = require('../models/adminModel');
const availabilityService = require('../services/availabilityService');

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
        const booking = await bookingModel.createBooking(req.body);
        res.status(201).json({ success: true, message: 'Booking request submitted successfully.', booking });
    } catch (error) {
        next(error);
    }
};

// --- START: THE DEFINITIVE FIX ---
const adminLoginController = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const admin = await adminModel.verifyAdmin(username, password);
        if (admin) {
            // Set the session data
            req.session.admin = { id: admin.id, username: admin.username };

            // Explicitly save the session to the database and wait for it to complete
            req.session.save((err) => {
                if (err) {
                    // If there's an error saving the session, pass it to the error handler
                    return next(err);
                }
                // Once the session is saved, send the success response
                res.json({ success: true, message: 'Admin login successful.', user: admin });
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }
    } catch (error) {
        next(error);
    }
};
// --- END: THE DEFINITIVE FIX ---

const adminLogoutController = (req, res, next) => {
    req.session.destroy(err => {
        if (err) {
            // If there's an error, pass it to the error handler instead of sending a response here
            return next(new Error('Could not log out, please try again.'));
        }
        // Ensure the cookie is cleared on the client side
        res.clearCookie('quincho-booking.sid');
        res.json({ success: true, message: 'Logout successful.' });
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