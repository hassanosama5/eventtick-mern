const express = require("express");
const router = express.Router();
const authController = require("../Controllers/authController");
const { protect, authorize } = require("../Middleware/authorizationMiddleware");

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Authentication routes
router.post('/register', asyncHandler(async (req, res) => {
  console.log('Register route hit with body:', req.body);
  await authController.register(req, res);
}));

router.post('/login', asyncHandler(async (req, res) => {
  console.log('Login route hit with body:', req.body);
  await authController.login(req, res);
}));

// Password reset routes
router.put("/forgotPassword", asyncHandler(authController.forgotPassword));
router.post("/verify-otp", asyncHandler(authController.verifyOTP));
router.put("/reset-password", protect, asyncHandler(authController.resetPassword));

// Test routes for different roles
router.get("/test/public", (req, res) => {
  res.json({
    success: true,
    message: "Public route - accessible by anyone",
  });
});

router.get('/test/user', 
  protect,
  asyncHandler(async (req, res) => {
    res.json({ 
      success: true,
      message: 'Protected route - accessible by any authenticated user',
      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role
        }
      }
    });
  })
);

router.get('/test/organizer', 
  protect,
  authorize('organizer', 'admin'),
  asyncHandler(async (req, res) => {
    res.json({ 
      success: true,
      message: 'Organizer route - accessible by organizers and admins only',
      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role
        }
      }
    });
  })
);

router.get('/test/admin', 
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    res.json({ 
      success: true,
      message: 'Admin route - accessible by admins only',
      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role
        }
      }
    });
  })
);

module.exports = router;
