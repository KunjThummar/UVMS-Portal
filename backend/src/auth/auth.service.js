const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Student = require("../models/student.model");
const Faculty = require("../models/faculty.model");
const Administrator = require("../models/admin.model");

const ApiError = require("../utils/ApiError");
const generateToken = require("../utils/generateToken");

// ====================
// REGISTER STUDENT //
// ====================

const registerStudent = async (data) => {
    const {
        fullName,
        studentId,
        email,
        password,
        instituteId,
        departmentId,
        semester,
    } = data;

    // Check if email already exists
    const existingEmail = await Student.findOne({ email });

    if (existingEmail) {
        throw new ApiError(409, "Email already registered.");
    }

    // Check if studentId already exists
    const existingStudent = await Student.findOne({ studentId });

    if (existingStudent) {
        throw new ApiError(409, "Student ID already registered.");
    }

    // Hash Password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create Student
    const student = await Student.create({
        fullName,
        studentId,
        email,
        passwordHash,
        instituteId,
        departmentId,
        semester,
    });

    // Remove Password
    const createdStudent = await Student.findById(student._id).select(
        "-passwordHash"
    );

    return createdStudent;
};

// ====================
// LOGIN STUDENT //
// ====================

const loginStudent = async (email, password) => {
    // Find student by email
    const student = await Student.findOne({ email });

    if (!student) {
        throw new ApiError(401, "Invalid email or password.");
    }

    // Check if account is active
    if (!student.isActive) {
        throw new ApiError(403, "Your account has been deactivated.");
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(
        password,
        student.passwordHash
    );

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid email or password.");
    }

    // Generate JWT Token
    const token = generateToken(student._id, "Student");

    // Remove password before sending response
    const studentProfile = student.toObject();
    delete studentProfile.passwordHash;

    return {
        token,
        student: studentProfile,
    };
};

// ====================
// REGISTER FACULTY //
// ====================

const registerFaculty = async (data) => {
    const {
        fullName,
        email,
        password,
        instituteId,
        departmentId,
    } = data;

    // Check if email already exists
    const existingFaculty = await Faculty.findOne({ email });

    if (existingFaculty) {
        throw new ApiError(409, "Email already registered.");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create faculty
    const faculty = await Faculty.create({
        fullName,
        email,
        passwordHash,
        instituteId,
        departmentId,
    });

    // Remove password before returning
    const createdFaculty = await Faculty.findById(faculty._id).select(
        "-passwordHash"
    );

    return createdFaculty;
};

// ====================
// LOGIN FACULTY //
// ====================

const loginFaculty = async (email, password) => {
    // Find faculty by email
    const faculty = await Faculty.findOne({ email });

    if (!faculty) {
        throw new ApiError(401, "Invalid email or password.");
    }

    // Check if account is active
    if (!faculty.isActive) {
        throw new ApiError(403, "Your account has been deactivated.");
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(
        password,
        faculty.passwordHash
    );

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid email or password.");
    }

    // Generate JWT Token
    const token = generateToken(faculty._id, "Faculty");

    // Remove password before sending response
    const facultyProfile = faculty.toObject();
    delete facultyProfile.passwordHash;

    return {
        token,
        faculty: facultyProfile,
    };
};

// ====================
// LOGIN ADMINISTRATOR //
// ====================

const loginAdmin = async (email, password) => {
    // Find admin by email
    const admin = await Administrator.findOne({ email });

    if (!admin) {
        throw new ApiError(401, "Invalid email or password.");
    }

    // Check if account is active
    if (!admin.isActive) {
        throw new ApiError(403, "Your account has been deactivated.");
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(
        password,
        admin.passwordHash
    );

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid email or password.");
    }

    // Generate JWT Token
    const token = generateToken(admin._id, "Admin");

    // Remove password before sending response
    const adminProfile = admin.toObject();
    delete adminProfile.passwordHash;

    return {
        token,
        admin: adminProfile,
    };
};

// ====================
// GET PROFILE BY ROLE
// ====================

const getProfileByRole = async (id, role) => {
    let profile;

    switch (role) {
        case "Student":
            profile = await Student.findById(id).select("-passwordHash");
            break;

        case "Faculty":
            profile = await Faculty.findById(id).select("-passwordHash");
            break;

        case "Admin":
            profile = await Administrator.findById(id).select("-passwordHash");
            break;

        default:
            throw new ApiError(400, "Invalid user role.");
    }

    if (!profile) {
        throw new ApiError(404, "User not found.");
    }

    return profile;
};

module.exports = {
    registerStudent,
    loginStudent,
    registerFaculty,
    loginFaculty,
    loginAdmin,
    getProfileByRole,
};