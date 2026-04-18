import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["Need Help", "Can Help", "Both"], default: "Both" },
    skills: [{ type: String }],
    interests: [{ type: String }],
    location: { type: String, default: "" },
    trustScore: { type: Number, default: 50 },
    contributions: { type: Number, default: 0 },
    badges: [{ type: String }],
    onboarded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
