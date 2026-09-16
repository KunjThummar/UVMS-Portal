const express = require("express");
const router = express.Router();

const facultyController = require("./admin.controller");

const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

router.use(authenticate, authorize("admin"));

router.get("/", facultyController.listFaculties);
router.post("/", facultyController.createFaculty);
router.put("/:id", facultyController.updateFaculty);
router.delete("/:id", facultyController.deleteFaculty);
router.patch("/:id/status", facultyController.toggleFacultyStatus);

module.exports = router;
