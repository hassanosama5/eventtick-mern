const router = require("express").Router();
const {
  bookTickets,
  getBookingById,
  cancelBooking,
} = require("../Controllers/bookingsController");
const { authorize } = require("../Middleware/authorizationMiddleware");
const { protect } = require("../Middleware/authenticationMiddleware");

router.use(protect);
router.post("/", authorize("user"), bookTickets);
router.get("/:id", authorize("user"), getBookingById);
router.delete("/:id", authorize("user"), cancelBooking);

module.exports = router;
