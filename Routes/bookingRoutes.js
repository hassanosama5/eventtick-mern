<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const {
  bookTickets, getBookingById, cancelBooking, getUserBookings
} = require('../Controllers/bookingsController');
const { protect, authorize } = require('../Middleware/authorizationMiddleware');
=======
const router = require("express").Router();
const {
  bookTickets,
  getBookingById,
  cancelBooking,
} = require("../Controllers/bookingsController");
const { authorize } = require("../Middleware/authorizationMiddleware");
const { protect } = require("../Middleware/authenticationMiddleware");
>>>>>>> b4e86ace6fd102bab9f8beb83cf73d61fe875253

// Apply authentication middleware to all routes
router.use(protect);
<<<<<<< HEAD

// Booking routes - accessible by users
router.get('/', authorize('standard'), getUserBookings);
router.post('/', authorize('standard'), bookTickets);
router.get('/:id', authorize('standard'), getBookingById);
router.delete('/:id', authorize('standard'), cancelBooking);
=======
router.post("/", authorize("user"), bookTickets);
router.get("/:id", authorize("user"), getBookingById);
router.delete("/:id", authorize("user"), cancelBooking);
>>>>>>> b4e86ace6fd102bab9f8beb83cf73d61fe875253

module.exports = router;
