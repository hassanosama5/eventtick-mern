const User = require("../models/User");
const Booking = require("../models/Booking");
const Event = require("../models/Event");

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Update profile (non-admin)
exports.updateProfile = async (req, res) => {
  try {
    if (req.body.role) {
      return res.status(403).json({ msg: "Role changes require admin access" });
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
      select: "-password",
    });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Admin: Get all users
exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") throw new Error("Admin access required");
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(403).json({ msg: err.message });
  }
};

// Admin: Get single user
exports.getUserById = async (req, res) => {
  try {
    if (req.user.role !== "admin") throw new Error("Admin access required");

    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json(user);
  } catch (err) {
    res
      .status(err.message.includes("Admin") ? 403 : 500)
      .json({ msg: err.message });
  }
};

// Admin: Update user role
exports.updateUserRole = async (req, res) => {
  try {
    if (req.user.role !== "admin") throw new Error("Admin access required");

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true, select: "-password" }
    );
    res.json(user);
  } catch (err) {
    res.status(403).json({ msg: err.message });
  }
};

// Admin: Delete user
exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") throw new Error("Admin access required");
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: "User deleted" });
  } catch (err) {
    res.status(403).json({ msg: err.message });
  }
};
