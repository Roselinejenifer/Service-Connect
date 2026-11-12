
const express = require("express");

// Create an Express router
const router = express.Router();

// Import JWT authentication middleware
const authenticateToken = require("../middleware/authMiddleware");

// Import provider service
const providerService = require("../services/providerService");

// Get the logged-in provider's profile
router.get("/me", authenticateToken, async (req, res, next) => {
    try {
        // Get the profile using the logged-in user's ID
        const provider = await providerService.getProviderProfile(
            req.user.userId
        );

        // Send the provider profile
        res.status(200).json({
            success: true,
            provider: provider
        });
    } catch (error) {
        // Pass errors to the error middleware
        next(error);
    }
});



router.put("/me", authenticateToken, async (req, res, next) => {
    try {
        // Only providers can update provider profiles
        if (req.user.role !== "PROVIDER") {
            return res.status(403).json({
                success: false,
                message: "Only providers can update provider profiles"
            });
        }

        const { experience, location, bio } = req.body;

        // Validate experience
        if (
            experience !== undefined &&
            (!Number.isInteger(experience) || experience < 0)
        ) {
            return res.status(400).json({
                success: false,
                message: "Experience must be a non-negative whole number"
            });
        }

        // Validate location and bio
        if (
            (location !== undefined && typeof location !== "string") ||
            (bio !== undefined && typeof bio !== "string")
        ) {
            return res.status(400).json({
                success: false,
                message: "Location and bio must be text"
            });
        }

        // Require all three fields for this first version
        if (
            experience === undefined ||
            location === undefined ||
            bio === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide experience, location, and bio"
            });
        }

        // Update the profile belonging to the logged-in user
        const provider = await providerService.updateProviderProfile(
            req.user.userId,
            experience,
            location.trim(),
            bio.trim()
        );

        return res.status(200).json({
            success: true,
            message: "Provider profile updated successfully",
            provider
        });
    } catch (error) {
        next(error);
    }
});



/* Get services offered by the logged-in provider */
router.get("/me/services", authenticateToken, async (req, res, next) => {
    try {
        // Only providers can view their services
        if (req.user.role !== "PROVIDER") {
            return res.status(403).json({
                success: false,
                message: "Only providers can view provider services"
            });
        }

        // Fetch services using the logged-in user's ID
        const services = await providerService.getProviderServices(
            req.user.userId
        );

        // Send the services as a response
        return res.status(200).json({
            success: true,
            count: services.length,
            services
        });

    } catch (error) {
        next(error);
    }
});


/* Add a service for the logged-in provider */
router.post("/me/services", authenticateToken, async (req, res, next) => {
    try {
        // Only providers can add services
        if (req.user.role !== "PROVIDER") {
            return res.status(403).json({
                success: false,
                message: "Only providers can add services"
            });
        }

        // Get the service ID from the request body
        const { service_id } = req.body;

        // Validate the service ID
        if (
            !Number.isInteger(service_id) ||
            service_id <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid positive service_id"
            });
        }

        // Add the service to the provider
        const providerServiceResult =
            await providerService.addProviderService(
                req.user.userId,
                service_id
            );

        return res.status(201).json({
            success: true,
            message: "Service added successfully",
            providerService: providerServiceResult
        });

    } catch (error) {
        next(error);
    }
});


/* Remove a service from the logged-in provider */
router.delete("/me/services/:serviceId", authenticateToken, async (req, res, next) => {
    try {
        // Only providers can remove services
        if (req.user.role !== "PROVIDER") {
            return res.status(403).json({
                success: false,
                message: "Only providers can remove services"
            });
        }

        // Get the service ID from the URL
        const serviceId = Number(req.params.serviceId);

        // Validate the service ID
        if (!Number.isInteger(serviceId) || serviceId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid positive service ID"
            });
        }

        // Remove the service assignment
        const removedService = await providerService.removeProviderService(
            req.user.userId,
            serviceId
        );

        return res.status(200).json({
            success: true,
            message: "Service removed successfully",
            removedService
        });

    } catch (error) {
        next(error);
    }
});

// Export the router
module.exports = router;
