const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1y' } 
  );




exports.register = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    const token = generateToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = generateToken(user);
  res.json({ token, user });
};


exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); 
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};


exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;

    const users = await User.find({ role }).select('-password'); 

    if (users.length === 0) {
      return res.status(404).json({ message: `No users found with role: ${role}` });
    }

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users by role' });
  }
};



exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const users = await User.find({ role }).select('-password'); 
    if (users.length === 0) {
      return res.status(404).json({ message: `No users found with role: ${role}` });
    }
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users by role' });
  }
};
