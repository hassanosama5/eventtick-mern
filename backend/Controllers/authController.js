const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Generate JWT Token
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register a new user
// @route   POST /api/v1/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log("Registration attempt for:", email);

    // Validate input
    if (!name || !email || !password) {
      console.log("Missing required fields in body");
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log("User already exists:", email);
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("Password hashed successfully");

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "standard",
    });

    if (!user) {
      console.log("Failed to create user in DB");
      throw new Error("Failed to create user");
    }

    console.log("User created successfully:", {
      id: user._id,
      email: user.email,
    });

    try {
      // Generate token
      const token = generateToken(user);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token, //momkn nshelha bs ana saybha ashan tezhar fe postman bs kda kda use cookies
        },
      });
    } catch (tokenError) {
      console.error("Token generation error:", tokenError);
      // Even if token generation fails, user was created
      return res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          message: "User created but token generation failed",
        },
      });
    }
  } catch (error) {
    console.error("Registration error in catch block:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Login user
// @route   POST /api/v1/login
// @route   POST /api/v1/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for:", email);

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user and explicitly select password
    console.log("Finding user with email:", email);
    const user = await User.findOne({ email }).select("+password");
    console.log("User found:", !!user);

    if (!user) {
      console.log("No user found with this email");
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    console.log("Stored hashed password:", user.password);
    console.log("Attempting password comparison with:", password);

    // Verify password using bcrypt directly
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match result:", isMatch);

    if (!isMatch) {
      console.log("Password does not match");
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    console.log("Login successful");

    // Generate token
    const token = generateToken(user);

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token,
        },
      });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "tazkarti.seproject@gmail.com",
    pass: "jafk bvjg rdzq wltb",
  },
});

// transporter.sendMail(
//   {
//     from: '"GIU-Team-1" <tazkarti.seproject@gmail.com>',
//     to: "hassanosama085@gmail.com",
//     subject: "Test OTP",
//     text: "Your OTP is 123456",
//   },
//   (err) => {
//     if (err) console.error("Error:", err);
//     else console.log("Email sent!");
//   }
// );

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate and store OTP
    const otp = generateOTP();
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 600000; // 10 mins
    await user.save();

    // Send OTP via email
    const mailOptions = {
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP is ${otp}. Valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "OTP sent to email",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error processing request",
    });
  }
};

// Step 2: Verify OTP and allow password reset
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid/expired OTP",
      });
    }

    // Generate temporary token for password reset
    const tempToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    res.json({
      success: true,
      token: tempToken,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};

// Step 3: Reset password (after OTP verification)
exports.resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    console.log("Password reset attempt for user:", req.user.id);

    // Basic validation (minimum 6 characters)
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    console.log("New password hashed successfully");

    // Update user document
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: { password: hashedPassword },
        $unset: {
          resetPasswordOTP: "",
          resetPasswordExpires: "",
        },
      },
      { new: true } // Return the updated document
    );

    // Verify update was successful
    if (!updatedUser) {
      console.log("User not found during password reset");
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("Password reset successful for user:", updatedUser.email);

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({
      success: false,
      message: "Password reset failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// controllers/authController.js
exports.logout = (req, res) => {
  try {
    // 1. Clear the HTTP-only cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // 2. Send success response
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};
