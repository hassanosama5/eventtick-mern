const mongoose = require("mongoose");
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

// Routes
const authRoutes = require("./Routes/auth");
const userRoutes = require("./Routes/userRoutes");
const eventRoutes = require("./Routes/eventRoutes");
const bookingRoutes = require("./Routes/bookingRoutes");

// Middleware
const { errorHandler } = require("./Middleware/errorMiddleware");

// App configuration

//Database Connection (using direct URL)

// Hardcoded JWT secret (for development only - not for production)
process.env.JWT_SECRET = "your-development-secret-key-12345";
process.env.JWT_EXPIRE = "30d";

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/bookings", bookingRoutes);

// Handle 404
// app.use("*", (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: "Endpoint not found",
//   });
// });

// Error Handling Middleware (should be last)
app.use(errorHandler);

module.exports = app;
