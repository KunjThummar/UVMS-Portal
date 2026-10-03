const Joi = require("joi");

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

const validateCreateFaculty = (data) => {
    const schema = Joi.object({
        fullName: Joi.string().trim().required(),
        email: Joi.string().trim().lowercase().email().required(),
        mobileNumber: Joi.string().trim().pattern(/^[0-9]{10}$/).required(),
        password: Joi.string().min(6).required(),
        instituteId: objectId.required(),
        departmentId: objectId.required(),
    });
    return schema.validate(data, { abortEarly: false, stripUnknown: true });
};

const validateUpdateFaculty = (data) => {
    const schema = Joi.object({
        fullName: Joi.string().trim().optional(),
        email: Joi.string().trim().lowercase().email().optional(),
        mobileNumber: Joi.string().trim().pattern(/^[0-9]{10}$/).optional(),
        password: Joi.string().min(6).optional(),
        instituteId: objectId.optional(),
        departmentId: objectId.optional(),
    });
    return schema.validate(data, { abortEarly: false, stripUnknown: true });
};

module.exports = {
    validateCreateFaculty,
    validateUpdateFaculty,
};
