const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
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
    },
    {
        timestamps: true,
    }
);


module.exports = mongoose.model('Administrator', adminSchema);