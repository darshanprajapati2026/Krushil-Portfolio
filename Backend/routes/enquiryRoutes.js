const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

const Enquiry = require("../models/Enquiry");

// Import authentication middleware
const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");

// GET ALL ENQUIRIES (ADMIN ONLY)
router.get(
    "/",
    protect,
    adminOnly,
    async (req, res) => {
        try {
            const enquiries = await Enquiry.find().sort({
                createdAt: -1
            });

            res.status(200).json({
                success: true,
                count: enquiries.length,
                enquiries
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Unable to fetch enquiries."
            });
        }
    }
);

// CREATE NEW CUSTOMER ENQUIRY
router.post(
    "/",
    async (req, res) => {
        try {
            const {
                name,
                email,
                phone,
                subject,
                message
            } = req.body;

            // Validate required fields
            if (!name || !email || !phone || !message) {
                return res.status(400).json({
                    success: false,
                    message: "Please fill all required fields."
                });
            }

            // Save enquiry in MongoDB
            const enquiry = await Enquiry.create({
                name,
                email,
                phone,
                subject,
                message
            });

            res.status(201).json({
                success: true,
                message: "Enquiry submitted successfully!",
                enquiry
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Unable to submit enquiry."
            });
        }
    }
);

// UPDATE ENQUIRY STATUS (ADMIN ONLY)
router.patch(
    "/:id/status",
    protect,
    adminOnly,
    async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            // Validate Enquiry ID
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid enquiry ID."
                });
            }

            // Validate Status
            if (!["new", "contacted", "completed"].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid enquiry status."
                });
            }

            // Update Enquiry
            const enquiry = await Enquiry.findByIdAndUpdate(
                id,
                { status },
                { new: true, runValidators: true }
            );

            if (!enquiry) {
                return res.status(404).json({
                    success: false,
                    message: "Enquiry not found."
                });
            }

            res.status(200).json({
                success: true,
                message: "Enquiry status updated successfully!",
                enquiry
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Unable to update enquiry status."
            });
        }
    }
);


// DELETE ENQUIRY (ADMIN ONLY)
router.delete(
    "/:id",
    protect,
    adminOnly,
    async (req, res) => {
        try {
            const { id } = req.params;

            // Validate Enquiry ID
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid enquiry ID."
                });
            }

            // Delete Enquiry
            const enquiry = await Enquiry.findByIdAndDelete(id);

            if (!enquiry) {
                return res.status(404).json({
                    success: false,
                    message: "Enquiry not found."
                });
            }

            res.status(200).json({
                success: true,
                message: "Enquiry deleted successfully!"
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Unable to delete enquiry."
            });
        }
    }
);

module.exports = router;