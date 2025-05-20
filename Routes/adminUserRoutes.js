const router = require("express").Router();
const {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} = require("../Controllers/userController");
const { protect, authorize } = require("../Middleware/authorizationMiddleware");

router.use(protect);
router.use(authorize("admin"));

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUserRole);
router.delete("/:id", deleteUser);

module.exports = router; 