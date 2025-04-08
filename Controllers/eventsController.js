const Event = require('../models/Event');

// Create event (Organizer only)
exports.createEvent = async (req, res) => {
  try {
    const event = await Event.create({ 
      ...req.body,
      organizer: req.user._id,
      status: 'pending'
    });
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

// Get all approved events
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: 'approved' });
    res.json(events);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

// Get single event
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

// Update event (Organizer or Admin)
exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    
    // Only organizer can update (except admin for status)
    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    // Admins can only update status
    if (req.user.role === 'admin' && req.body.status === undefined) {
      return res.status(403).json({ msg: 'Admins can only update status' });
    }
    
    event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(event);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

// Delete event (Organizer or Admin)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    await event.deleteOne();
    res.json({ msg: 'Event deleted' });
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};