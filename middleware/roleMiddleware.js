// Make sure this file exists and is not empty!

module.exports = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Insufficient role.' });
    }
    next();
  };
};
