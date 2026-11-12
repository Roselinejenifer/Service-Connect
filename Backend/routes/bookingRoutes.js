
const express = require("express");

const router = express.Router();

// Import the booking controller functions
const {
    createBooking,
    getBooking,
    getbookingbyId,
    updateBookingStatus,
    deleteBooking
} = require("../controllers/bookingController");

// Import authentication and role-checking middleware
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Create a booking: authenticated customers only
router.post(
    "/",
    authenticateToken,
    authorizeRoles("CUSTOMER"),
    createBooking
);

// View bookings: authenticated users
router.get("/", authenticateToken, getBooking);

// View a specific booking: authenticated users
router.get("/:id", authenticateToken, getbookingbyId);

// Update booking status: authenticated users
router.put("/:id", authenticateToken, updateBookingStatus);

// Delete a booking: authenticated users
router.delete("/:id", authenticateToken, deleteBooking);

module.exports = router;
