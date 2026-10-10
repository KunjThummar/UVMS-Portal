const express = require("express");

const router = express.Router();

const {
  registerStudent,
  loginStudent,
  registerFaculty,
  loginFaculty,
  loginAdmin,
  logout,
  getMe,
} = require("./auth.controller");

const authenticate = require("../middleware/authenticate");

// ===============================
// Student Routes
// ===============================
router.post("/student/register", registerStudent);

router.post("/student/login", loginStudent);

// ===============================
// Faculty Routes
// ===============================
router.post("/faculty/register", registerFaculty);

router.post("/faculty/login", loginFaculty);

// ===============================
// Admin Routes
// ===============================
router.post("/admin/login", loginAdmin);

// ===============================
// Current Logged-in User
// ===============================
router.get("/me", authenticate, getMe);

// ===============================
// Logout Route
// ===============================
router.post("/logout", logout);

module.exports = router;