require("dotenv").config();
console.log("JWT_SECRET loaded:", !!process.env.JWT_SECRET);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
// // CORS configuration
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

// Authentication routes
app.use("/api/auth", require("./routes/authRoutes"));

// Home route
app.get("/", (req, res) => {
    res.send("Krushil Web Services Backend is running!");
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Atlas Connected Successfully!");

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB Connection Failed:", error.message);
    });