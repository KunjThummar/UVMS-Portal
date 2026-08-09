const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        passwordHash: {
            type: String,
            required: true
        },

        instituteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Institute",
            required: true
        },

        departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            required: true
        },

        isActive: {
            type: Boolean,
            default: true
        },
    },
    {
        timestamps: true,
    }
);

facultySchema.index({ instituteId: 1 });

facultySchema.index({ departmentId: 1 });

module.exports = mongoose.model("Faculty", facultySchema);