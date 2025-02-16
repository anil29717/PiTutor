import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import crypto from "crypto";

const router = express.Router();

const generateUserId = () => {
  return crypto.randomBytes(16).toString("hex"); // Generates a 32-character random hex string
};

// Register User
router.post("/signup", async (req, res) => {
  try {
    console.log("Received Data:", req.body); // Debugging

    const { name, age, number, role, email, password } = req.body;
    if (!name || !age || !number || !role || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userId = generateUserId();
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, age, number, role, email, password: hashedPassword, userId });

    await newUser.save();
    console.log("User saved:", newUser); // Debugging

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    // Generate JWT token
    const token = jwt.sign({ id: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: "7d" }); // Fix expiry to 7d

    // Set the token in the cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure flag in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiry (7 days in milliseconds)
      sameSite: "Strict", // Prevent cross-site request forgery
      path: "/"
    }).json({
      message: "Login successful",
      token: token,
      user: {
        name: user.name,
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        userId: user.userId,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});


// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("token").json({ message: "Logged out successfully" });
});

export default router;
