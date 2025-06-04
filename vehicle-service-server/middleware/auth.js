// middleware/auth.js
const jwt = require("jsonwebtoken");
const { User } = require("../model");

const authenticate = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    req.user = user;
    req.userId = user.id; // ✅ ADD THIS LINE

    next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid token" });
  }
};


// Role check middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access forbidden: insufficient role" });
    }
    next();
  };
};

module.exports = { authenticate, authorizeRoles };
