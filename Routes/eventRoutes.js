const router = require('express').Router();
const {
  createEvent, getEvents, getEventById, updateEvent, deleteEvent, updateEventStatus, getEventAnalytics, getOrganizerEvents
} = require('../Controllers/eventsController');

// Public routes (no authentication required)
router.get('/', getEvents);
router.get('/organizer', getOrganizerEvents);
router.get('/:id', getEventById);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);
router.get('/:id/analytics', getEventAnalytics);
router.patch('/:id/status', updateEventStatus);

module.exports = router;
