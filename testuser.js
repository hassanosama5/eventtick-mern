const mongoose = require("mongoose");
const User = require("./models/User");

// Replace with your MongoDB Compass connection string
const dbUrl = "mongodb://localhost:27017/online-event-ticketing-system"; // Add your database name

// Connect to MongoDB
mongoose
  .connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Create a new user
const newUser = new User({
  name: "John Doe",
  email: "john.doe@example.com",
  password: "password123",
  role: "standard",
});

// Save the user to the database
newUser
  .save()
  .then(() => {
    console.log("User saved successfully!");
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error("Error saving user:", err);
    mongoose.connection.close();
  });
