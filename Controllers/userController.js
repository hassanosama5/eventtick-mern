const User = require('../models/User');
const Booking = require('../models/Booking');
const Event = require('../models/Event');

exports.getProfile = (req, res) => res.json(req.user);

exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user);
};

exports.updateUserRole = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
  res.json(user);
};

exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ msg: 'User deleted' });
};

exports.getUserBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id }).populate('event');
  res.json(bookings);
};

exports.getOrganizerEvents = async (req, res) => {
  const events = await Event.find({ organizer: req.user._id });
  res.json(events);
};

exports.getEventAnalytics = async (req, res) => {
  const events = await Event.find({ organizer: req.user._id });
  const analytics = await Promise.all(events.map(async (event) => {
    const total = event.totalTickets;
    const booked = total - event.availableTickets;
    const percent = total ? (booked / total) * 100 : 0;
    return { title: event.title, percent: percent.toFixed(2) };
  }));
  res.json(analytics);
};
