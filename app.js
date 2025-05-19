const mongoose = require('mongoose');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/auth', require('./Routes/auth'));
app.use('/api/v1/users', require('./Routes/userRoutes'));
app.use('/api/v1/events', require('./Routes/eventRoutes'));
app.use('/api/v1/bookings', require('./Routes/bookingRoutes'));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/online-event-ticketing-system';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Export the app instance
module.exports = app;