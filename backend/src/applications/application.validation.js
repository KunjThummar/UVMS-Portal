const Joi = require("joi");

// =====================================
// Apply Validation
// =====================================
const applySchema = Joi.object({
    appliedRole: Joi.string()
        .valid("Coordinator", "Sub-Coordinator", "Volunteer")
        .default("Volunteer")
        .optional()
        .messages({
            "any.only": "Applied role must be Coordinator, Sub-Coordinator, or Volunteer.",
        }),
    previousExperience: Joi.string()
        .trim()
        .allow("")
        .optional(),
});

// =====================================
// Decision Validation
// =====================================
const decisionSchema = Joi.object({
    action: Joi.string()
        .valid("approve", "reject")
        .required(),
});

const validateApply = (data) =>
    applySchema.validate(data, {
        abortEarly: false,              //stop further validation on first error
        stripUnknown: true,             //remove unknown keys from the validated data
    });

const validateDecision = (data) =>
    decisionSchema.validate(data, {
        abortEarly: false,
        stripUnknown: true,
    });

module.exports = {
    validateApply,
    validateDecision,
};