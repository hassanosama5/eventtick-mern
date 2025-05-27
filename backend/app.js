const mongoose = require("mongoose");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.json());

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['set-cookie'],
}));

app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static("uploads"));

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
