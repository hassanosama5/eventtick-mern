const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Event = require('../models/Event');

exports.bookTickets = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { eventId, quantity } = req.body;

    // Input validation
    if (!eventId || !quantity) {
      await session.abortTransaction();
      return res.status(400).json({ msg: 'Event ID and quantity are required' });
    }

    if (quantity <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ msg: 'Quantity must be at least 1' });
    }

    const event = await Event.findById(eventId).session(session);
    if (!event) {
      await session.abortTransaction();
      return res.status(404).json({ msg: 'Event not found' });
    }

    if (event.status !== 'approved') {
      await session.abortTransaction();
      return res.status(400).json({ msg: 'Event not approved for bookings' });
    }

    if (event.date < new Date()) {
      await session.abortTransaction();
      return res.status(400).json({ msg: 'Event has already ended' });
    }

    if (event.availableTickets < quantity) {
      await session.abortTransaction();
      return res.status(400).json({ 
        msg: 'Not enough tickets available', 
        available: event.availableTickets 
      });
    }

    // Process booking
    const totalPrice = quantity * event.price;
    event.availableTickets -= quantity;
    await event.save({ session });

    const booking = await Booking.create([{
      event: eventId,
      user: req.user._id,
      quantity,
      totalPrice,
      status: 'confirmed'
    }], { session });

    await session.commitTransaction();
    
    res.status(201).json({
      ...booking[0].toObject(),
      eventName: event.title,
      eventDate: event.date,
      location: event.location
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ 
      msg: 'Booking failed due to server error', 
      error: error.message 
    });
  } finally {
    session.endSession();
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('event', 'title date location price image');
    
    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'Unauthorized to view this booking' });
    }

    res.json({
      ...booking.toObject(),
      canCancel: booking.status === 'confirmed' && 
                new Date(booking.event.date) > new Date()
    });
  } catch (error) {
    res.status(500).json({ 
      msg: 'Failed to fetch booking', 
      error: error.message 
    });
  }
};

exports.cancelBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findById(req.params.id).session(session);
    
    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({ msg: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      return res.status(403).json({ msg: 'Unauthorized to cancel this booking' });
    }

    if (booking.status !== 'confirmed') {
      await session.abortTransaction();
      return res.status(400).json({ msg: 'Only confirmed bookings can be cancelled' });
    }

    const event = await Event.findById(booking.event).session(session);
    if (!event) {
      await session.abortTransaction();
      return res.status(404).json({ msg: 'Associated event not found' });
    }

    // Restore tickets
    event.availableTickets += booking.quantity;
    await event.save({ session });

    // Mark as cancelled (soft delete)
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    await booking.save({ session });

    await session.commitTransaction();
    
    res.json({ 
      msg: 'Booking cancelled successfully',
      booking: {
        id: booking._id,
        event: booking.event,
        cancelledAt: booking.cancelledAt
      }
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ 
      msg: 'Cancellation failed due to server error', 
      error: error.message 
    });
  } finally {
    session.endSession();
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('event', 'title date location price image status')
      .sort({ createdAt: -1 });

    const enhancedBookings = bookings.map(booking => ({
      ...booking.toObject(),
      canCancel: booking.status === 'confirmed' && 
                new Date(booking.event.date) > newDate()
    }));

    res.json(enhancedBookings);
  } catch (error) {
    res.status(500).json({ 
      msg: 'Failed to fetch bookings', 
      error: error.message 
    });
  }
};