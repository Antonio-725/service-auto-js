//index.js
const app = require("./app");

const PORT = process.env.PORT || 5000;


// Fallback to localhost if CLIENT_URL is not set
const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";


// CORS Middleware
const cors = require("cors");
app.use(cors({
  origin: allowedOrigin,
  //origin: "http://localhost:5173", // Allow only your React app
  credentials: true, // If you're using cookies
}));


app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
