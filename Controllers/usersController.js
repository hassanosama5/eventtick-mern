const User = require("../models/User");
const Booking = require("../models/Booking");
const Event = require("../models/Event");
<<<<<<< HEAD
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// exports.register = async (req, res) => {
//   try {
//     const { name, email, password, role = 'user' } = req.body;

//     // Validate role
//     if (!['user', 'organizer', 'admin'].includes(role)) {
//       return res.status(400).json({ msg: 'Invalid role' });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       role
//     });

//     // Generate JWT
//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: '5h' }
//     );

//     res.status(201).json({ token });
//   } catch (err) {
//     res.status(400).json({ msg: 'Registration failed', error: err.message });
//   }
// };

// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(401).json({ msg: "Invalid credentials" });
//     }

//     // Check password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ msg: "Invalid credentials" });
//     }

//     // Generate JWT
//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "5h" }
//     );

//     res.json({ token });
//   } catch (err) {
//     res.status(500).json({ msg: "Server error", error: err.message });
//   }
// };

// exports.getProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select("-password");
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ msg: err.message });
//   }
// };

// exports.updateProfile = async (req, res) => {
//   try {
//     // Prevent role updates via this endpoint
//     if (req.body.role) {
//       return res.status(403).json({ msg: "Use admin route to change roles" });
//     }

//     const updatedUser = await User.findByIdAndUpdate(req.user.id, req.body, {
//       new: true,
//       select: "-password",
//     });
//     res.json(updatedUser);
//   } catch (err) {
//     res.status(500).json({ msg: err.message });
//   }
// };
=======

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
>>>>>>> b4e86ace6fd102bab9f8beb83cf73d61fe875253

// Admin: Get all users
exports.getAllUsers = async (req, res) => {
  try {
<<<<<<< HEAD
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Admin access required" });
    }
=======
    if (req.user.role !== "admin") throw new Error("Admin access required");
>>>>>>> b4e86ace6fd102bab9f8beb83cf73d61fe875253
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(403).json({ msg: err.message });
  }
};

// Admin: Get single user
exports.getUserById = async (req, res) => {
  try {
<<<<<<< HEAD
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Admin access required" });
    }
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
=======
    if (req.user.role !== "admin") throw new Error("Admin access required");

    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });

>>>>>>> b4e86ace6fd102bab9f8beb83cf73d61fe875253
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
<<<<<<< HEAD
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Admin access required" });
    }
=======
    if (req.user.role !== "admin") throw new Error("Admin access required");

>>>>>>> b4e86ace6fd102bab9f8beb83cf73d61fe875253
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
<<<<<<< HEAD
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Admin access required" });
    }
=======
    if (req.user.role !== "admin") throw new Error("Admin access required");
>>>>>>> b4e86ace6fd102bab9f8beb83cf73d61fe875253
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: "User deleted" });
  } catch (err) {
    res.status(403).json({ msg: err.message });
  }
};
<<<<<<< HEAD

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
=======
>>>>>>> b4e86ace6fd102bab9f8beb83cf73d61fe875253
