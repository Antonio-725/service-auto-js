//app.js
const express = require("express");
const app = express();
const path = require("path");
require("dotenv").config();

// CORS Middleware
const cors = require("cors");
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


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/spare-parts", sparePartRoutes);
app.use("/api/spare-part-requests", sparePartRequestRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Note: Database schema managed via migrations
// const { sequelize } = require("./model");
// sequelize.sync({ alter: true })
//   .then(() => console.log("✅ Database synced"))
//   .catch(err => console.error("❌ DB Sync Error:", err));

module.exports = app;