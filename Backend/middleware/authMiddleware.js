// Import jsonwebtoken to verify JWT tokens
const jwt = require("jsonwebtoken");

// Middleware to protect routes
function authenticateToken(req, res, next) {
    try {
        // Get the Authorization header
        const authHeader = req.headers.authorization;

        // Check whether the header exists
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authorization token is required"
            });
        }

        // Expected format:
        // Authorization: Bearer <token>
        const [scheme, token] = authHeader.split(" ");

        // Check the authorization format
        if (scheme !== "Bearer" || !token) {
            return res.status(401).json({
                success: false,
                message: "Invalid authorization format"
            });
        }

        // Verify the JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Store decoded user information in the request
        req.user = decoded;

        // Continue to the next middleware/controller
        next();

    } catch (error) {
        // Token is invalid or expired
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
}

module.exports = authenticateToken;