const mongoose = require("mongoose");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Environment variables
dotenv.config();

// Database connection
const dbUrl =
  process.env.MONGODB_URI ||
  "mongodb://localhost:27017/online-event-ticketing-system";
mongoose
  .connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json());

// CORS Configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Routes
const authRoutes = require("./Routes/auth");
const userRoutes = require("./Routes/userRoutes");
const eventRoutes = require("./Routes/eventRoutes");
const bookingRoutes = require("./Routes/bookingRoutes");

app.use("/api/v1", authRoutes); // Authentication routes (login, register)
app.use("/api/v1/users", userRoutes); // User management
app.use("/api/v1/events", eventRoutes); // Event management
app.use("/api/v1/bookings", bookingRoutes); // Booking management

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

module.exports = app;
