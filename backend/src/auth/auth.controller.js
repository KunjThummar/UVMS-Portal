const authService = require("./auth.service");

const {
    validateStudentRegister,
    validateFacultyRegister,
    validateLogin,
} = require("./auth.validation");

// ===============================
// Student Registration
// ===============================
const registerStudent = async (req, res) => {
    try {
        const { error, value } = validateStudentRegister(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                errors: error.details.map((err) => err.message),
            });
        }

        const student = await authService.registerStudent(value);

        return res.status(201).json({
            success: true,
            message: "Student registered successfully. Please login.",
            data: student,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ===============================
// Student Login
// ===============================
const loginStudent = async (req, res) => {
    try {
        const { error, value } = validateLogin(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                errors: error.details.map((err) => err.message),
            });
        }

        const result = await authService.loginStudent(
            value.email,
            value.password
        );

        return res.status(200).json({
            success: true,
            message: "Student login successful.",
            data: result,
        });
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message,
        });
    }
};

// ===============================
// Faculty Registration
// ===============================
const registerFaculty = async (req, res) => {
    try {
        const { error, value } = validateFacultyRegister(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                errors: error.details.map((err) => err.message),
            });
        }

        const faculty = await authService.registerFaculty(value);

        return res.status(201).json({
            success: true,
            message: "Faculty registered successfully. Please login.",
            data: faculty,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ===============================
// Faculty Login
// ===============================
const loginFaculty = async (req, res) => {
    try {
        const { error, value } = validateLogin(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                errors: error.details.map((err) => err.message),
            });
        }

        const result = await authService.loginFaculty(
            value.email,
            value.password
        );

        return res.status(200).json({
            success: true,
            message: "Faculty login successful.",
            data: result,
        });
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message,
        });
    }
};

// ===============================
// Admin Login
// ===============================
const loginAdmin = async (req, res) => {
    try {
        const { error, value } = validateLogin(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                errors: error.details.map((err) => err.message),
            });
        }

        const result = await authService.loginAdmin(
            value.email,
            value.password
        );

        return res.status(200).json({
            success: true,
            message: "Admin login successful.",
            data: result,
        });
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message,
        });
    }
};

// ===============================
// Get Logged-in User
// ===============================
const getMe = async (req, res) => {
    try {
        const profile = await authService.getProfileByRole(
            req.user.id,
            req.user.role
        );

        return res.status(200).json({
            success: true,
            message: "Profile fetched successfully.",
            data: profile,
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    registerStudent,
    loginStudent,
    registerFaculty,
    loginFaculty,
    loginAdmin,
    getMe,
};