const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
    {
        fullName: {
            type: mongoose.Schema.Types.String,
            required: true,
            trim: true
        },

        studentId: {
            type: String,
            required: true,
            unique: true,
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

        semester: {
            type: Number,
            required: true,
            min: 1,
            max: 12
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

studentSchema.index({ instituteId: 1 });
studentSchema.index({ departmentId: 1 });

module.exports = mongoose.model("Student", studentSchema);