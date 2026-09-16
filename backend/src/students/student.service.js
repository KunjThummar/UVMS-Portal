const Student = require("../models/student.model");
const Institute = require("../models/institute.model");
const Department = require("../models/department.model");
const ApiError = require("../utils/ApiError");
const bcrypt = require("bcrypt");

const getProfile = async (studentId) => {
    const student = await Student.findById(studentId)
        .select("-passwordHash")
        .populate("instituteId", "name code")
        .populate("departmentId", "name code");

    if (!student) {
        throw new ApiError(404, "Student not found.");
    }

    return student;
};

const listAll = async (filters = {}) => {
    try {
        const { status } = filters;
        const filter = {};
        if (status === 'active') filter.isActive = true;
        if (status === 'inactive') filter.isActive = false;
        return await Student.find(filter).populate("instituteId", "name code").populate("departmentId", "name code").sort({ createdAt: -1 });
    } catch (error) {
        throw new ApiError(500, 'Failed to fetch students: ' + error.message);
    }
};

const create = async (data) => {
    const { fullName, studentId, email, password, instituteId, departmentId, semester } = data;

    const existingStudentId = await Student.findOne({ studentId });
    if (existingStudentId) {
        throw new ApiError(409, 'Student ID already exists.');
    }

    const existingEmail = await Student.findOne({ email });
    if (existingEmail) {
        throw new ApiError(409, 'Email already registered.');
    }

    const institute = await Institute.findById(instituteId);
    if (!institute) {
        throw new ApiError(404, 'No institute with given instituteId found');
    }

    const department = await Department.findById(departmentId);
    if (!department) {
        throw new ApiError(404, 'No department with given departmentId found');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    try {
        const student = new Student({
            fullName,
            studentId,
            email,
            passwordHash,
            instituteId,
            departmentId,
            semester
        });
        return await student.save();
    } catch (error) {
        throw new ApiError(500, 'Failed to create student: ' + error.message);
    }
};

const updateById = async (id, data) => {
    const student = await Student.findById(id);
    if (!student) {
        throw new ApiError(404, "Student not found.");
    }

    if (data.email && data.email !== student.email) {
        const existingEmail = await Student.findOne({ email: data.email, _id: { $ne: id } });
        if (existingEmail) {
            throw new ApiError(409, 'Email already registered.');
        }
    }

    if (data.instituteId) {
        const institute = await Institute.findById(data.instituteId);
        if (!institute) {
            throw new ApiError(404, 'No institute with given instituteId found');
        }
    }

    if (data.departmentId) {
        const department = await Department.findById(data.departmentId);
        if (!department) {
            throw new ApiError(404, 'No department with given departmentId found');
        }
    }

    if (data.password) {
        data.passwordHash = await bcrypt.hash(data.password, 10);
        delete data.password;
    }

    try {
        return await Student.findByIdAndUpdate(id, data, { new: true }).select("-passwordHash");
    } catch (error) {
        throw new ApiError(500, 'Failed to update student: ' + error.message);
    }
};

const remove = async (id) => {
    const student = await Student.findById(id);
    if (!student) {
        throw new ApiError(404, "Student not found.");
    }
    try {
        await Student.findByIdAndDelete(id);
        return { message: "Student removed successfully." };
    } catch (error) {
        throw new ApiError(500, 'Failed to delete student: ' + error.message);
    }
};

const toggleStatus = async (id, isActive) => {
    const student = await Student.findById(id);
    if (!student) {
        throw new ApiError(404, "Student not found.");
    }
    try {
        student.isActive = isActive;
        return await student.save();
    } catch (error) {
        throw new ApiError(500, 'Failed to update student status: ' + error.message);
    }
};

module.exports = {
    getProfile,
    listAll,
    create,
    updateById,
    remove,
    toggleStatus
};