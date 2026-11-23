
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

module.exports = router;
