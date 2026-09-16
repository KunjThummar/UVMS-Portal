const studentService = require("./student.service");
const { validateCreateStudent, validateUpdateStudent } = require("./student.validation");

async function listStudents(req, res) {
    try {
        const { status } = req.query;
        const students = await studentService.listAll({ status });
        return res.status(200).json({ success: true, data: students });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ success: false, message: error.message });
    }
}

async function createStudent(req, res) {
    const { error, value } = validateCreateStudent(req.body);
    if (error) {
        return res.status(400).json({ success: false, message: error.details.map(d => d.message).join(", ") });
    }
    try {
        const student = await studentService.create(value);
        return res.status(201).json({ success: true, message: "Student created successfully.", data: student });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({ success: false, message: err.message });
    }
}

async function updateStudent(req, res) {
    const { error, value } = validateUpdateStudent(req.body);
    if (error) {
        return res.status(400).json({ success: false, message: error.details.map(d => d.message).join(", ") });
    }
    try {
        const student = await studentService.updateById(req.params.id, value);
        return res.status(200).json({ success: true, message: "Student updated successfully.", data: student });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({ success: false, message: err.message });
    }
}

async function deleteStudent(req, res) {
    try {
        await studentService.remove(req.params.id);
        return res.status(200).json({ success: true, message: "Student removed successfully." });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({ success: false, message: err.message });
    }
}

async function toggleStudentStatus(req, res) {
    try {
        const student = await studentService.toggleStatus(req.params.id, req.body.isActive);
        return res.status(200).json({ success: true, message: "Student status updated.", data: student });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({ success: false, message: err.message });
    }
}

module.exports = {
    listStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    toggleStudentStatus
};
