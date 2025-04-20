const router = require("express").Router();
const {
<<<<<<< HEAD
  getProfile, updateProfile, getAllUsers, getUserById,
  updateUserRole, deleteUser, getUserBookings, getOrganizerEvents, getEventAnalytics
} = require('../controllers/userController');
const { protect, authorize } = require('../Middleware/authorizationMiddleware');
=======
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getUserBookings,
  getOrganizerEvents,
  getEventAnalytics,
} = require("../Controllers/userController");
const { authorize } = require("../Middleware/authorizationMiddleware");
const { protect } = require("../Middleware/authenticationMiddleware");
>>>>>>> b4e86ace6fd102bab9f8beb83cf73d61fe875253

router.use(protect);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.get("/bookings", authorize("user"), getUserBookings);
router.get("/events", authorize("organizer"), getOrganizerEvents);
router.get("/events/analytics", authorize("organizer"), getEventAnalytics);

router.get("/", authorize("admin"), getAllUsers);
router.get("/:id", authorize("admin"), getUserById);
router.put("/:id", authorize("admin"), updateUserRole);
router.delete("/:id", authorize("admin"), deleteUser);

module.exports = router;
