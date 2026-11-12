// Import the registration service
const authService = require("../services/authService");


// Controller for registering a new user
async function register(req, res, next) {
    try {
        // Get registration details from the request body
        const { name, email, password, role } = req.body;

       
        // Check that required fields are strings and not empty
        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        // Check the email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address"
            });
        }

        // Check the minimum password length
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long"
            });
        }


        // Validate the requested role
        // Public registration must never create an ADMIN account
        const requestedRole = role
            ? role.toUpperCase()
            : "CUSTOMER";

        if (!["CUSTOMER", "PROVIDER"].includes(requestedRole)) {
            return res.status(400).json({
                success: false,
                message: "Role must be CUSTOMER or PROVIDER"
            });
        }

        // Register the user through the service
        const user = await authService.registerUser(
            name.trim(),
            email.trim().toLowerCase(),
            password,
            requestedRole
        );

        // Send the created user back without the password
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user
        });
   } catch (error) {
    // Return 409 when the email is already registered
    if (error.message === "Email is already registered") {
        return res.status(409).json({
            success: false,
            message: error.message
        });
    }

    // Pass other errors to the central error middleware
    next(error);
}
}

async function login(req,res,next){
try{
const{email,password}=req.body;


// Check that email and password are provided as strings.
if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
) {
    return res.status(400).json({
        success: false,
        message: "Email and password are required"
    });
}

// Check whether the email format is valid.
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(email.trim())) {
    return res.status(400).json({
        success: false,
        message: "Please enter a valid email address"
    });
}


const result=await authService.loginUser(
    email.trim().toLowerCase(),
password);

return res.status(200).json({
    success:true,
    message:"Login successful",
    token:result.token,
    user:result.user
});
}catch(error){
    if(error.message==="Invalid email or password"){
        return res.status(401).json({
            success:false,
            message:error.message
        })
    }
    next(error);
}
}
// Export the controller
module.exports = {
    register,
    login
};