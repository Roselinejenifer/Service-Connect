const cors = require("cors");
require("dotenv").config();

const express=require("express");

const app=express();

const bookingRouter=require("../Backend/routes/bookingRoutes");

const authRoutes = require("../Backend/routes/authRoutes");
const providerRoutes = require("./routes/providerRoutes");
const errorMiddleware=require("../Backend/middleware/errorMiddleware");

const pool=require("../Backend/config/database");

app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173"
}));
app.use("/api/bookings",bookingRouter)
app.use("/api/auth", authRoutes);
app.use("/api/providers", providerRoutes);


const PORT = process.env.PORT || 3000;

app.get("/",(req,res)=>{
    res.send("server connected");
});


/* Get all available services from the database */
app.get("/api/services", async (req, res, next) => {
    try {
        // Fetch services from PostgreSQL
        const result = await pool.query(
            `SELECT id, name, description, base_price
             FROM services
             ORDER BY id`
        );

        // Return the services as JSON
        return res.status(200).json({
            success: true,
            count: result.rows.length,
            services: result.rows
        });

    } catch (error) {
        // Send unexpected errors to error middleware
        next(error);
    }
});


app.get("/api/providers/:id",(req,res)=>{
res.send(`Providers id is:${req.params.id}`);
});

app.get("/api/search",(req,res)=>{
    res.send(`Searching for ${req.query.service} in ${req.query.city}` )
});

app.get("/api/test-db", async (req, res) => {

    try {

        const result = await pool.query("SELECT NOW()");

        res.json({
            success: true,
            message: "Database connected successfully",
            time: result.rows[0].now
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });

    }

});
app.use(errorMiddleware);

app.listen(PORT,()=>{
  console.log(`Server is running on http://localhost:${PORT}`);
});

