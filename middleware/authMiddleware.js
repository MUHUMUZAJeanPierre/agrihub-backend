const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("🔐 Incoming Auth Header:", authHeader);

  const token = authHeader?.split(' ')[1];
  if (!token) {
    console.log("🚫 No token found.");
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token decoded:", decoded);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    res.status(401).json({ error: 'Invalid token' });
  }
};

