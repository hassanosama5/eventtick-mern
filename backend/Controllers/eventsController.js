const Event = require("../models/Event");
const Booking = require("../models/Booking");

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
  try {
    const {
      title,
      description,
      date,
      location,
      price,
      totalTickets,
      category,
      image,
    } = req.body;

    // Validate required fields
    if (!title || !date || !location || !price || !totalTickets) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: title, date, location, price, and totalTickets",
      });
    }

    // Validate totalTickets is a positive number
    if (totalTickets <= 0) {
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
    };

    // Add optional fields if provided
    if (category) eventData.category = category;
    if (image) eventData.image = image;

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
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update event (organizer of the event or admin)
exports.updateEvent = async (req, res) => {
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
        .json({ message: "Not authorized to update this event" });
    }

    // Don't allow updating status through this endpoint
    delete req.body.status;

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
