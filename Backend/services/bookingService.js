const pool =require("../config/database");



const createBooking = async (bookingData) => {
    const {
        service,
        providerId,
        serviceId,
        date,
        customerId
    } = bookingData;

    // Validate required booking details
    if (!service) {
        throw new Error("Service is required");
    }

    if (!Number.isInteger(Number(providerId)) || Number(providerId) <= 0) {
        throw new Error("A valid Provider ID is required");
    }

    if (!Number.isInteger(Number(serviceId)) || Number(serviceId) <= 0) {
        throw new Error("A valid Service ID is required");
    }

    if (!date || Number.isNaN(Date.parse(date))) {
        throw new Error("A valid booking date is required");
    }

    if (!Number.isInteger(Number(customerId)) || Number(customerId) <= 0) {
        throw new Error("A valid Customer ID is required");
    }

    // Insert the booking and link it to the customer, provider, and service
    const result = await pool.query(
        `INSERT INTO bookings
            (service, provider_id, service_id, customer_id, booking_date, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
            service,
            Number(providerId),
            Number(serviceId),
            Number(customerId),
            date,
            "REQUESTED"
        ]
    );

    return result.rows[0];
};



const getBooking = async (customerId) => {
    const result = await pool.query(
        `SELECT *
         FROM bookings
         WHERE customer_id = $1
         ORDER BY id ASC`,
        [customerId]
    );

    return result.rows;
};



const getBookingbyId = async (id, userId, role) => {
    let result;

    if (role === "ADMIN") {
        // Admin can view any booking
        result = await pool.query(
            `SELECT *
             FROM bookings
             WHERE id = $1`,
            [id]
        );
    } else if (role === "CUSTOMER") {
        // Customer can view only their own booking
        result = await pool.query(
            `SELECT *
             FROM bookings
             WHERE id = $1 AND customer_id = $2`,
            [id, userId]
        );
    } else if (role === "PROVIDER") {
        // Provider can view bookings assigned to their provider profile
        result = await pool.query(
            `SELECT b.*
             FROM bookings b
             JOIN providers p ON p.id = b.provider_id
             WHERE b.id = $1 AND p.user_id = $2`,
            [id, userId]
        );
    } else {
        throw new Error("You do not have permission to view bookings");
    }

    if (result.rows.length === 0) {
        throw new Error("Booking not found");
    }

    return result.rows[0];
};



const updateBookingStatus = async (id, status, userId, role) => {
    // List of statuses allowed in the booking workflow
    const validStatuses = [
        "REQUESTED",
        "ACCEPTED",
        "ON_THE_WAY",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
        "REJECTED"
    ];

    // Check whether status was provided
    if (!status) {
        throw new Error("Status is required");
    }

    // Check whether status is valid
    if (!validStatuses.includes(status)) {
        throw new Error("Invalid booking status");
    }

    let result;

    // Admin can update any booking
    if (role === "ADMIN") {
        result = await pool.query(
            `UPDATE bookings
             SET status = $1
             WHERE id = $2
             RETURNING *`,
            [status, id]
        );
    }
    // Customer can cancel only their own requested booking
    else if (role === "CUSTOMER") {
        if (status !== "CANCELLED") {
            throw new Error("Customers can only cancel bookings");
        }

        result = await pool.query(
            `UPDATE bookings
             SET status = $1
             WHERE id = $2
               AND customer_id = $3
               AND status = 'REQUESTED'
             RETURNING *`,
            [status, id, userId]
        );
    }
    // Provider can update bookings assigned to their provider profile
  
else if (role === "PROVIDER") {
    // Providers can use only these statuses
    const allowedProviderStatuses = [
        "ACCEPTED",
        "REJECTED",
        "ON_THE_WAY",
        "IN_PROGRESS",
        "COMPLETED"
    ];

    // Reject status changes not allowed for providers
    if (!allowedProviderStatuses.includes(status)) {
        throw new Error(
            "Providers cannot set this booking status"
        );
    }

    // Update only bookings assigned to this provider
    result = await pool.query(
        `UPDATE bookings b
         SET status = $1
         FROM providers p
         WHERE b.id = $2
           AND b.provider_id = p.id
           AND p.user_id = $3
         RETURNING b.*`,
        [status, id, userId]
    );
}
 else {
        throw new Error("You do not have permission to update bookings");
    }

    // If no booking was updated, it may not exist or the user may lack access
    if (result.rows.length === 0) {
        throw new Error("Booking not found or you are not allowed to update it");
    }

    return result.rows[0];
};



const deleteBooking = async (id) => {

    
    const result = await pool.query(
        `DELETE FROM bookings
         WHERE id = $1
         RETURNING *`,
        [id]
    );

    
    if (result.rows.length === 0) {
        throw new Error("Booking not found");
    }

    
    return result.rows[0];
};




module.exports={createBooking,getBooking,getBookingbyId,updateBookingStatus,deleteBooking}