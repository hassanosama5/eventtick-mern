const router = require("express").Router(); // ✅ Declare first
const { register, login } = require("../Controllers/authController"); // ✅ Import controllers

// 🔥 Define routes
router.post("/register", register);
router.post("/login", login);

// ✅ Export AFTER defining everything
module.exports = router;
