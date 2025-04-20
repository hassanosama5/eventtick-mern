<<<<<<< HEAD
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
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

// Authorize middleware (role-based access)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }

    next();
  };
};
=======
const asyncHandler = require("express-async-handler");

const authorize = (roles) => {
  return asyncHandler(async (req, res, next) => {
    // 1. Check if user exists (should be attached by protect middleware)
    if (!req.user) {
      res.status(401);
      throw new Error("Not authenticated");
    }

    // 2. Check if user has required role
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(
        `Not authorized. Required roles: ${roles.join(", ")}. Your role: ${
          req.user.role
        }`
      );
    }

    next();
  });
};

module.exports = { authorize };
>>>>>>> b4e86ace6fd102bab9f8beb83cf73d61fe875253
