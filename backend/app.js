const mongoose = require("mongoose");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json());

// CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "https://eventtick-mern.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like Postman, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

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
