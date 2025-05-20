
//app.js
const express = require("express");
const app = express();
require("dotenv").config();

// CORS Middleware
const cors = require("cors");
app.use(cors({
  origin: "http://localhost:5173", // Allow only your React app
  credentials: true, // If you're using cookies
}));

// Body parser middleware
app.use(express.json());

// Routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/userRoutes");
const vehicleRoutes = require('./routes/vehicleRoutes');

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use('/api/vehicles', vehicleRoutes);

// DB Sync
const { sequelize } = require("./model");
sequelize.sync({ alter: true })
  .then(() => console.log("✅ Database synced"))
  .catch(err => console.error("❌ DB Sync Error:", err));

module.exports = app;