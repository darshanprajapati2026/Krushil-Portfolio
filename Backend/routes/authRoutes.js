
const express = require("express");
const router = express.Router();

// Import authentication controller functions
const {
    registerUser,
    loginUser
} = require("../controllers/authController");

// REGISTER API
router.post("/register", registerUser);

// LOGIN API
router.post("/login", loginUser);

// Export router
module.exports = router;










// const express = require("express");
// const bcrypt = require("bcryptjs");
// const User = require("../models/User");

// const router = express.Router();

// // Customer Registration
// router.post("/register", async (req, res) => {

//     try {

//         const { name, email, password } = req.body;

//         // Check required fields
//         if (!name || !email || !password) {
//             return res.status(400).json({
//                 message: "Please fill all required fields."
//             });
//         }

//         // Validate email
//         const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//         if (!emailPattern.test(email)) {
//             return res.status(400).json({
//                 message: "Please enter a valid email address."
//             });
//         }

//         // Password validation
//         if (password.length < 8) {
//             return res.status(400).json({
//                 message: "Password must contain at least 8 characters."
//             });
//         }

//         // Check existing customer
//         const existingUser = await User.findOne({
//             email: email.toLowerCase().trim()
//         });

//         if (existingUser) {
//             return res.status(409).json({
//                 message: "Email is already registered."
//             });
//         }

//         // Hash password
//         const hashedPassword = await bcrypt.hash(password, 12);

//         // Create customer
//         const newUser = await User.create({
//             name,
//             email: email.toLowerCase().trim(),
//             password: hashedPassword,
//             role: "customer"
//         });

//         return res.status(201).json({
//             message: "Registration successful!",
//             user: {
//                 id: newUser._id,
//                 name: newUser.name,
//                 email: newUser.email,
//                 role: newUser.role
//             }
//         });

//     } catch (error) {

//         if (error.code === 11000) {
//             return res.status(409).json({
//                 message: "Email is already registered."
//             });
//         }

//         console.error(error);

//         return res.status(500).json({
//             message: "Registration failed. Please try again."
//         });

//     }

// });

// const {
//     loginUser
// } = require("../controllers/authController");

// // LOGIN
// router.post("/login", loginUser);

// module.exports = router;