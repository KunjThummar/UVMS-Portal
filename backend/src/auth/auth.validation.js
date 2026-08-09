const Joi = require("joi");    //checks whether the data is valid or not before it reaches service or database.

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

const UNIVERSITY_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@charusat\.edu\.in$/;

const studentRegisterSchema = Joi.object({
    fullName: Joi.string().trim().required(),

    studentId: Joi.string().trim().required(),

    email: Joi.string()
        .trim()
        .lowercase()
        .pattern(UNIVERSITY_EMAIL_REGEX)
        .required()
        .messages({
            "string.pattern.base":
                "Only official university email is allowed.",
        }),

    password: Joi.string().min(6).required(),

    instituteId: objectId.required(),

    departmentId: objectId.required(),

    semester: Joi.number().integer().min(1).max(12).required(),
});

const facultyRegisterSchema = Joi.object({
    fullName: Joi.string().trim().required(),

    email: Joi.string().email().trim().lowercase().required(),

    password: Joi.string().min(6).required(),

    instituteId: objectId.required(),

    departmentId: objectId.required(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().trim().lowercase().required(),

    password: Joi.string().required(),
});

const adminSeedSchema = Joi.object({
    fullName: Joi.string().trim().required(),

    email: Joi.string().email().trim().lowercase().required(),

    password: Joi.string().min(6).required(),

    seedSecret: Joi.string().required(),
});

const validateStudentRegister = (data) =>
    studentRegisterSchema.validate(data, {
        abortEarly: false,
        stripUnknown: true,
    });

const validateFacultyRegister = (data) =>
    facultyRegisterSchema.validate(data, {
        abortEarly: false,
        stripUnknown: true,
    });

const validateLogin = (data) =>
    loginSchema.validate(data, {
        abortEarly: false,
        stripUnknown: true,
    });

const validateAdminSeed = (data) =>
    adminSeedSchema.validate(data, {
        abortEarly: false,
        stripUnknown: true,
    });

module.exports = {
    validateStudentRegister,
    validateFacultyRegister,
    validateLogin,
    validateAdminSeed,
};