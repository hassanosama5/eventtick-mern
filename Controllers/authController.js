const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

exports.register = async (req, res) => {
  try {
    // 1. Validate request body exists
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        msg: "Request body is empty",
      });
    }

    // 2. Destructure with defaults
    const {
      name = null,
      email = null,
      password = null,
      role = "user",
    } = req.body;

    // 3. Validate required fields
    if (!name || !email || !password) {
      const missingFields = [];
      if (!name) missingFields.push("name");
      if (!email) missingFields.push("email");
      if (!password) missingFields.push("password");

      return res.status(400).json({
        success: false,
        msg: "Missing required fields",
        missingFields,
      });
    }

    // 4. Validate role
    const allowedRoles = ["user", "organizer", "admin"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid role specified",
        allowedRoles,
      });
    }

    // 5. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid email format",
      });
    }

    // 6. Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        msg: "Password must be at least 6 characters",
      });
    }

    // 7. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 8. Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // 9. Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // 10. Return success response
    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Registration Error:", err);

    // Handle duplicate email error
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        msg: "Email already exists",
      });
    }

    // Handle validation errors
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        msg: "Validation failed",
        errors,
      });
    }

    // Generic server error
    return res.status(500).json({
      success: false,
      msg: "Server error during registration",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    res.json({ token: generateToken(user) });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
