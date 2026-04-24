// JWT authentication middleware
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.decode(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    const role = req.body.role || (req.user && req.user.role);
    if (!role || !roles.includes(role)) {
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
