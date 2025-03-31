import express from "express";
import mongoose from "mongoose";
import axios from "axios";
import Chat from "../models/Chat.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Get messages for a chat
router.get("/:userId/messages", async (req, res) => {
  try {
    const { userId } = req.params;

    let chat = await Chat.findOne({ userId });
    if (!chat) {
      chat = new Chat({ userId, messages: [] });
      await chat.save();
    }
    res.json(chat.messages);
  } catch (error) {
+   console.error("Error fetching chat messages:", error);
    res.status(500).json({ error: error.message });
  }
});


// Send message & get AI response
router.post("/:userId/message", async (req, res) => {
  const { userId } = req.params;
  try {
    const { content } = req.body;


    let chat = await Chat.findOne({ userId});

    if (!chat) {
      chat = new Chat({ userId, messages: [] });
      await chat.save();
    }

    chat.messages.push({ role: "user", content });

    // Send request to Gemini API
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: content }] }] },
      { headers: { "Content-Type": "application/json" } }
    );

    const aiResponse =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm not sure, can you ask again?";

    chat.messages.push({ role: "assistant", content: aiResponse });
    await chat.save();

    res.json({ role: "assistant", content: aiResponse });
  } catch (error) {
+   console.error("Error in POST /:userId/message:", error);
    res.status(500).json({ error: error.message });
  }
});


export default router;
