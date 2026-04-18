import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  tags: [{ type: String }],
  category: { type: String, required: true },
  urgency: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: { type: String, enum: ['Open', 'Solved'], default: 'Open' },
  author: { type: String, required: true }, // We will use a dummy author name for simplicity if auth is too complex, or user _id
  helpers: [{
    name: String,
    skills: String
  }],
}, { timestamps: true });

export default mongoose.model("Request", requestSchema);
