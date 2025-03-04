const mongoose = require('mongoose');

// Replace <your-database-url> with your actual MongoDB connection string
const dbUrl = 'mongodb://localhost:27017/online-event-ticketing-system';

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));