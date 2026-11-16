
const express = require("express");
const router = express.Router();

// Import authentication controller functions
const {
    registerUser,
    loginUser
} = require("../controllers/authController");

// Import authentication middleware
const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");

// CUSTOMER REGISTRATION
router.post("/register", registerUser);

// CUSTOMER / ADMIN LOGIN
router.post("/login", loginUser);

// PROTECTED ADMIN TEST ROUTE
router.get("/admin-dashboard", protect, adminOnly, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to Krushil Web Services Admin Dashboard!",
        admin: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role
        }
    });
});

module.exports = router;