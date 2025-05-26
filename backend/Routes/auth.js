const express = require("express");
const router = express.Router();
const authController = require("../Controllers/authController");
const { protect, authorize } = require("../Middleware/authMiddleware");

// Authentication routes
router.post("/register", authController.register);
router.post("/admin/register", authController.adminRegister);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

router.get("/me", (req, res) => {
  if (req.user) {
    return res.json(req.user);
  } else {
    return res.status(401).json({ message: "Not authenticated" });
  }
});

//{ forgotPass maasooma 3 steps
router.put("/forgotPassword", authController.forgotPassword); // Step 1
router.post("/verify-otp", authController.verifyOTP); // Step 2
router.put("/reset-password", protect, authController.resetPassword); // Step 3
//} //hateen hena protect ashan elmfrod after verifying el otp ykoon maah tokennn (flcookie)

// ========== MFA Routes ========== //
// MFA Setup Flow
router.get("/mfa/setup", protect, authController.generateMFASecret); // Get QR code
router.post("/mfa/verify", protect, authController.verifyMFASetup); // Verify setup

// MFA Validation (during login)
router.post("/mfa/validate", authController.validateMFAToken); // No protect middleware (uses temp token)

// MFA Management
router.post("/mfa/disable", protect, authController.disableMFA); // Turn off MFA

// Test routes for different roles
router.get("/test/public", (req, res) => {
  res.json({
    success: true,
    message: "Public route - accessible by anyone",
  });
});

router.get("/test/user", protect, (req, res) => {
  res.json({
    success: true,
    message: "Protected route - accessible by any authenticated user",
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    },
  });
});

router.get(
  "/test/organizer",
  protect,
  authorize("organizer", "admin"),
  (req, res) => {
    res.json({
      success: true,
      message: "Organizer route - accessible by organizers and admins only",
      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
        },
      },
    });
  }
);

router.get("/test/admin", protect, authorize("admin"), (req, res) => {
  res.json({
    success: true,
    message: "Admin route - accessible by admins only",
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    },
  });
});

module.exports = router;
