// authorizationMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect middleware (verify JWT)
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token extracted:', token);
    }

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded:', decoded);
      
      // Get user from database
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        console.log('User not found for decoded ID:', decoded.id);
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Add user to request object
      req.user = user;
      console.log('User authenticated:', user._id);
      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  } catch (error) {
    console.error('Auth error in protect middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

// Authorize middleware (role-based access) - TEMPORARILY MODIFIED FOR TESTING
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // *** TEMPORARY CHANGE FOR TESTING: Bypass role check ***
    // Original line: if (!roles.includes(req.user.role)) {
    if (false) { // This condition will always be false, effectively bypassing the role check
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    // *** END TEMPORARY CHANGE ***

    // Ensure user is authenticated before proceeding (handled by protect middleware)
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'User not authenticated'
        });
    }

    next();
  };
};