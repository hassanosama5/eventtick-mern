const mongoose = require('mongoose');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Replace <your-database-url> with your actual MongoDB connection string
const dbUrl = 'mongodb://localhost:27017/online-event-ticketing-system';
dotenv.config();

const app = express();

// Middleware
app.use(cors());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Request Body:', req.body);
  next();
});

// Routes
const authRoutes = require('./Routes/auth');
const userRoutes = require('./Routes/userRoutes');
const eventRoutes = require('./Routes/eventRoutes');
const bookingRoutes = require('./Routes/bookingRoutes');

// Test route to verify server is working
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Routes
app.use('/api/v1/auth', require('./Routes/auth'));
app.use('/api/v1/users', require('./Routes/userRoutes'));
app.use('/api/v1/events', require('./Routes/eventRoutes'));
app.use('/api/v1/bookings', require('./Routes/bookingRoutes'));

module.exports = app;