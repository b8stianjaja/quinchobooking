// backend/src/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');

// --- Public User Routes ---
// These are for your customers.
router.get('/availability', bookingController.getAvailability);
router.post('/request', bookingController.submitBookingRequest);

// --- Admin Authentication Routes (Public) ---
// These routes MUST be public so the admin can log in and out.
router.post('/admin/login', bookingController.adminLoginController);
router.post('/admin/logout', bookingController.adminLogoutController);
router.get('/admin/session', bookingController.checkAdminSessionController);

// --- Protected Admin Data Routes (Private) ---
// These routes handle sensitive data and are now correctly protected by the middleware.
router.get('/admin/bookings', adminAuthMiddleware, bookingController.getAllBookingsAdminController);
router.put('/admin/bookings/:id', adminAuthMiddleware, bookingController.updateBookingStatusAdminController);
router.delete('/admin/bookings/:id', adminAuthMiddleware, bookingController.deleteBookingAdminController);

module.exports = router;