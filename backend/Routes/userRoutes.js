const router = require("express").Router();
const {
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getUserBookings,
  getOrganizerEvents,
  getEventAnalytics,
  deleteMyAccount,
} = require("../Controllers/userController");
const { protect, authorize } = require("../Middleware/authMiddleware");

router.use(protect);

//Standard
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.delete("/me", deleteMyAccount); //Delete accountyy
router.get("/bookings", authorize("standard"), getUserBookings);

//Organizer
router.get("/events", authorize("organizer"), getOrganizerEvents);
router.get("/events/analytics", authorize("organizer"), getEventAnalytics);

//Admin-Only
router.get("/", authorize("admin"), getAllUsers);
router.get("/:id", authorize("admin"), getUserById);
router.put("/:id", authorize("admin"), updateUserRole);
router.delete("/:id", authorize("admin"), deleteUser);

module.exports = router;
