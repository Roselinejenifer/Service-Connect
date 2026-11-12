// Import the PostgreSQL connection pool
const pool = require("../config/database");

// Get the provider profile using the logged-in user's ID
async function getProviderProfile(userId) {

    // Find the provider and related user information
    const result = await pool.query(
        `SELECT
            p.id AS provider_id,
            p.user_id,
            u.name,
            u.email,
            p.experience,
            p.location,
            p.bio,
            p.created_at
         FROM providers p
         JOIN users u ON p.user_id = u.id
         WHERE p.user_id = $1`,
        [userId]
    );

    // Check whether the provider profile exists
    if (result.rows.length === 0) {
        throw new Error("Provider profile not found");
    }

    // Return the provider profile
    return result.rows[0];
}


async function updateProviderProfile(userId, experience, location, bio) {
    const result = await pool.query(
        `UPDATE providers
         SET experience = $1,
             location = $2,
             bio = $3
         WHERE user_id = $4
         RETURNING id AS provider_id, user_id, experience, location, bio, created_at`,
        [experience, location, bio, userId]
    );

    // Check whether a provider profile was found
    if (result.rows.length === 0) {
        throw new Error("Provider profile not found");
    }

    return result.rows[0];
}


async function getProviderServices(userId) {

    // Find the provider ID using the logged-in user's ID
    const providerResult = await pool.query(
        `SELECT id
         FROM providers
         WHERE user_id = $1`,
        [userId]
    );

    // Check whether the provider exists
    if (providerResult.rows.length === 0) {
        throw new Error("Provider profile not found");
    }

    const providerId = providerResult.rows[0].id;

    // Get all services connected to this provider
    const result = await pool.query(
        `SELECT
            s.id AS service_id,
            s.name,
            s.description,
            s.base_price
         FROM provider_services ps
         JOIN services s
             ON ps.service_id = s.id
         WHERE ps.provider_id = $1
         ORDER BY s.name`,
        [providerId]
    );

    // Return the provider's services
    return result.rows;
}


/* Add a service to the logged-in provider */
async function addProviderService(userId, serviceId) {

    // Find the provider ID using the logged-in user's ID
    const providerResult = await pool.query(
        `SELECT id
         FROM providers
         WHERE user_id = $1`,
        [userId]
    );

    // Check whether the provider profile exists
    if (providerResult.rows.length === 0) {
        throw new Error("Provider profile not found");
    }

    const providerId = providerResult.rows[0].id;

    // Check whether the requested service exists
    const serviceResult = await pool.query(
        `SELECT id
         FROM services
         WHERE id = $1`,
        [serviceId]
    );

    if (serviceResult.rows.length === 0) {
        throw new Error("Service not found");
    }

    // Check whether the provider already offers this service
    const existingResult = await pool.query(
        `SELECT provider_id
         FROM provider_services
         WHERE provider_id = $1 AND service_id = $2`,
        [providerId, serviceId]
    );

    if (existingResult.rows.length > 0) {
        throw new Error("Provider already offers this service");
    }

    // Connect the provider with the selected service
    await pool.query(
        `INSERT INTO provider_services (provider_id, service_id)
         VALUES ($1, $2)`,
        [providerId, serviceId]
    );

    return {
        provider_id: providerId,
        service_id: serviceId
    };
}


async function removeProviderService(userId, serviceId) {

    // Find the provider using the logged-in user's ID
    const providerResult = await pool.query(
        `SELECT id
         FROM providers
         WHERE user_id = $1`,
        [userId]
    );

    // Check whether the provider profile exists
    if (providerResult.rows.length === 0) {
        throw new Error("Provider profile not found");
    }

    const providerId = providerResult.rows[0].id;

    // Remove the service only if this provider offers it
    const result = await pool.query(
        `DELETE FROM provider_services
         WHERE provider_id = $1
           AND service_id = $2
         RETURNING provider_id, service_id`,
        [providerId, serviceId]
    );

    // Check whether a matching assignment was removed
    if (result.rows.length === 0) {
        throw new Error("Provider service not found");
    }

    // Return the removed assignment
    return result.rows[0];
}

// Export the function
module.exports = {
    getProviderProfile,
    updateProviderProfile,
    getProviderServices,
    addProviderService,
    removeProviderService
};