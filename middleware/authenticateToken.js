const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT token and check user role
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization') && req.header('Authorization').replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }

        // Attach the user data (from token) to the request object
        req.user = user;

        // Check if the user has the right role (either 'user' or 'admin')
        if (user.role !== 'user' && user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. You do not have the required permissions.' });
        }

        next(); // Proceed to the next middleware/route handler
    });
};
module.exports = authenticateToken;
