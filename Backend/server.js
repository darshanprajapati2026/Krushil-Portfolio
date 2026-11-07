
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Allowed frontend websites
const allowedOrigins = [
    "https://krushilwebservices.in",
    "https://www.krushilwebservices.in",
    "http://localhost:5500",
    "http://127.0.0.1:5500"
];

// CORS configuration
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("CORS access denied"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Backend health check
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Krushil Backend is running."
    });
});

// Authentication routes
app.use("/api/auth", require("./routes/authRoutes"));

// Admin routes (add this file when ready)
// app.use("/api/admin", require("./routes/adminRoutes"));

// Start server after MongoDB connects
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected Successfully");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB Connection Error:", error.message);
        process.exit(1);
    });





// // const path = require("path");

// // require("dotenv").config({
// //     path: path.join(__dirname, ".env")
// // });

// // console.log("JWT_SECRET loaded:", Boolean(process.env.JWT_SECRET));
// require("dotenv").config();
// console.log("JWT_SECRET loaded:", !!process.env.JWT_SECRET);

// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");

// const app = express();

// // Middleware
// // app.use(cors());
// app.use(cors({
//     origin: [
//         "https://krushilwebservices.in",
//         "https://www.krushilwebservices.in"
//     ],
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"]
// }));
// app.use(express.json());

// // Authentication routes
// app.use("/api/auth", require("./routes/authRoutes"));

// // Home route
// app.get("/", (req, res) => {
//     res.send("Krushil Web Services Backend is running!");
// });

// mongoose.connect(process.env.MONGO_URI)
//     .then(() => {
//         console.log("MongoDB Atlas Connected Successfully!");

//         const PORT = process.env.PORT || 5000;

//         app.listen(PORT, "0.0.0.0", () => {
//             console.log(`Server running on port ${PORT}`);
//         });
//     })
//     .catch((error) => {
//         console.error("MongoDB Connection Failed:", error.message);
//     });



// require("dotenv").config();

// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");

// const app = express();

// // Middleware
// app.use(cors({
//     origin: [
//         "http://localhost:5500",
//         "http://127.0.0.1:5500",
//         "https://krushilwebservices.in"
//     ]
// }));

// app.use(express.json());

// // Register API
// app.use("/api/auth", require("./routes/authRoutes"));

// // Test API
// app.get("/", (req, res) => {
//     res.send("Krushil Web Services Backend is running!");
// });

// // MongoDB connection
// mongoose.connect(process.env.MONGO_URI)
//     .then(() => {
//         console.log("MongoDB Connected Successfully!");

//         app.listen(process.env.PORT || 5000, () => {
//             console.log("Server running on port 5000");
//         });
//     })
//     .catch((error) => {
//         console.error("MongoDB Connection Failed:", error.message);
//     });