const router = require('express').Router();
const {
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

module.exports = router;
