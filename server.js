const app = require('./app');
const mongoose = require('mongoose');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = 'mongodb://127.0.0.1:27017/online-event-ticketing-system';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
.then(() => {
  console.log('MongoDB connected successfully');
  // Start the server only after successful database connection
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
