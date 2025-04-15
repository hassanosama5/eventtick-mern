const router = require("express").Router();
const {
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

module.exports = router;
