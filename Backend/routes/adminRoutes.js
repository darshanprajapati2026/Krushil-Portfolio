// Import User Model
const User = require("../models/User");
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

// CUSTOMER MANAGEMENT API
// router.get(
//     "/customers",
//     protect,
//     adminOnly,
//     async (req, res) => {
//         try {
//             const customers = await User.find({ role: "customer" })
//                 .select("-password")
//                 .sort({ createdAt: -1 });

//             res.status(200).json({
//                 success: true,
//                 totalCustomers: customers.length,
//                 customers: customers
//             });

//         } catch (error) {
//             res.status(500).json({
//                 success: false,
//                 message: "Unable to fetch customers.",
//                 error: error.message
//             });
//         }
//     }
// );


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
                message: "Unable to fetch customers."
            });
        }
    }
);



// DELETE CUSTOMER API
router.delete(
    "/customers/:id",
    protect,
    adminOnly,
    async (req, res) => {
        try {
            const mongoose = require("mongoose");

            // Validate customer ID
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid customer ID."
                });
            }

            // Delete only customer accounts, never admin accounts
            const customer = await User.findOneAndDelete({
                _id: req.params.id,
                role: "customer"
            });

            if (!customer) {
                return res.status(404).json({
                    success: false,
                    message: "Customer not found."
                });
            }

            res.status(200).json({
                success: true,
                message: "Customer deleted successfully."
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Unable to delete customer."
            });
        }
    }
);

module.exports = router;
