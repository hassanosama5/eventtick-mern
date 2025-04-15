const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Event = require('../models/Event');

// Book tickets for an event
exports.bookTickets = async (req, res) => {
  try {
    const { eventId, quantity } = req.body;

    // Input validation
    if (!eventId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Event ID and quantity are required'
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    // Find event and check availability
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Event not approved for bookings'
      });
    }

    // Use the hasEnded method instead of direct date comparison
    if (event.hasEnded()) {
      return res.status(400).json({
        success: false,
        message: 'Event has already ended'
      });
    }

    if (event.availableTickets < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Not enough tickets available',
        availableTickets: event.availableTickets
      });
    }

    // Use the bookTickets method from the Event model
    await event.bookTickets(quantity);

    // Create booking
    const totalPrice = quantity * event.price;
    const booking = await Booking.create({
      event: eventId,
      user: req.user._id,
      quantity,
      totalPrice,
      status: 'confirmed'
    });

    // Populate event details in response
    await booking.populate('event', 'title date location price');

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully',
      data: {
        booking: {
          _id: booking._id,
          eventName: booking.event.title,
          eventDate: booking.event.date,
          location: booking.event.location,
          quantity: booking.quantity,
          totalPrice: booking.totalPrice,
          status: booking.status
        }
      }
    });

  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing booking',
      error: error.message
    });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('event', 'title date location price image');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.json({
      success: true,
      data: {
        booking: {
          _id: booking._id,
          event: booking.event,
          quantity: booking.quantity,
          totalPrice: booking.totalPrice,
          status: booking.status,
          createdAt: booking.createdAt,
          canCancel: booking.status === 'confirmed' && new Date(booking.event.date) > new Date()
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching booking',
      error: error.message
    });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a booking that is not confirmed'
      });
    }

    // Get event and check if it hasn't occurred yet
    const event = await Event.findById(booking.event);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Associated event not found'
      });
    }

    if (new Date(event.date) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel booking for an event that has already occurred'
      });
    }

    // Update event tickets
    event.availableTickets += booking.quantity;
    await event.save();

    // Update booking status
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        booking: {
          _id: booking._id,
          eventName: event.title,
          quantity: booking.quantity,
          refundAmount: booking.totalPrice,
          cancelledAt: booking.cancelledAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling booking',
      error: error.message
    });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('event', 'title date location price image status')
      .sort({ createdAt: -1 });

    const enhancedBookings = bookings.map(booking => ({
      _id: booking._id,
      event: booking.event,
      quantity: booking.quantity,
      totalPrice: booking.totalPrice,
      status: booking.status,
      createdAt: booking.createdAt,
      canCancel: booking.status === 'confirmed' && 
                new Date(booking.event.date) > new Date()
    }));

    res.json({
      success: true,
      data: enhancedBookings
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch bookings', 
      error: error.message 
    });
  }
};