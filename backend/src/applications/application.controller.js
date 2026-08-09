const applicationService = require("./application.service");

// ======================================
// Approve Application
// ======================================
const approveApplication = async (req, res) => {
    try {
        const application = await applicationService.approveApplication(
            req.params.id,
            req.user.id
        );

        return res.status(200).json({
            success: true,
            message: "Application approved successfully.",
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
// Reject Application
// ======================================
const rejectApplication = async (req, res) => {
    try {
        const application = await applicationService.rejectApplication(
            req.params.id,
            req.user.id
        );

        return res.status(200).json({
            success: true,
            message: "Application rejected successfully.",
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
// Get Applications By Event
// ======================================
const getByEvent = async (req, res) => {
    try {
        const { status } = req.query;       //it comes from url query params, can be "approved", "pending", "rejected" or null

        const applications = await applicationService.getByEvent(
            req.params.eventId,
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

// ======================================
// Get All Applications - Admin
// ======================================
const getAll = async (req, res) => {
    try {
        const {
            eventId,
            studentId,
            status
        } = req.query;      //filter

        const applications = await applicationService.getAll({
            eventId,
            studentId,
            status
        });

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
    approveApplication,
    rejectApplication,
    getByEvent,
    getAll
};