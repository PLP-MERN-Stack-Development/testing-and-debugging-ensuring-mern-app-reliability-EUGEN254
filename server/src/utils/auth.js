// src/utils/auth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user._id.toString(), // Use 'userId' to match middleware
      username: user.username 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = { generateToken, verifyToken, JWT_SECRET };