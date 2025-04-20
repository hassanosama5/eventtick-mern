const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (user) => {
<<<<<<< HEAD
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
=======
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
>>>>>>> b4e86ace6fd102bab9f8beb83cf73d61fe875253
};

// @desc    Register a new user
// @route   POST /api/v1/register
exports.register = async (req, res) => {
  try {
<<<<<<< HEAD
    const { name, email, password, role } = req.body;
    console.log('Registration attempt for:', email);

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }

    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('Password hashed successfully');

    // Create user
=======
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
>>>>>>> b4e86ace6fd102bab9f8beb83cf73d61fe875253
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
<<<<<<< HEAD
      role: role || 'standard'
    });

    if (user) {
      console.log('User created successfully:', {
        id: user._id,
        email: user.email,
        hashedPassword: user.password
      });

      // Generate token
      const token = generateToken(user);

      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token
        }
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
=======
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
>>>>>>> b4e86ace6fd102bab9f8beb83cf73d61fe875253
    });
  }
};

<<<<<<< HEAD
// @desc    Login user
// @route   POST /api/v1/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    // Find user and explicitly select password
    console.log('Finding user with email:', email);
    const user = await User.findOne({ email });
    console.log('User found:', !!user);

    if (!user) {
      console.log('No user found with this email');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    console.log('Stored hashed password:', user.password);
    console.log('Attempting password comparison');

    // Verify password using bcrypt directly
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.log('Password does not match');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    console.log('Login successful');

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
=======
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
>>>>>>> b4e86ace6fd102bab9f8beb83cf73d61fe875253
  }
};
