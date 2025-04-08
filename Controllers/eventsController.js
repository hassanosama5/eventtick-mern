const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: String,
    description: String,
    location: String,
    date: Date,
    price: Number,
    ticketsAvailable: Number,
    ticketsSold: { type: Number, default: 0 },
    status: { type: String, enum: ['approved', 'pending', 'declined'], default: 'pending' },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Event', eventSchema);
const Event = require('../models/Event');

exports.createEvent = async (req, res) => {
  const event = await Event.create({ ...req.body, organizer: req.user._id });
  res.status(201).json(event);
};

exports.getEvents = async (req, res) => {
  const events = await Event.find({ status: 'approved' });
  res.json(events);
};

exports.getEventById = async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ msg: 'Event not found' });
  res.json(event);
};

exports.updateEvent = async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(event);
};

exports.deleteEvent = async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  res.json({ msg: 'Event deleted' });
};
