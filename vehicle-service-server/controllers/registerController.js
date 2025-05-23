// controllers/registerController.js

const bcrypt = require("bcryptjs");
const { User } = require("../model");
const { Op } = require("sequelize"); // 👈 Import Op

const registerUser = async (req, res) => {
  const { username, email, phone, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }] // ✅ Correct usage with Op
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: "Username or Email already taken" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      username,
      email,
      phone,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = registerUser;