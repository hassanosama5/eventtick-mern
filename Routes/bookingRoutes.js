const express = require("express");
const router = express.Router();
const {
  bookTickets,
  getBookingById,
  cancelBooking,
  getUserBookings,
} = require("../Controllers/bookingsController");
const { protect, authorize } = require("../Middleware/authorizationMiddleware");

// Apply authentication middleware to all routes
router.use(protect);

// Booking routes - accessible by users
router.get("/", authorize("standard"), getUserBookings);
router.post("/", authorize("standard"), bookTickets);
router.get("/:id", authorize("standard"), getBookingById);
router.delete("/:id", authorize("standard"), cancelBooking);

module.exports = router;
