const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware'); // This will be the session-checking middleware

// --- Public User Routes ---
router.get('/availability', bookingController.getAvailability);
router.post('/request', bookingController.submitBookingRequest);

// --- Admin Authentication Routes (Not protected by adminAuthMiddleware itself) ---
router.post('/admin/login', bookingController.adminLoginController);
router.post('/admin/logout', bookingController.adminLogoutController);
router.get('/admin/session', bookingController.checkAdminSessionController); // Useful for frontend to check login status

// --- Protected Admin Data Routes (Protected by session-checking adminAuthMiddleware) ---
router.get('/admin/bookings', adminAuthMiddleware, bookingController.getAllBookingsAdminController);
router.put('/admin/bookings/:id', adminAuthMiddleware, bookingController.updateBookingStatusAdminController);
router.delete('/admin/bookings/:id', adminAuthMiddleware, bookingController.deleteBookingAdminController);

module.exports = router;