import mongoose from "mongoose";

// Support multiple chat sessions per user. Keep legacy `messages` for
// backwards compatibility and migration on access.
const ChatSchema = new mongoose.Schema({
  userId: { type: String, unique: true, required: true },
  sessions: [
    {
      id: { type: String, required: true },
      title: { type: String },
      createdAt: { type: Date, default: Date.now },
      messages: [
        {
          role: String,
          content: String,
          timestamp: { type: Date, default: Date.now },
        },
      ],
    },
  ],
  // Legacy single-thread messages (pre-sessions). Optional.
  messages: [
    {
      role: String,
      content: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

export default mongoose.model("Chat", ChatSchema);

