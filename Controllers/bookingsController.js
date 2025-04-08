const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    quantity: Number,
    totalPrice: Number,
});

module.exports = mongoose.model('Booking', bookingSchema);

const Booking = require('../models/Booking');
const Event = require('../models/Event');

exports.bookTickets = async (req, res) => {
  const { eventId, quantity } = req.body;
  const event = await Event.findById(eventId);
  if (!event || event.status !== 'approved') return res.status(404).json({ msg: 'Event not found or not approved' });

  if (event.availableTickets < quantity)
    return res.status(400).json({ msg: 'Not enough tickets' });

  const totalPrice = quantity * event.price;
  event.availableTickets -= quantity;
  await event.save();

  const booking = await Booking.create({
    event: eventId,
    user: req.user._id,
    quantity,
    totalPrice,
  });

  res.status(201).json(booking);
};

exports.getBookingById = async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('event');
  if (!booking || booking.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ msg: 'Access denied' });
  }
  res.json(booking);
};

exports.cancelBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking || booking.user.toString() !== req.user._id.toString())
    return res.status(403).json({ msg: 'Not allowed' });

  const event = await Event.findById(booking.event);
  event.availableTickets += booking.quantity;
  await event.save();

  await booking.deleteOne();
  res.json({ msg: 'Booking cancelled' });
};
