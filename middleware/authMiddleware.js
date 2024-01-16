const jwt = require('jsonwebtoken');
const authenticateUser = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Authorization denied. No token provided.' });
  }

  try {
    
    const secretKey = '#7kfE*4tGz$LQW9!sP@u2MxY6vJhNpC';
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded.user;
    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'Access denied. Not authorized as a user.' });
    }
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

module.exports = { authenticateUser };

