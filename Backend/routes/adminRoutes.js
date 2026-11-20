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

// EDIT CUSTOMER API
router.put(
    "/customers/:id",
    protect,
    adminOnly,
    async (req, res) => {
        try {
            const { name, email } = req.body;

            const customer = await User.findOneAndUpdate(
                {
                    _id: req.params.id,
                    role: "customer"
                },
                {
                    name,
                    email
                },
                {
                    new: true,
                    runValidators: true
                }
            );

            if (!customer) {
                return res.status(404).json({
                    success: false,
                    message: "Customer not found"
                });
            }

            res.status(200).json({
                success: true,
                message: "Customer updated successfully",
                customer
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Server error",
                error: error.message
            });
        }
    }
);

// UPDATE CUSTOMER ACCOUNT STATUS API
router.patch(
    "/customers/:id/status",
    protect,
    adminOnly,
    async (req, res) => {
        try {

            const mongoose = require("mongoose");

            const { status } = req.body;

            // VALIDATE CUSTOMER ID
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid customer ID."
                });
            }

            // VALIDATE ACCOUNT STATUS
            if (!["active", "inactive"].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid account status."
                });
            }

            // UPDATE CUSTOMER STATUS
            const customer = await User.findOneAndUpdate(
                {
                    _id: req.params.id,
                    role: "customer"
                },
                {
                    status: status
                },
                {
                    new: true,
                    runValidators: true
                }
            ).select("-password");

            if (!customer) {
                return res.status(404).json({
                    success: false,
                    message: "Customer not found."
                });
            }

            res.status(200).json({
                success: true,
                message: "Customer status updated successfully.",
                customer: customer
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                message: "Unable to update customer status."
            });

        }
    }
);

module.exports = router;
