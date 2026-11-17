
const express = require("express");
const router = express.Router();

// Import authentication middleware
const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");

// Import User Model
const User = require("../models/User");

// ADMIN DASHBOARD API
router.get(
    "/dashboard",
    protect,
    adminOnly,
    (req, res) => {
        res.status(200).json({
            success: true,
            message: "Welcome to Admin Dashboard!",
            admin: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role
            }
        });
    }
);

// CUSTOMER MANAGEMENT API
router.get(
    "/customers",
    protect,
    adminOnly,
    async (req, res) => {
        try {
            const customers = await User.find({ role: "customer" })
                .select("-password")
                .sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                totalCustomers: customers.length,
                customers: customers
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Unable to fetch customers.",
                error: error.message
            });
        }
    }
);

module.exports = router;
