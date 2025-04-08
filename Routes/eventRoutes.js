const router = require('express').Router();
const {
  createEvent, getEvents, getEventById, updateEvent, deleteEvent
} = require('../controllers/eventController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', protect, authorize('organizer'), createEvent);
router.put('/:id', protect, authorize('organizer', 'admin'), updateEvent);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteEvent);

module.exports = router;
