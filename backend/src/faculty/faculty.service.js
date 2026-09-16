const Faculty = require("../models/faculty.model");
const Institute = require("../models/institute.model");
const Department = require("../models/department.model");
const ApiError = require("../utils/ApiError");
const bcrypt = require("bcrypt");

const listAll = async (filters = {}) => {
    try {
        const { status } = filters;
        const filter = {};
        if (status === 'active') filter.isActive = true;
        if (status === 'inactive') filter.isActive = false;
        return await Faculty.find(filter).populate("instituteId", "name code").populate("departmentId", "name code").sort({ createdAt: -1 });
    } catch (error) {
        throw new ApiError(500, 'Failed to fetch faculty: ' + error.message);
    }
};

const create = async (data) => {
    const { fullName, email, password, instituteId, departmentId } = data;

    const existingEmail = await Faculty.findOne({ email });
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
        const faculty = new Faculty({
            fullName,
            email,
            passwordHash,
            instituteId,
            departmentId
        });
        return await faculty.save();
    } catch (error) {
        throw new ApiError(500, 'Failed to create faculty: ' + error.message);
    }
};

const updateById = async (id, data) => {
    const faculty = await Faculty.findById(id);
    if (!faculty) {
        throw new ApiError(404, "Faculty not found.");
    }

    if (data.email && data.email !== faculty.email) {
        const existingEmail = await Faculty.findOne({ email: data.email, _id: { $ne: id } });
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
        return await Faculty.findByIdAndUpdate(id, data, { new: true }).select("-passwordHash");
    } catch (error) {
        throw new ApiError(500, 'Failed to update faculty: ' + error.message);
    }
};

const remove = async (id) => {
    const faculty = await Faculty.findById(id);
    if (!faculty) {
        throw new ApiError(404, "Faculty not found.");
    }
    try {
        await Faculty.findByIdAndDelete(id);
        return { message: "Faculty removed successfully." };
    } catch (error) {
        throw new ApiError(500, 'Failed to delete faculty: ' + error.message);
    }
};

const toggleStatus = async (id, isActive) => {
    const faculty = await Faculty.findById(id);
    if (!faculty) {
        throw new ApiError(404, "Faculty not found.");
    }
    try {
        faculty.isActive = isActive;
        return await faculty.save();
    } catch (error) {
        throw new ApiError(500, 'Failed to update faculty status: ' + error.message);
    }
};

module.exports = {
    listAll,
    create,
    updateById,
    remove,
    toggleStatus
};
