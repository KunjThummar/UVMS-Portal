const express = require("express");
const router = express.Router();

const studentController = require("./admin.controller");

const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

router.use(authenticate, authorize("admin"));

router.get("/", studentController.listStudents);
router.post("/", studentController.createStudent);
router.put("/:id", studentController.updateStudent);
router.delete("/:id", studentController.deleteStudent);
router.patch("/:id/status", studentController.toggleStudentStatus);

module.exports = router;
