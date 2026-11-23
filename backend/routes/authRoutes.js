const express = require("express");
const { register, login, getMe, updateProfile, changePassword } = require("../controllers/authController");
const auth = require("../middleware/auth");
const { authLimiter } = require("../middleware/limits");

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/me", auth, getMe);
router.patch("/profile", auth, updateProfile);
router.patch("/password", auth, authLimiter, changePassword);

module.exports = router;
