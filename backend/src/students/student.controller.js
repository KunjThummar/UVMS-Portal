const studentService = require("./student.service");
const eventService = require("../events/event.service");
const applicationService = require("../applications/application.service");
const { validateApply } = require("../applications/application.validation");

// ======================================
// Get Student Profile
// ======================================
const getProfile = async (req, res) => {
    try {
        const student = await studentService.getProfile(req.user.id);   //req.user get data from jwt token, which is decoded in authenticate middleware and stored in req.user

        return res.status(200).json({
            success: true,
            message: "Student profile fetched successfully.",
            data: student
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================
// Get Eligible Events
// ======================================
const getEligibleEvents = async (req, res) => {
    try {
        const {
            status,
            dateFrom,
            dateTo,
            search
        } = req.query;

        const student = await studentService.getProfile(req.user.id);

        const events = await eventService.getEligibleEventsForStudent(
            student,
            {
                status,
                dateFrom,
                dateTo,
                search
            }
        );

        return res.status(200).json({
            success: true,
            message: "Eligible events fetched successfully.",
            data: events
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================
// Get Event By ID
// ======================================
const getEventById = async (req, res) => {
    try {
        const event =
            await eventService.getEventForStudent(
                req.params.id,
                req.user.id
            );

        return res.status(200).json({
            success: true,
            message: "Event fetched successfully.",
            data: event
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================
// Apply To Event
// ======================================
const applyToEvent = async (req, res) => {
    try {
        const { error, value } = validateApply(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: "Validation failed.",
                errors: error.details.map((detail) => detail.message)
            });
        }

        const application =
            await applicationService.applyToEvent(
                req.params.id,
                req.user.id,        
                value
            );

        return res.status(201).json({
            success: true,
            message: "Application submitted successfully.",
            data: application
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================
// Get My Applications
// ======================================
const getMyApplications = async (req, res) => {
    try {
        const { status } = req.query;

        const applications =
            await applicationService.getByStudent(
                req.user.id,
                status
            );

        return res.status(200).json({
            success: true,
            message: "Applications fetched successfully.",
            data: applications
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getProfile,
    getEligibleEvents,
    getEventById,
    applyToEvent,
    getMyApplications
};