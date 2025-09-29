// quincho-booking-backend/src/middleware/adminAuthMiddleware.js

const adminAuthMiddleware = (req, res, next) => {
    // ** FIX: Check for 'req.session.admin' to match what's set during login. **
    if (req.session && req.session.admin && req.session.admin.username) {
        next();
    } else {
        res.status(401).json({ success: false, message: 'Unauthorized: You must be logged in to access this resource.' });
    }
};

module.exports = adminAuthMiddleware;