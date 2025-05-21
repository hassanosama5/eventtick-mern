const Event = require('../models/Event');
const Booking = require('../models/Booking');

// Get all events (public)
exports.getEvents = async (req, res) => {
    try {
        const events = await Event.find();
        res.json({
            success: true,
            data: events
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Get event by ID (public)
exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ 
                success: false,
                message: 'Event not found' 
            });
        }
        res.json({
            success: true,
            data: event
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Create event (public for testing)
exports.createEvent = async (req, res) => {
    try {
        const {
            title,
            description,
            date,
            location,
            price,
            totalTickets,
            organizer
        } = req.body;

        // Create event object with all fields
        const eventData = {
            title,
            description,
            date,
            location,
            price,
            totalTickets,
            availableTickets: totalTickets,
            organizer: organizer, // Use the provided organizer ID
            status: 'pending' // Set initial status as pending
        };

        // Create and save the event
        const event = new Event(eventData);
        await event.save();

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: event
        });
    } catch (error) {
        console.error('Event creation error:', error);
        res.status(400).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Update event (public for testing)
exports.updateEvent = async (req, res) => {
    try {
        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedEvent) {
            return res.status(404).json({ 
                success: false,
                message: 'Event not found' 
            });
        }
        res.json({
            success: true,
            message: 'Event updated successfully',
            data: updatedEvent
        });
    } catch (error) {
        console.error('Update error:', error);
        res.status(400).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Delete event (public for testing)
exports.deleteEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        console.log('Attempting to delete event with ID:', eventId);

        // First find the event to check if it exists
        const event = await Event.findById(eventId);
        if (!event) {
            console.log('Event not found with ID:', eventId);
            return res.status(404).json({ 
                success: false,
                message: 'Event not found' 
            });
        }

        // Delete the event
        const deletedEvent = await Event.findByIdAndDelete(eventId);
        console.log('Event deleted successfully:', deletedEvent);
        
        res.json({
            success: true,
            message: 'Event deleted successfully'
        });
    } catch (error) {
        console.error('Delete error:', {
            error,
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Update event status (public for testing)
exports.updateEventStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const event = await Event.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get event analytics (public for testing)
exports.getEventAnalytics = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        const totalTickets = event.totalTickets;
        const availableTickets = event.availableTickets;
        const bookedTickets = totalTickets - availableTickets;
        const bookingPercentage = (bookedTickets / totalTickets) * 100;

        const bookings = await Booking.find({ event: event._id })
            .select('createdAt numberOfTickets')
            .sort({ createdAt: 'asc' });

        res.json({
            success: true,
            data: {
                event: {
                    _id: event._id,
                    title: event.title,
                    date: event.date,
                    status: event.status
                },
                analytics: {
                    totalTickets,
                    availableTickets,
                    bookedTickets,
                    bookingPercentage: bookingPercentage.toFixed(2),
                    revenue: bookedTickets * event.price
                },
                bookingHistory: bookings.map(booking => ({
                    date: booking.createdAt,
                    ticketsPurchased: booking.numberOfTickets
                }))
            }
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching event analytics',
            error: error.message
        });
    }
};

// Get organizer events
exports.getOrganizerEvents = async (req, res) => {
    try {
        const events = await Event.find({ organizer: '682bcbd395ac11f949e0ba12' });
        res.json({
            success: true,
            data: events
        });
    } catch (error) {
        console.error('Error fetching organizer events:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};