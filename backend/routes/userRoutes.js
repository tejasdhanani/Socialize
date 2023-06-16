const express = require("express");
const router = express.Router();
const {
  registerUser,
  getMe,
  loginUser,
  changePassword,
  deleteUser,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.post("/changepassword", protect, changePassword);
router.delete("/", protect, deleteUser);

module.exports = router;
