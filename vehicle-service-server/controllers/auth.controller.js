// controllers/auth.controller.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Otp } = require("../model"); // Add Otp model
const generateOtp = require("../utils/generateOtp");
const nodemailer = require("nodemailer");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "6h",
  });
};

// Register
exports.registerUser = async (req, res) => {
  const { username, email, password, phone } = req.body;

  try {
    const userExists = await User.findOne({ where: { email } });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      phone,
    });

    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


// Send OTP email
const sendOtpEmail = async (email, otpCode) => {
  try {
    const emailContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Your OTP Code</h2>
        <p>Your one-time password (OTP) is: <strong>${otpCode}</strong></p>
        <p>This code will expire in 10 minutes. Please use it to verify your login.</p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Thank you!</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"AutoService" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP for Login Verification",
      html: emailContent,
    });
  } catch (error) {
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
};

// Login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    // Generate OTP for user/mechanic roles
    if (["user", "mechanic"].includes(user.role)) {
      const otpCode = generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

      // Save OTP to database
      await Otp.create({
        code: otpCode,
        expiresAt,
        userId: user.id,
        used: false,
      });

      // Send OTP to user's email
      await sendOtpEmail(user.email, otpCode);
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    });
  } catch (err) {
    console.error("Login error:", err); // Log full error object
    res.status(500).json({ message: `Internal server error: ${err.message}` });
  }
};

// New endpoint to verify OTP
exports.verifyOtp = async (req, res) => {
  const { otp, userId } = req.body;

  try {
    const otpRecord = await Otp.findOne({
      where: {
        userId,
        code: otp,
        used: false,
        expiresAt: { [require("sequelize").Op.gt]: new Date() },
      },
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Mark OTP as used
    await otpRecord.update({ used: true });

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: `Failed to verify OTP: ${error.message}` });
  }
};
// Get Profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Verify Token
exports.verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token from Bearer header
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find the user by ID from the decoded token
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
    });
    
    if (!user) {
      return res.status(401).json({ message: "Invalid token: User not found" });
    }

    // Return user data if token is valid
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(500).json({ message: err.message });
  }
};
