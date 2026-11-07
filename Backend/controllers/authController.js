
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ===============================
// CUSTOMER REGISTRATION
// ===============================

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please enter all required fields."
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        // Public registration always creates a customer.
        const newUser = await User.create({
            name,
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: "customer"
        });

        res.status(201).json({
            success: true,
            message: "Registration successful.",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error("Registration Error:", error);

        res.status(500).json({
            success: false,
            message: "Registration failed."
        });
    }
};


// ===============================
// USER / ADMIN LOGIN
// ===============================

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please enter email and password."
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is missing.");
        }

        const token = jwt.sign(
            {
                id: user._id.toString(),
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.status(200).json({
            success: true,
            message: "Login successful.",

            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login Error:", error);

        res.status(500).json({
            success: false,
            message: "Login failed."
        });
    }
};






// const User = require("../models/User");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// // ==================================
// // REGISTER USER
// // ==================================
// exports.registerUser = async (req, res) => {
//     try {
//         const { name, email, password } = req.body;

//         // Validate fields
//         if (!name || !email || !password) {
//             return res.status(400).json({
//                 success: false,
//                 message: "All fields are required"
//             });
//         }

//         if (password.length < 8) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Password must be at least 8 characters"
//             });
//         }

//         const normalizedEmail = email.trim().toLowerCase();

//         // Check existing user
//         const existingUser = await User.findOne({
//             email: normalizedEmail
//         });

//         if (existingUser) {
//             return res.status(409).json({
//                 success: false,
//                 message: "Email already registered"
//             });
//         }

//         // Hash password
//         const hashedPassword = await bcrypt.hash(password, 12);

//         // Create customer account
//         const user = new User({
//             name: name.trim(),
//             email: normalizedEmail,
//             password: hashedPassword,
//             role: "customer"
//         });

//         await user.save();

//         return res.status(201).json({
//             success: true,
//             message: "Registration successful"
//         });

//     } catch (error) {
//         console.error("Register Error:", error);

//         return res.status(500).json({
//             success: false,
//             message: "Server error during registration"
//         });
//     }
// };


// // ==================================
// // LOGIN USER
// // ==================================
// exports.loginUser = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         if (!email || !password) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Email and password are required"
//             });
//         }

//         const user = await User.findOne({
//             email: email.trim().toLowerCase()
//         });

//         if (!user) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Invalid email or password"
//             });
//         }

//         const isMatch = await bcrypt.compare(
//             password,
//             user.password
//         );

//         if (!isMatch) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Invalid email or password"
//             });
//         }

//         if (!process.env.JWT_SECRET) {
//             console.error("JWT_SECRET is missing");

//             return res.status(500).json({
//                 success: false,
//                 message: "Authentication configuration error"
//             });
//         }

//         const token = jwt.sign(
//             {
//                 id: user._id,
//                 role: user.role
//             },
//             process.env.JWT_SECRET,
//             {
//                 expiresIn: "1d"
//             }
//         );

//         return res.status(200).json({
//             success: true,
//             message: "Login successful",
//             token,
//             user: {
//                 id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 role: user.role
//             }
//         });

//     } catch (error) {
//         console.error("Login Error:", error);

//         return res.status(500).json({
//             success: false,
//             message: "Server error during login"
//         });
//     }
// };










// const User = require("../models/User");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// // LOGIN API
// exports.loginUser = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         // Validate input
//         if (!email || !password) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Email and password are required"
//             });
//         }

//         // Find customer by email
//         const user = await User.findOne({
//             email: email.trim().toLowerCase()
//         });

//         if (!user) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Invalid email or password"
//             });
//         }

//         // Verify password using bcrypt
//         const isMatch = await bcrypt.compare(
//             password,
//             user.password
//         );

//         if (!isMatch) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Invalid email or password"
//             });
//         }

//         // Check JWT secret
//         if (!process.env.JWT_SECRET) {
//             console.error("JWT_SECRET is missing");

//             return res.status(500).json({
//                 success: false,
//                 message: "Authentication configuration error"
//             });
//         }

//         // Generate JWT token
//         const token = jwt.sign(
//             {
//                 id: user._id,
//                 role: user.role
//             },
//             process.env.JWT_SECRET,
//             {
//                 expiresIn: "1d"
//             }
//         );

//         // Successful login response
//         return res.status(200).json({
//             success: true,
//             message: "Login successful",
//             token: token,
//             user: {
//                 id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 role: user.role
//             }
//         });

//     } catch (error) {
//         console.error("Login Error:", error);

//         return res.status(500).json({
//             success: false,
//             message: "Server error during login"
//         });
//     }
// };





// const User = require("../models/User");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const hashedPassword = await bcrypt.hash(password, 12);

// // LOGIN API
// exports.loginUser = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         if (!email || !password) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Email and password are required"
//             });
//         }

//         // Find customer by email
//         const user = await User.findOne({
//             email: email.trim().toLowerCase()
//         });

//         if (!user) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Invalid email or password"
//             });
//         }


//         // Verify password
//         const isMatch = await bcrypt.compare(
//             password,
//             user.password
//         );

//         if (!isMatch) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Invalid email or password"
//             });
//         }

//         // Generate JWT token
//         const token = jwt.sign(
//             {
//                 id: user._id,
//                 role: user.role
//             },
//             process.env.JWT_SECRET,
//             { expiresIn: "1d" }
//         );

//         res.status(200).json({
//             success: true,
//             message: "Login successful",
//             token: token,
//             user: {
//                 id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 role: user.role
//             }
//         });

//     } catch (error) {
//         console.error("Login Error:", error);

//         res.status(500).json({
//             success: false,
//             message: "Server error during login"
//         });
//     }
// };
