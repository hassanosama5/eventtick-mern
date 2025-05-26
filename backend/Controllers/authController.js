const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

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

// @desc    Register a new admin
// @route   POST /api/v1/auth/admin/register
exports.adminRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("Admin registration attempt for:", email);

    // Validate input
    if (!name || !email || !password) {
      console.log("Missing required fields in body for admin registration");
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields (name, email, password)",
      });
    }

    // Check if user (admin) already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log("User (admin) already exists:", email);
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("Password hashed successfully for admin registration");

    // Create user with admin role
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin", // Explicitly set role to admin
    });

    if (!user) {
      console.log("Failed to create admin user in DB");
      throw new Error("Failed to create admin user");
    }

    console.log("Admin user created successfully:", {
      id: user._id,
      email: user.email,
    });

    try {
      // Generate token for the newly created admin
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
          token, // Return token for immediate use if needed, but rely on cookies
        },
      });
    } catch (tokenError) {
      console.error("Token generation error after admin creation:", tokenError);
      // Even if token generation fails, admin user was created
      return res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          message: "Admin user created but token generation failed",
        },
      });
    }
  } catch (error) {
    console.error("Admin registration error in catch block:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during admin registration",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Login user
// @route   POST /api/v1/login
// @route   POST /api/v1/login
// Modify your login function to handle MFA
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
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (user.mfaEnabled) {
      // Set temp MFA verification cookie instead of returning token
      const tempToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "5m",
      });

      res
        .cookie("mfa_verification", tempToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 300000, // 5 minutes
        })
        .json({
          success: true,
          mfaRequired: true,
          message: "MFA authentication required",
        });
    }

    // If no MFA, proceed with regular login
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

// @desc    Generate MFA secret and QR code
// @route   GET /api/v1/mfa/setup
exports.generateMFASecret = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate a secret
    const secret = speakeasy.generateSecret({
      name: `Tazkarti (${user.email})`,
    });

    // Generate QR code URL
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Save the secret temporarily (don't enable MFA yet)
    user.mfaSecret = secret.base32;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        qrCodeUrl,
        secret: secret.base32, // For manual entry if needed
        mfaEnabled: user.mfaEnabled,
      },
    });
  } catch (error) {
    console.error("MFA setup error:", error);
    res.status(500).json({
      success: false,
      message: "Error setting up MFA",
    });
  }
};

// @desc    Verify MFA setup
// @route   POST /api/v1/mfa/verify
exports.verifyMFASetup = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.id).select("+mfaSecret");

    if (!user || !user.mfaSecret) {
      return res.status(400).json({
        success: false,
        message: "MFA not set up for this user",
      });
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: "base32",
      token,
      window: 1, // Allow 1 step (30s) in either direction
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: "Invalid MFA token",
      });
    }

    // Generate recovery codes
    const recoveryCodes = Array.from({ length: 8 }, () =>
      crypto.randomBytes(4).toString("hex").toUpperCase()
    );

    // Enable MFA for the user
    user.mfaEnabled = true;
    user.mfaRecoveryCodes = recoveryCodes;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        recoveryCodes, // Important! Show these to the user once
        mfaEnabled: user.mfaEnabled,
      },
    });
  } catch (error) {
    console.error("MFA verification error:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying MFA setup",
    });
  }
};

// @desc    Disable MFA
// @route   POST /api/v1/mfa/disable
exports.disableMFA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.mfaEnabled = false;
    user.mfaSecret = undefined;
    user.mfaRecoveryCodes = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "MFA disabled successfully",
      data: {
        mfaEnabled: false,
      },
    });
  } catch (error) {
    console.error("MFA disable error:", error);
    res.status(500).json({
      success: false,
      message: "Error disabling MFA",
    });
  }
};

// @desc    Verify MFA token during login
// @route   POST /api/v1/mfa/validate
exports.validateMFAToken = async (req, res) => {
  try {
    const { email, token } = req.body;
    const tempToken = req.cookies.mfa_verification; // Get from cookie

    // Verify temp token first
    if (!tempToken) {
      return res.status(401).json({
        success: false,
        message: "MFA session expired or invalid",
      });
    }

    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded.id,
      email,
    }).select("+mfaSecret +mfaRecoveryCodes");

    if (!user || !user.mfaEnabled) {
      return res.status(400).json({
        success: false,
        message: "MFA not enabled for this user",
      });
    }

    // Check recovery codes first
    if (user.mfaRecoveryCodes.includes(token)) {
      user.mfaRecoveryCodes = user.mfaRecoveryCodes.filter((c) => c !== token);
      await user.save();

      const authToken = generateToken(user);

      return res
        .clearCookie("mfa_verification")
        .cookie("token", authToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .json({
          success: true,
          data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            usedRecoveryCode: true,
          },
        });
    }

    // Verify TOTP code
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: "base32",
      token,
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: "Invalid MFA token",
      });
    }

    // Successful verification
    const authToken = generateToken(user);

    res
      .clearCookie("mfa_verification")
      .cookie("token", authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
  } catch (error) {
    console.error("MFA validation error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "MFA session expired",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid MFA session",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error validating MFA token",
    });
  }
};
