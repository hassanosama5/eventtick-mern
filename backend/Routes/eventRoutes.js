const express = require('express');
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  updateEventStatus,
  getEventAnalytics,
  getApprovedEvents,
  getOrganizerEvents,
} = require("../Controllers/eventsController");
const { protect, authorize } = require("../Middleware/authMiddleware");
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/events'); // specify the directory where files will be stored
  },
  filename: function (req, file, cb) {
    // Use the original filename with a timestamp to avoid conflicts
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Public routes
router.get("/approved", getApprovedEvents);

// Protected routes
router.use(protect);

// Organizer routes
router.get("/organizer", authorize("organizer"), getOrganizerEvents);
router.get("/:id", getEventById); // public route
router.post("/", authorize("organizer"), upload.single('image'), createEvent);
router.put("/:id", authorize("organizer", "admin"), upload.single('image'), updateEvent);
router.delete("/:id", authorize("organizer", "admin"), deleteEvent);
router.get("/:id/analytics", authorize("organizer"), getEventAnalytics);

// Admin routes
router.patch("/:id/status", authorize("admin"), updateEventStatus);

// Add the getEvents route here so it's protected
router.get("/", getEvents);

module.exports = router;
