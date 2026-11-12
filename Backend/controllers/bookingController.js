const bookingService=require("../services/bookingService");


const createBooking = async (req, res, next) => {
    try {
        // Get the logged-in customer's ID from the verified token
        const customerId = req.user.userId;

        // Read booking details sent by the frontend
        const { service, providerId, serviceId, date } = req.body;

        // Prepare booking data with the trusted customer ID
        const bookingData = {
            service,
            providerId,
            serviceId,
            date,
            customerId
        };

        // Save the booking in the database
        const booking = await bookingService.createBooking(bookingData);

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            booking
        });
    } catch (error) {
        next(error);
    }
};




const getBooking = async (req, res, next) => {
    try {
        // Get the logged-in user's ID from the verified JWT
        const customerId = req.user.userId;

        // Fetch only this customer's bookings
        const bookings = await bookingService.getBooking(customerId);

        res.status(200).json({
            success: true,
            message: "Your bookings listed successfully",
            count: bookings.length,
            bookings: bookings
        });
    } catch (error) {
        next(error);
    }
};



const getbookingbyId = async (req, res, next) => {
    try {
        // Get the booking ID from the URL
        const id = req.params.id;

        // Get the logged-in user's ID and role from the JWT
        const { userId, role } = req.user;

        // Fetch the booking based on the user's permissions
        const booking = await bookingService.getBookingbyId(
            id,
            userId,
            role
        );

        // Send the booking details
        res.status(200).json({
            success: true,
            message: "Booking listed successfully",
            booking
        });
    } catch (error) {
        next(error);
    }
};




const updateBookingStatus = async (req, res, next) => {
    try {
        // Get booking ID from the URL
        const id = req.params.id;

        // Get the new status from the request body
        const { status } = req.body;

        // Get logged-in user's ID and role from the token
        const { userId, role } = req.user;

        // Update booking only if the user has permission
        const booking = await bookingService.updateBookingStatus(
            id,
            status,
            userId,
            role
        );

        // Send the updated booking
        res.status(200).json({
            success: true,
            message: "Booking status updated successfully",
            booking
        });
    } catch (error) {
        next(error);
    }
};



const deleteBooking = async (req, res, next) => {

    try {

        
        const id = req.params.id;

        
        const booking = await bookingService.deleteBooking(id);

       
        res.status(200).json({
            success: true,
            message: "Booking deleted successfully",
            booking: booking
        });

    } catch (error) {

        
        next(error);

    }
};

module.exports={createBooking,getBooking,getbookingbyId,updateBookingStatus,deleteBooking}