const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

const decodeToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId || null;
  } catch (err) {
    console.error('❌ Invalid token:', err.message);
    return null;
  }
};

const findUsername = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user ? user.name : 'Unknown';
  } catch (err) {
    console.error('❌ Failed to find username:', err.message);
    return 'Unknown';
  }
};

const findUserRole = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user ? user.role : null;
  } catch (err) {
    console.error('❌ Failed to find user role:', err.message);
    return null;
  }
};

module.exports = {
  decodeToken,
  findUsername,
  findUserRole,
};
