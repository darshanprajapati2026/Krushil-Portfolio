
const express = require("express");
const router = express.Router();

// Import authentication middleware
const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");

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

module.exports = router;
