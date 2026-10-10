const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Student = require("../models/student.model");
const Faculty = require("../models/faculty.model");
const Administrator = require("../models/admin.model");

const ApiError = require("../utils/ApiError");
const { generateToken, generateResetPasswordToken } = require("../utils/generateToken");
const { sendResetPasswordMail } = require("../notifications/email.service");

const UNIVERSITY_STUDENT_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@charusat\.edu\.in$/;
const UNIVERSITY_FACULTY_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@charusat\.ac\.in$/;

// ====================
// REGISTER STUDENT //
// ====================

const registerStudent = async (data) => {
    const {
        fullName,
        studentId,
        email,
        mobileNumber,
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
        mobileNumber,
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
    const token = generateToken(student._id, "student");

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
        mobileNumber,
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
        mobileNumber,
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
    const token = generateToken(faculty._id, "faculty");

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

    // Check if account is active (treat missing field as active for backwards compatibility)
    if (admin.isActive === false) {
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
    const token = generateToken(admin._id, "admin");

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
    const normalizedRole = role?.toLowerCase();

    switch (normalizedRole) {
        case "student":
            profile = await Student.findById(id).select("-passwordHash");
            break;

        case "faculty":
            profile = await Faculty.findById(id).select("-passwordHash");
            break;

        case "admin":
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


// ====================
// FORGOT PASSWORD
// ====================
const forgotPassword = async (email) => {
    if (!email) {
        throw new ApiError(400, "Email is required.");
    }

    const normalizedEmail = email.trim().toLowerCase();

    let Model;
    let role;

    if (UNIVERSITY_FACULTY_EMAIL_REGEX.test(normalizedEmail)) {
        Model = Faculty;
        role = "faculty";
    } else if (UNIVERSITY_STUDENT_EMAIL_REGEX.test(normalizedEmail)) {
        Model = Student;
        role = "student";
    } else {
        throw new ApiError(
            400,
            "Please enter your official college email (@charusat.edu.in or @charusat.ac.in)."
        );
    }

    const user = await Model.findOne({ email: normalizedEmail });

    // Silent return if user does not exist (prevents account enumeration attacks)
    if (!user) {
        console.info(`Password reset requested for non-existing email: ${normalizedEmail}`);
        return;
    }

    try {
        const token = generateResetPasswordToken(user._id, role, "reset password");
        await sendResetPasswordMail(normalizedEmail, token);
    } catch (error) {
        console.error("Failed to send reset email:", error.message);
        throw new ApiError(500, "Failed to send reset email. Please try again later.");
    }
};

// ====================
// RESET PASSWORD
// ====================
const resetPassword = async (token, newPassword) => {
    if (!token || !newPassword) {
        throw new ApiError(400, "Reset token and new password are required.");
    }

    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new ApiError(400, "Invalid or expired reset link.");
    }

    if (payload.purpose !== "reset password") {
        throw new ApiError(400, "Invalid or expired reset link.");
    }

    const Model = payload.role === "faculty" ? Faculty : Student;
    const user = await Model.findById(payload.id);

    if (!user) {
        throw new ApiError(400, "Invalid or expired reset link.");
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return { message: "Password updated successfully." };
};





module.exports = {
    registerStudent,
    loginStudent,
    registerFaculty,
    loginFaculty,
    loginAdmin,
    getProfileByRole,
    forgotPassword,
    resetPassword,
};