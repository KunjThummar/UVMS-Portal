const facultyService = require("./faculty.service");
const { validateCreateFaculty, validateUpdateFaculty } = require("./faculty.validation");

async function listFaculties(req, res) {
    try {
        const { status } = req.query;
        const faculties = await facultyService.listAll({ status });
        return res.status(200).json({ success: true, data: faculties });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ success: false, message: error.message });
    }
}

async function createFaculty(req, res) {
    const { error, value } = validateCreateFaculty(req.body);
    if (error) {
        return res.status(400).json({ success: false, message: error.details.map(d => d.message).join(", ") });
    }
    try {
        const faculty = await facultyService.create(value);
        return res.status(201).json({ success: true, message: "Faculty created successfully.", data: faculty });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({ success: false, message: err.message });
    }
}

async function updateFaculty(req, res) {
    const { error, value } = validateUpdateFaculty(req.body);
    if (error) {
        return res.status(400).json({ success: false, message: error.details.map(d => d.message).join(", ") });
    }
    try {
        const faculty = await facultyService.updateById(req.params.id, value);
        return res.status(200).json({ success: true, message: "Faculty updated successfully.", data: faculty });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({ success: false, message: err.message });
    }
}

async function deleteFaculty(req, res) {
    try {
        await facultyService.remove(req.params.id);
        return res.status(200).json({ success: true, message: "Faculty removed successfully." });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({ success: false, message: err.message });
    }
}

async function toggleFacultyStatus(req, res) {
    try {
        const faculty = await facultyService.toggleStatus(req.params.id, req.body.isActive);
        return res.status(200).json({ success: true, message: "Faculty status updated.", data: faculty });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({ success: false, message: err.message });
    }
}

module.exports = {
    listFaculties,
    createFaculty,
    updateFaculty,
    deleteFaculty,
    toggleFacultyStatus
};
