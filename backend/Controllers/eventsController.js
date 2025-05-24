const Event = require("../models/Event");
const Booking = require("../models/Booking");
const fs = require('fs');

// Get all events (public)
exports.getEvents = async (req, res) => {
  try {
    console.log("GET /api/v1/events hit");
    console.log("Authenticated user (req.user):", req.user);

    let filter = { status: "approved" };
    // If user is authenticated and is an admin, fetch all events
    if (req.user && req.user.role === "admin") {
      filter = {}; // No filter, get all events
    }

    console.log("Fetching events with filter:", filter);

    const events = await Event.find(filter).populate("organizer", "name email");
    console.log('Events fetched in getEvents:', events);
    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get approved events (public)
exports.getApprovedEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "approved" }).populate(
      "organizer",
      "name email"
    );
    console.log('Events fetched in getApprovedEvents:', events);
    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get event by ID (public)
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "organizer",
      "name email"
    );
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create event (organizer only)
exports.createEvent = async (req, res) => {
  console.log('createEvent controller hit');
  console.log('req.body:', req.body);
  console.log('req.file:', req.file);
  try {
    const {
      title,
      description,
      date,
      location,
      price,
      totalTickets,
      category,
    } = req.body;

    // Access file path from multer
    const imageUrl = req.file ? `/uploads/events/${req.file.filename}` : null;

    // Validate required fields
    if (!title || !date || !location || !price || !totalTickets) {
      // If a file was uploaded but validation failed, delete the file
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: title, date, location, price, and totalTickets",
      });
    }

    // Validate totalTickets is a positive number
    if (totalTickets <= 0) {
       // If a file was uploaded but validation failed, delete the file
       if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: "Total tickets must be greater than 0",
      });
    }

    // Create event object with all fields
    const eventData = {
      title,
      description,
      date,
      location,
      price,
      totalTickets,
      availableTickets: totalTickets, // Set available tickets equal to total tickets initially
      organizer: req.user.id,
      status: "pending",
      image: imageUrl, // Save the image URL
    };

    // Add optional fields if provided
    if (category) eventData.category = category;

    // Create and save the event
    const event = new Event(eventData);
    await event.save();

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error) {
    console.error("Event creation error:", error);
     // If a file was uploaded and an error occurred, delete the file
     if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update event (organizer/admin)
exports.updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            // If a file was uploaded but event not found, delete the file
            if (req.file) {
              fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if the logged in user is the event organizer or an admin
        if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
             // If a file was uploaded but user is not authorized, delete the file
             if (req.file) {
              fs.unlinkSync(req.file.path);
            }
            return res.status(401).json({
                success: false,
                message: 'Not authorized to update this event'
            });
        }

        // Access file path from multer
        const imageUrl = req.file ? `/uploads/events/${req.file.filename}` : event.image; // Use new image or existing one

        const updatedEventData = {
            ...req.body,
            image: imageUrl,
        };
         // Ensure totalTickets is a number before updating
        if (updatedEventData.totalTickets) {
          updatedEventData.totalTickets = parseInt(updatedEventData.totalTickets, 10);
          // Optionally update available tickets if total tickets increased
          if (updatedEventData.totalTickets > event.totalTickets) {
            updatedEventData.availableTickets = event.availableTickets + (updatedEventData.totalTickets - event.totalTickets);
          }
        }
         // Ensure price is a number before updating
        if (updatedEventData.price) {
          updatedEventData.price = parseFloat(updatedEventData.price);
        }

        const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updatedEventData, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            message: 'Event updated successfully',
            data: updatedEvent
        });
    } catch (error) {
        console.error('Event update error:', error);
         // If a file was uploaded and an error occurred, delete the file
         if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Delete event (organizer of the event or admin)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if user is organizer or admin
    if (
      event.organizer.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this event" });
    }

    await event.deleteOne();
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Approve or reject event
exports.updateEventStatus = async (req, res) => {
  try {
    console.log("PATCH /api/v1/events/:id/status hit");
    console.log("Event ID from params:", req.params.id);
    console.log("New status from body:", req.body.status);

    const { status } = req.body;
    if (!["approved", "declined"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    console.log("Result of findByIdAndUpdate:", event);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    console.error("Error in updateEventStatus:", error);
    res.status(400).json({ message: error.message });
  }
};

// Get event analytics (organizer only)
exports.getEventAnalytics = async (req, res) => {
  try {
    // Validate event ID
    if (!req.params.id) {
      return res.status(400).json({
        success: false,
        message: "Event ID is required",
      });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view analytics for this event",
      });
    }

    // Calculate analytics
    const totalTickets = event.totalTickets;
    const availableTickets = event.availableTickets;
    const bookedTickets = totalTickets - availableTickets;
    const bookingPercentage = (bookedTickets / totalTickets) * 100;

    // Get bookings for this event
    const bookings = await Booking.find({ event: event._id })
      .select("createdAt numberOfTickets")
      .sort({ createdAt: "asc" });

    res.json({
      success: true,
      data: {
        event: {
          _id: event._id,
          title: event.title,
          date: event.date,
          status: event.status,
        },
        analytics: {
          totalTickets,
          availableTickets,
          bookedTickets,
          bookingPercentage: bookingPercentage.toFixed(2),
          revenue: bookedTickets * event.price,
        },
        bookingHistory: bookings.map((booking) => ({
          date: booking.createdAt,
          ticketsPurchased: booking.numberOfTickets,
        })),
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching event analytics",
      error: error.message,
    });
  }
};

// Get events created by the logged-in organizer
exports.getOrganizerEvents = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const events = await Event.find({ organizer: req.user.id }).populate(
      "organizer",
      "name email"
    );

    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
