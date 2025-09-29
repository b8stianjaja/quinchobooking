// backend/src/controllers/bookingController.js

const bookingModel = require('../models/bookingModel');
const adminModel = require('../models/adminModel');
const availabilityService = require('../services/availabilityService');

// Implemented to use the availability service
const getAvailability = async (req, res, next) => {
    try {
        const { year, month } = req.query; // Expects year and month as query params
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


const adminLoginController = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const admin = await adminModel.verifyAdmin(username, password);
        if (admin) {
            req.session.admin = { id: admin.id, username: admin.username };
            res.json({ success: true, message: 'Admin login successful.', user: admin });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }
    } catch (error) {
        next(error);
    }
};

const adminLogoutController = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Could not log out, please try again.' });
        }
        res.clearCookie('connect.sid');
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