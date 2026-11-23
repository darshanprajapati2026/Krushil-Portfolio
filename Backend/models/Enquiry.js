
const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },

    phone: {
        type: String,
        required: true,
        trim: true
    },

    subject: {
        type: String,
        trim: true
    },

    message: {
        type: String,
        required: true,
        trim: true
    },

    status: {
        type: String,
        enum: ["new", "contacted", "completed"],
        default: "new"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("Enquiry", enquirySchema);
