const Faculty = require('../models/faculty.model');
const ApiError = require("../utils/ApiError");
const Student = require('../models/student.model');
const {generateResetPasswordToken} = require('./generateToken');

const UNIVERSITY_STUDENT_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@charusat\.edu\.in$/;

const UNIVERSITY_FACULTY_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@charusat\.ac\.in$/;

async function forgotPassword(email) {
    const normalizedEmail = email.trim().toLowerCase();

    let Model, role;
    if (UNIVERSITY_FACULTY_EMAIL_REGEX.test(normalizedEmail)) {
        Model = Faculty;
        role = "faculty";
    } else if (UNIVERSITY_STUDENT_EMAIL_REGEX.test(normalizedEmail)) {
        Model = Student;
        role = "student";
    } else {
        throw new ApiError(400, "Please enter your college email id");
    }

    const user = await Model.findOne({ email: normalizedEmail });
    if (!user) {
        console.info("Reset requested for unknown email");
        return;
    }

    try {
        const token = generateResetPasswordToken(user_id, role ,"reset password");
        await sendResetPasswordMail(normalizedEmail, token);
    } catch (error) {
        console.error("Reset mail failed:", error.message); 
    }
}