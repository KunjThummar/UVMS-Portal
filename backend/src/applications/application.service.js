const  VolunteerApplication  = require("../models/volunteerApplication.model");
const { Event } = require("../models/event.model");
const Student = require("../models/student.model");
const eventService = require("../events/event.service");
const ApiError = require("../utils/ApiError");

// ====================
// APPLY TO EVENT //
// ====================

const applyToEvent = async (eventId, studentId, data) => {

    // Check Event Exists
    const event = await Event.findById(eventId);

    if (!event) {
        throw new ApiError(404, "Event not found.");
    }

    // Get Student
    const student = await Student.findById(studentId);

    if (!student) {
        throw new ApiError(404, "Student not found.");
    }

    // Check Student Eligibility
    const eligible = await eventService.isStudentEligibleForEvent(
        student,
        event
    );

    if (!eligible) {
        throw new ApiError(403, "You are not eligible for this event.");
    }

    // Check Event Status
    if (event.status !== "Open") {
        throw new ApiError(400, "Applications are closed for this event.");
    }

    // Check Deadline
    if (event.applicationDeadline < new Date()) {
        throw new ApiError(400, "Application deadline has passed.");
    }

    // Check Existing Active Application
    const existingApplication =
        await VolunteerApplication.findOne({
            eventId,
            studentId,
            status: {
                $in: ["Pending", "Approved"]
            }
        });

    if (existingApplication) {
        throw new ApiError(409, "You have already applied for this event.");
    }

    try {

        const application =
            await VolunteerApplication.create({

                eventId,

                studentId,

                fullName: student.fullName,
                
                studentIdNumber: student.studentId,

                semester: student.semester,

                email: student.email,

                previousExperience:
                    data.previousExperience || null
            });

        return application;

    } catch (error) {

        // Mongo Duplicate Key
        if (error.code === 11000) {
            throw new ApiError(409, "You have already applied for this event.");
        }

        throw error;
    }

};

// ====================
// APPROVE APPLICATION //
// ====================

const approveApplication = async (applicationId, facultyId) => {
    const application = await VolunteerApplication.findById(applicationId);

    if (!application) {
        throw new ApiError(404, "Application not found.");
    }

    const event = await Event.findById(application.eventId);

    if (!event) {
        throw new ApiError(404, "Event not found.");
    }

    // Check faculty owns the event
    if (event.createdBy.toString() !== facultyId.toString()) {
        throw new ApiError(403, "You are not authorized to approve this application.");
    }

    // Application must be Pending
    if (application.status !== "Pending") {
        throw new ApiError(400, "Only pending applications can be approved.");
    }

    // Atomically increase approvedCount only if capacity is available
    const updatedEvent = await Event.findOneAndUpdate(
        {
            _id: event._id,
            $expr: {                                             //expr allows us to use aggregation expressions in the query
                $lt: ["$approvedCount", "$volunteerCapacity"]    //lt = less than
            }
        },
        {
            $inc: {
                approvedCount: 1
            }
        },
        {
            new: true
        }
    );

    // Capacity was already reached
    if (!updatedEvent) {
        throw new ApiError(409, "Event capacity already reached.");
    }

    // Approve application
    application.status = "Approved";
    application.decisionBy = facultyId;
    application.decisionAt = new Date();

    await application.save();

    // Check whether event is now full
    await eventService.checkAndCloseIfFull(event._id);

    return application;
};

// ====================
// REJECT APPLICATION //
// ====================

const rejectApplication = async (applicationId, facultyId) => {
    const application = await VolunteerApplication.findById(applicationId);

    if (!application) {
        throw new ApiError(404, "Application not found.");
    }

    const event = await Event.findById(application.eventId);

    if (!event) {
        throw new ApiError(404, "Event not found.");
    }

    // Check faculty owns the event
    if (event.createdBy.toString() !== facultyId.toString()) {
        throw new ApiError(403, "You are not authorized to reject this application.");
    }

    // Application must be Pending
    if (application.status !== "Pending") {
        throw new ApiError(400, "Only pending applications can be rejected.");
    }

    // Reject application
    application.status = "Rejected";
    application.decisionBy = facultyId;
    application.decisionAt = new Date();

    await application.save();

    return application;
};

// =============================
// GET APPLICATIONS BY STUDENT // Get applications by studentId with optional status filter
// =============================

const getByStudent = async (studentId, statusFilter) => {    //status filter = "approved", "pending", "rejected" or null
    const query = {
        studentId
    };

    // Optional status filter
    if (statusFilter) {
        query.status = statusFilter;
    }

    const applications = await VolunteerApplication.find(query)
        .populate({
            path: "eventId",
            select: "title description eventDate applicationDeadline volunteerCapacity approvedCount eventLevel status"
        })
        .sort({
            appliedAt: -1
        });

    return applications;
};

const getByEvent = async (eventId, statusFilter) => {
    const query = {
        eventId
    };

    // Optional status filter
    if (statusFilter) {
        query.status = statusFilter;
    }

    const applications = await VolunteerApplication.find(query)
        .populate({
            path: "studentId",
            select: "fullName studentId email semester instituteId departmentId"
        })
        .sort({
            appliedAt: -1
        });

    return applications;
};

const getAll = async (filters = {}) => {
    const query = {};

    // Filter by event
    if (filters.eventId) {
        query.eventId = filters.eventId;
    }

    // Filter by student
    if (filters.studentId) {
        query.studentId = filters.studentId;
    }

    // Filter by status
    if (filters.status) {
        query.status = filters.status;
    }

    const applications = await VolunteerApplication.find(query)
        .populate({
            path: "eventId",                //populate replace the eventId reference with the actual event document
            select: "title eventDate applicationDeadline volunteerCapacity approvedCount eventLevel status"
        })
        .populate({
            path: "studentId",              //populate replace the studentId reference with the actual student document
            select: "fullName studentId email semester instituteId departmentId"
        })
        .populate({                         //populate replace the decisionBy reference with the actual faculty document
            path: "decisionBy",
            select: "fullName email"
        })
        .sort({
            appliedAt: -1
        });

    return applications;
};

module.exports = {
    applyToEvent,
    approveApplication,
    rejectApplication,
    getByStudent,
    getByEvent,
    getAll
};