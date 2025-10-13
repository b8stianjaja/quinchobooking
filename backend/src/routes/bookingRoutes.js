const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');

// --- Public User Routes ---
router.get('/availability', bookingController.getAvailability);
router.post('/request', bookingController.submitBookingRequest);

// --- Admin Authentication Routes ---
router.post('/admin/login', bookingController.adminLoginController);
// FIX: The logout route is now public, allowing any user to clear their session.
router.post('/admin/logout', bookingController.adminLogoutController);
router.get('/admin/session', bookingController.checkAdminSessionController);

// --- Protected Admin Data Routes (All routes below require a valid session) ---
router.use('/admin', adminAuthMiddleware); // Apply middleware to all subsequent /admin routes
router.get('/admin/bookings', bookingController.getAllBookingsAdminController);
router.put('/admin/bookings/:id', bookingController.updateBookingStatusAdminController);
router.delete('/admin/bookings/:id', bookingController.deleteBookingAdminController);

module.exports = router;