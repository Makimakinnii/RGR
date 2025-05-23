// ONLINE-STORE/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Щоб завантажити JWT_SECRET з .env

const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) {
        return res.status(401).json({ message: 'Token not provided' }); // Немає токена
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error("JWT Error:", err.message);
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired' });
            }
            return res.status(403).json({ message: 'Token is not valid' }); // Недійсний токен
        }
        req.user = user; // Додаємо розшифровані дані користувача до запиту
        next(); // Перехід до наступного middleware або обробника маршруту
    });
}

function authorizeRole(roles) { // roles - це масив, наприклад ['ADMIN'] або ['USER', 'ADMIN']
    return (req, res, next) => {
        if (!req.user || !req.user.roles) {
            return res.status(403).json({ message: 'Access denied. User roles not found.' });
        }
        
        const hasRole = roles.some(role => req.user.roles.includes(role));
        if (!hasRole) {
            return res.status(403).json({ message: `Access denied. Required role: ${roles.join(' or ')}` });
        }
        next();
    };
}

module.exports = {
    authenticateToken,
    authorizeRole
};