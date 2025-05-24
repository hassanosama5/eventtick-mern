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
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.urlencoded({ extended: true }));

// // Request logging middleware
// app.use((req, res, next) => {
//   console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
//   console.log("Request Body:", req.body);
//   next();
// });

// Routes
const authRoutes = require("./Routes/auth");
const userRoutes = require("./Routes/userRoutes");
const eventRoutes = require("./Routes/eventRoutes");
const bookingRoutes = require("./Routes/bookingRoutes");
const adminUserRoutes = require("./Routes/adminUserRoutes");

app.use("/api/v1", authRoutes); // Authentication routes (login, register)
app.use("/api/v1/users", userRoutes); // User management
app.use("/api/v1/events", eventRoutes); // Event management
//app.use("/api/v1/events", require("./Routes/eventRoutes"));
app.use("/api/v1/bookings", bookingRoutes); // Booking management
app.use("/api/v1/admin/users", adminUserRoutes);

// 404 handler
app.use((req, res, next) => {
  console.log(`[404] ${req.method} ${req.url} - Route not found`);
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

module.exports = app;
