
const errorMiddleware = (err, req, res, next) => {
    // Display the actual error in the backend terminal
    console.error(err);

    if (res.headersSent) {
        return next(err);
    }

    // Booking not found
    if (err.message === "Booking not found") {
        return res.status(404).json({
            success: false,
            message: "Booking not found"
        });
    }

    // Provider profile not found
    if (err.message === "Provider profile not found") {
        return res.status(404).json({
            success: false,
            message: "Provider profile not found"
        });
    }

    // Service does not exist
    if (err.message === "Service not found") {
        return res.status(404).json({
            success: false,
            message: "Service not found"
        });
    }

    // Provider already offers this service
    if (err.message === "Provider already offers this service") {
        return res.status(409).json({
            success: false,
            message: "Provider already offers this service"
        });
    }
if (err.message === "Provider service not found") {
    return res.status(404).json({
        success: false,
        message: "Provider does not offer this service"
    });
}

    // User does not have permission to perform this action
    if (
        err.message === "Customers can only cancel bookings" ||
        err.message === "You do not have permission to update bookings"
    ) {
        return res.status(403).json({
            success: false,
            message: err.message
        });
    }

    // Booking does not exist or the user cannot access it
    if (
        err.message ===
        "Booking not found or you are not allowed to update it"
    ) {
        return res.status(404).json({
            success: false,
            message: "Booking not found"
        });
    }

    // Handle unexpected errors
    return res.status(500).json({
        success: false,
        message: "Internal server error"
    });
};

module.exports = errorMiddleware;
