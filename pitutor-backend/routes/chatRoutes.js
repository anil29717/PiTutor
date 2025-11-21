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
    const { sessionId } = req.query;

    let chat = await Chat.findOne({ userId });
    if (!chat) {
      chat = new Chat({ userId, sessions: [] });
      await chat.save();
    }

    // Migrate legacy messages into a default session if present
    if (chat.messages && chat.messages.length && (!chat.sessions || chat.sessions.length === 0)) {
      chat.sessions = [
        {
          id: "default",
          title: "Migrated Chat",
          createdAt: new Date(),
          messages: chat.messages,
        },
      ];
      chat.messages = [];
      await chat.save();
    }

    chat.sessions = chat.sessions || [];

    // If sessionId provided, find or create that session
    if (sessionId) {
      let session = chat.sessions.find((s) => s.id === sessionId);
      if (!session) {
        session = { id: sessionId, title: "New Chat", createdAt: new Date(), messages: [] };
        chat.sessions.unshift(session);
        await chat.save();
      }
      return res.json(session.messages);
    }

    // No sessionId: return latest session or create a blank one
    if (!chat.sessions.length) {
      const newSession = { id: "default", title: "New Chat", createdAt: new Date(), messages: [] };
      chat.sessions.push(newSession);
      await chat.save();
      return res.json([]);
    }
    return res.json(chat.sessions[0].messages || []);
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    res.status(500).json({ error: error.message });
  }
});


// Send message & get AI response
router.post("/:userId/message", async (req, res) => {
  const { userId } = req.params;
  try {
    const { content, sessionId } = req.body;
    if (!content || typeof content !== "string") {
      return res.status(400).json({ error: "content is required" });
    }

    let chat = await Chat.findOne({ userId });
    if (!chat) {
      chat = new Chat({ userId, sessions: [] });
      await chat.save();
    }

    // Migrate legacy messages to sessions if needed
    if (chat.messages && chat.messages.length && (!chat.sessions || chat.sessions.length === 0)) {
      chat.sessions = [
        {
          id: "default",
          title: "Migrated Chat",
          createdAt: new Date(),
          messages: chat.messages,
        },
      ];
      chat.messages = [];
    }

    chat.sessions = chat.sessions || [];
    const sid = sessionId || (chat.sessions[0]?.id || "default");
    let session = chat.sessions.find((s) => s.id === sid);
    if (!session) {
      session = { id: sid, title: "New Chat", createdAt: new Date(), messages: [] };
      chat.sessions.unshift(session);
    }

    // Always persist the user's message immediately so Admin can see history
    session.messages.push({ role: "user", content });
    await chat.save();

    // Try to get AI response; on failure, respond gracefully and still persist
    let aiResponse = "I'm not sure, can you ask again?";
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        { contents: [{ parts: [{ text: content }] }] },
        { headers: { "Content-Type": "application/json" } }
      );
      aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || aiResponse;
    } catch (apiErr) {
      console.error("Gemini API error:", apiErr?.response?.data || apiErr?.message || apiErr);
    }

    // Persist assistant reply (fallback if API failed)
    session.messages.push({ role: "assistant", content: aiResponse });
    await chat.save();

    res.json({ role: "assistant", content: aiResponse });
  } catch (error) {
    console.error("Error in POST /:userId/message:", error);
    res.status(500).json({ error: error.message });
  }
});


// Clear messages for a session or all sessions for a user
router.delete("/:userId/messages", async (req, res) => {
  try {
    const { userId } = req.params;
    const { sessionId } = req.query;
    let chat = await Chat.findOne({ userId });
    if (!chat) {
      chat = new Chat({ userId, sessions: [] });
      await chat.save();
    }

    chat.sessions = chat.sessions || [];

    if (sessionId) {
      // Remove the session entirely from the user's profile
      const before = chat.sessions.length;
      chat.sessions = chat.sessions.filter((s) => s.id !== sessionId);
      await chat.save();
      return res.json({ success: true, removed: before !== chat.sessions.length });
    }

    // No sessionId provided: clear all sessions
    chat.sessions = [];
    await chat.save();
    return res.json({ success: true });
  } catch (error) {
    console.error("Error clearing chat messages:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
