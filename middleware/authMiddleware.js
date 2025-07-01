const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("🔐 Incoming Auth Header:", authHeader);

  const token = authHeader?.split(' ')[1];
  if (!token) {
    console.log("🚫 No token found.");
    return res.status(401).json({ error: 'Unauthorized - No token provided' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token decoded:", decoded);

    // Retrieve user from database
    const user = await User.findById(decoded.id).select('-password');
    
    // If the user is not found, return an error
    if (!user) {
      console.log("🚫 User not found for the decoded ID:", decoded.id);
      return res.status(404).json({ error: 'User not found' });
    }

    // Attach user info to req.user
    req.user = user;
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    res.status(401).json({ error: 'Invalid token' });
  }
};
