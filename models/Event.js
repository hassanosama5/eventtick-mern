const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    category: { type: String },
    image: { type: String },
    ticketPrice: { type: Number, required: true },
    totalTickets: { type: Number, required: true },
    remainingTickets: { type: Number, required: true },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
