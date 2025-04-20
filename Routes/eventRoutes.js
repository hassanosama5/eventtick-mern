const router = require("express").Router();
const {
<<<<<<< HEAD
  createEvent, getEvents, getEventById, updateEvent, deleteEvent, updateEventStatus, getEventAnalytics
} = require('../Controllers/eventsController');
const { protect, authorize } = require('../Middleware/authorizationMiddleware');

// Public routes
router.get('/', getEvents);
router.get('/:id', getEventById);

// Protected routes
router.use(protect);

// Organizer routes
router.post('/', authorize('organizer'), createEvent);
router.put('/:id', authorize('organizer', 'admin'), updateEvent);
router.delete('/:id', authorize('organizer', 'admin'), deleteEvent);
router.get('/:id/analytics', authorize('organizer'), getEventAnalytics);

// Admin routes
router.patch('/:id/status', authorize('admin'), updateEventStatus);
=======
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require("../Controllers/eventsController");
const { authorize } = require("../Middleware/authorizationMiddleware");
const { protect } = require("../Middleware/authenticationMiddleware");

router.get("/", getEvents);
router.get("/:id", getEventById);
router.post("/", protect, authorize("organizer"), createEvent);
router.put("/:id", protect, authorize("organizer", "admin"), updateEvent);
router.delete("/:id", protect, authorize("organizer", "admin"), deleteEvent);
>>>>>>> b4e86ace6fd102bab9f8beb83cf73d61fe875253

module.exports = router;
