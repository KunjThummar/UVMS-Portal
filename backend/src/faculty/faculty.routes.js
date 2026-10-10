const express = require("express");
const router = express.Router();

const facultyController = require("./admin.controller");


router.post("/", facultyController.createFaculty);
router.put("/:id", facultyController.updateFaculty);



module.exports = router;
