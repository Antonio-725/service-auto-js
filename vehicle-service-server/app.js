//app.js
const express = require("express");
const app = express();
const path = require("path");
require("dotenv").config();
const cors = require("cors");

// CORS Middleware

// app.use(cors({
//   origin: process.env.CORS_ORIGIN || "http://localhost:5173",
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
// }));


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));



// Body parser middleware
app.use(express.json());

// Routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/userRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const sparePartRoutes = require("./routes/sparePartRoutes");
const sparePartRequestRoutes = require("./routes/sparePartRequestRoutes");
const invoiceRoutes = require('./routes/invoices');
const  verifyOtp  = require("./routes/auth.routes");
app.get('/', (req, res) => {
  res.send('🚀 Auto Service API is running');
});



app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/spare-parts", sparePartRoutes);
app.use("/api/spare-part-requests", sparePartRequestRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/auth',verifyOtp);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


module.exports = app;