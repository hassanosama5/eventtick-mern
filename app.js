const mongoose = require('mongoose');
const express = require('express');
const dotenv = require('dotenv');

// Replace <your-database-url> with your actual MongoDB connection string
const dbUrl = 'mongodb://localhost:27017/online-event-ticketing-system';
const authRoutes = require('./Routes/auth');
const userRoutes = require('./Routes/userRoutes');
const eventRoutes = require('./Routes/eventRoutes');
const bookingRoutes = require('./Routes/bookingRoutes');
dotenv.config();

const app = express();


app.use(express.json());

app.use('/api/v1', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/bookings', bookingRoutes);

module.exports = app;


mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));