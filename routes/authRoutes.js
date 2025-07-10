const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getProfile,
  getUsersByRole,
  getAllUsers
} = require('../controllers/authController'); 
const authMiddleware = require('../middleware/authMiddleware'); 

const checkRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Insufficient role.' });
    }
    next(); 
  };
};


router.post('/register', register);
router.post('/login', login);
router.get('/users', getAllUsers);
router.get('/users/role/:role', getUsersByRole);




module.exports = router;
