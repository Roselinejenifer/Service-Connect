// Import Express
const express = require("express");

const authorizeRoles = require("../middleware/roleMiddleware");

// Create an Express router
const router = express.Router();


const authController = require("../controllers/authController");

const authenticateToken = require("../middleware/authMiddleware");

// Registration endpoint
router.post("/register", authController.register);
// Login endpoint
router.post("/login", authController.login);

// Protected route: only logged-in users can access this
router.get("/me", authenticateToken, (req, res) => {
    res.status(200).json({
        success: true,
        message: "You are authenticated",
        user: req.user
    });
});

// Only customers can access this route
router.get(
    "/customer-test",
    authenticateToken,
    authorizeRoles("CUSTOMER"),
    (req, res) => {
        res.status(200).json({
            success: true,
            message: "Customer access granted"
        });
    }
);

// Only admins can access this route
router.get(
    "/admin-test",
    authenticateToken,
    authorizeRoles("ADMIN"),
    (req, res) => {
        res.status(200).json({
            success: true,
            message: "Admin access granted"
        });
    }
);
// Export the router
module.exports = router;