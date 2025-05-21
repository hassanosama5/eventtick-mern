const router = require("express").Router();
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  updateEventStatus,
  getEventAnalytics,
  getApprovedEvents,
} = require("../Controllers/eventsController");
const { protect, authorize } = require("../Middleware/authMiddleware");

// Public routes
router.get("/approved", getApprovedEvents);
router.get("/:id", getEventById);

// Protected routes
router.use(protect);

// Organizer routes
router.post("/", authorize("organizer"), createEvent);
router.put("/:id", authorize("organizer", "admin"), updateEvent);
router.delete("/:id", authorize("organizer", "admin"), deleteEvent);
router.get("/:id/analytics", authorize("organizer"), getEventAnalytics);

// Admin routes
router.patch("/:id/status", authorize("admin"), updateEventStatus);

// Add the getEvents route here so it's protected
router.get("/", getEvents);

module.exports = router;
