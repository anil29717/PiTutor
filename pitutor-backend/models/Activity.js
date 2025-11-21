import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  type: { type: String, enum: ["signup", "login", "logout"], required: true },
  timestamp: { type: Date, default: Date.now },
  detail: { type: String },
});

export default mongoose.model("Activity", ActivitySchema);