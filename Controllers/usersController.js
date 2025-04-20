const User = require("../models/User");
const Booking = require("../models/Booking");
const Event = require("../models/Event");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Admin-only routes
exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Admin access required" });
    }
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Admin access required" });
    }
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Admin access required" });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true, select: "-password" }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Admin access required" });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: "User deleted" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate(
      "event"
    );
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.getOrganizerEvents = async (req, res) => {
  try {
    if (req.user.role !== "organizer") {
      return res.status(403).json({ msg: "Organizer access required" });
    }
    const events = await Event.find({ organizer: req.user._id });
    res.json(events);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.getEventAnalytics = async (req, res) => {
  try {
    if (req.user.role !== "organizer") {
      return res.status(403).json({ msg: "Organizer access required" });
    }
    const events = await Event.find({ organizer: req.user._id });
    const analytics = await Promise.all(
      events.map(async (event) => {
        const total = event.totalTickets;
        const booked = total - event.availableTickets;
        const percent = total ? (booked / total) * 100 : 0;
        return { title: event.title, percent: percent.toFixed(2) };
      })
    );
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
