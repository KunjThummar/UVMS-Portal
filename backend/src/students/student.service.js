const Student = require("../models/student.model");
const ApiError = require("../utils/ApiError");

const getProfile = async (studentId) => {
    const student = await Student.findById(studentId)
        .select("-passwordHash")
        .populate("instituteId", "name code")
        .populate("departmentId", "name code");

    if (!student) {
        throw new ApiError(404, "Student not found.");
    }

    return student;
};

module.exports = {
    getProfile
};