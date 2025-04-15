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
