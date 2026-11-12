// Import jsonwebtoken to create login tokens
const jwt = require("jsonwebtoken");

// Import the PostgreSQL connection pool
const pool = require("../config/database");

// Import bcrypt to securely hash passwords
const bcrypt = require("bcrypt");

// Register a new user


async function registerUser(name, email, password, role = "CUSTOMER") {
    // Get a dedicated database connection for the transaction
    const client = await pool.connect();

    try {
        // Start the transaction
        await client.query("BEGIN");

        // Check whether the email already exists
        const existingUser = await client.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            throw new Error("Email is already registered");
        }

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user account
        const result = await client.query(
            `INSERT INTO users (name, email, password, role)
             VALUES ($1, $2, $3, $4)
             RETURNING id, name, email, role, created_at`,
            [name, email, hashedPassword, role]
        );

        const user = result.rows[0];

        // Create a provider profile when the role is PROVIDER
        if (role === "PROVIDER") {
            await client.query(
                `INSERT INTO providers (user_id)
                 VALUES ($1)`,
                [user.id]
            );
        }

        // Save all changes together
        await client.query("COMMIT");

        // Return only the safe user details
        return user;

    } catch (error) {
        // Undo all changes if registration fails
        await client.query("ROLLBACK");

        // Convert PostgreSQL duplicate-key errors into a clear message
        if (error.code === "23505") {
            throw new Error("Email is already registered");
        }

        throw error;

    } finally {
        // Always release the database connection
        client.release();
    }
}


// Log in an existing user
async function loginUser(email, password) {
    // Find the user by email
    const result = await pool.query(
        `SELECT id, name, email, password, role
         FROM users
         WHERE email = $1`,
        [email]
    );

    // Reject if the email is not registered
    if (result.rows.length === 0) {
        throw new Error("Invalid email or password");
    }

    // Get the matching user from the database
    const user = result.rows[0];

    // Compare the entered password with the stored bcrypt hash
    const isPasswordValid = await bcrypt.compare(
        password,
        user.password
    );

    // Reject an incorrect password
    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }

    // Create a JWT token containing the user's ID and role
    const token = jwt.sign(
        {
            userId: user.id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "7d"
        }
    );

    // Return the token and safe user details
    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    };
}
// Export the function so the controller can use it
module.exports = {
    registerUser,
    loginUser
};