const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true,
        trim: true,
        minlength: [3, 'Title must be at least 3 characters long']
    },
    description: { 
        type: String,
        trim: true
    },
    date: { 
        type: Date, 
        required: true
    },
    location: { 
        type: String, 
        required: true,
        trim: true
    },
    image: { 
        type: String,
        validate: {
            validator: function(value) {
                return !value || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(value);
            },
            message: 'Invalid image URL format'
        }
    },
    price: { 
        type: Number, 
        required: true,
        min: [0, 'Price cannot be negative']
    },
    totalTickets: { 
        type: Number, 
        required: true,
        min: [1, 'Total tickets must be at least 1']
    },
    availableTickets: { 
        type: Number, 
        required: true
    },
    organizer: { 
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'declined'],
        default: 'pending',
        required: true
    },
    category: {
        type: String,
        enum: [
            'conference',
            'workshop',
            'seminar',
            'concert',
            'exhibition',
            'entertainment',
            'sports',
            'other'
        ],
        required: true
    }
}, { timestamps: true });

// Pre-save middleware to set initial availableTickets if not provided
eventSchema.pre('save', function(next) {
    if (this.isNew && this.availableTickets === undefined) {
        this.availableTickets = this.totalTickets;
    }
    next();
});

// Method to check if tickets are available
eventSchema.methods.hasAvailableTickets = function(quantity) {
    return this.availableTickets >= quantity;
};

// Method to check if event has ended
eventSchema.methods.hasEnded = function() {
    const eventDate = new Date(this.date);
    const now = new Date();
    
    // Set both dates to start of their respective days for comparison
    eventDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    
    return eventDate < now;
};

// Method to book tickets
eventSchema.methods.bookTickets = function(quantity) {
    if (this.hasEnded()) {
        throw new Error('Event has already ended');
    }
    if (!this.hasAvailableTickets(quantity)) {
        throw new Error('Not enough tickets available');
    }
    this.availableTickets -= quantity;
    return this.save();
};

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
