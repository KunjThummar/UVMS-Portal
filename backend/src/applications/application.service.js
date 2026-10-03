const VolunteerApplication = require("../models/volunteerapplication.model");
const Event = require("../models/event.model");
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

                mobileNumber: student.mobileNumber || null,

                appliedRole: data.appliedRole || "Volunteer",

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
    const creatorId = (event.createdBy?._id || event.createdBy).toString();
    if (creatorId !== facultyId.toString()) {
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
    const creatorId = (event.createdBy?._id || event.createdBy).toString();
    if (creatorId !== facultyId.toString()) {
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
    if (statusFilter && statusFilter !== 'All') {
        query.status = statusFilter;
    }

    const applications = await VolunteerApplication.find(query)
        .populate({
            path: "eventId",
            select: "title description eventDate eventEndDate academicYear organizer subOrganizer eventType eventMode eventDay applicationDeadline volunteerCapacity approvedCount eventLevel status"
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
    if (statusFilter && statusFilter !== 'All') {
        query.status = statusFilter;
    }

    const applications = await VolunteerApplication.find(query)
        .populate({
            path: "studentId",
            select: "fullName studentId email mobileNumber semester instituteId departmentId"
        })
        .sort({
            appliedAt: -1
        });

    const enrichedApplications = await Promise.all(
        applications.map(async (app) => {
            const appObj = app.toObject();
            const studentMongoId = app.studentId?._id || app.studentId;

            if (studentMongoId) {
                const pastParticipations = await VolunteerApplication.find({
                    studentId: studentMongoId,
                    status: "Approved",
                    eventId: { $ne: eventId }
                })
                .populate({
                    path: "eventId",
                    select: "title eventDate eventEndDate academicYear organizer subOrganizer eventType eventMode eventDay eventLevel status"
                })
                .sort({ appliedAt: -1 });

                appObj.pastParticipations = pastParticipations.map((p) => ({
                    applicationId: p._id,
                    eventId: p.eventId?._id,
                    eventTitle: p.eventId?.title || "Unknown Event",
                    eventDate: p.eventId?.eventDate,
                    eventLevel: p.eventId?.eventLevel,
                    eventStatus: p.eventId?.status,
                    appliedRole: p.appliedRole || "Volunteer",
                    previousExperience: p.previousExperience,
                    decisionAt: p.decisionAt
                }));
                appObj.pastParticipationCount = pastParticipations.length;
            } else {
                appObj.pastParticipations = [];
                appObj.pastParticipationCount = 0;
            }

            return appObj;
        })
    );

    return enrichedApplications;
};

const getAll = async (filters = {}) => {
    const query = {};

    // Filter by event (strictly ignore empty and 'all' to prevent Cast to ObjectId error)
    if (filters.eventId && typeof filters.eventId === 'string') {
        const trimmedEventId = filters.eventId.trim();
        if (trimmedEventId !== '' && trimmedEventId.toLowerCase() !== 'all') {
            query.eventId = trimmedEventId;
        }
    }

    // Filter by student (strictly ignore empty and 'all')
    if (filters.studentId && typeof filters.studentId === 'string') {
        const trimmedStudentId = filters.studentId.trim();
        if (trimmedStudentId !== '' && trimmedStudentId.toLowerCase() !== 'all') {
            query.studentId = trimmedStudentId;
        }
    }

    // Filter by status (case-insensitive check against 'all')
    if (filters.status && typeof filters.status === 'string') {
        const trimmedStatus = filters.status.trim();
        if (trimmedStatus !== '' && trimmedStatus.toLowerCase() !== 'all') {
            query.status = trimmedStatus;
        }
    }

    const applications = await VolunteerApplication.find(query)
        .populate({
            path: "eventId",                //populate replace the eventId reference with the actual event document
            select: "title eventDate eventEndDate academicYear organizer subOrganizer eventType eventMode eventDay applicationDeadline volunteerCapacity approvedCount eventLevel status"
        })
        .populate({
            path: "studentId",              //populate replace the studentId reference with the actual student document
            select: "fullName studentId email mobileNumber semester instituteId departmentId"
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

const getStudentParticipationHistory = async (studentId) => {
    const student = await Student.findById(studentId).select("-passwordHash");
    if (!student) {
        throw new ApiError(404, "Student not found.");
    }

    const applications = await VolunteerApplication.find({
        studentId,
        status: "Approved"
    })
    .populate({
        path: "eventId",
        select: "title description eventDate eventEndDate academicYear organizer subOrganizer eventType eventMode eventDay applicationDeadline volunteerCapacity approvedCount eventLevel status isArchived createdBy",
        populate: {
            path: "createdBy",
            select: "fullName email"
        }
    })
    .sort({ appliedAt: -1 });

    const roleBreakdown = {
        Coordinator: 0,
        "Sub-Coordinator": 0,
        Volunteer: 0
    };

    applications.forEach((app) => {
        const role = app.appliedRole || "Volunteer";
        if (roleBreakdown[role] !== undefined) {
            roleBreakdown[role]++;
        } else {
            roleBreakdown[role] = 1;
        }
    });

    return {
        student: {
            id: student._id,
            fullName: student.fullName,
            studentId: student.studentId,
            email: student.email,
            mobileNumber: student.mobileNumber,
            semester: student.semester
        },
        totalParticipations: applications.length,
        roleBreakdown,
        history: applications
    };
};

module.exports = {
    applyToEvent,
    approveApplication,
    rejectApplication,
    getByStudent,
    getByEvent,
    getAll,
    getStudentParticipationHistory
};