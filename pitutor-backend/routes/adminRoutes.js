import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Chat from "../models/Chat.js";
import Activity from "../models/Activity.js";

const router = express.Router();

// Middleware to verify admin JWT
const verifyAdmin = (req, res, next) => {
  try {
    const token = req.cookies?.admin_token || (req.headers?.authorization || "").replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload?.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Admin password-only login
router.post("/login", async (req, res) => {
  try {
    const { password } = req.body || {};
    if (!password) return res.status(400).json({ message: "Password required" });

    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res
      .cookie("admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
      })
      .json({ message: "Admin login successful" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("admin_token").json({ message: "Logged out" });
});

// List all users (protected)
router.get("/users", verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({}, "userId name email role age number createdAt");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
});

// List all chats (protected)
router.get("/chats", verifyAdmin, async (req, res) => {
  try {
    const chats = await Chat.find({});
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
});

// List recent activity (protected)
router.get("/activity", verifyAdmin, async (req, res) => {
  try {
    const activities = await Activity.find({}).sort({ timestamp: -1 }).limit(1000);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
});

export default router;