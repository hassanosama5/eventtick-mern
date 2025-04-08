const router = require('express').Router();
const {
  bookTickets, getBookingById, cancelBooking
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);
router.post('/', authorize('user'), bookTickets);
router.get('/:id', authorize('user'), getBookingById);
router.delete('/:id', authorize('user'), cancelBooking);

module.exports = router;
