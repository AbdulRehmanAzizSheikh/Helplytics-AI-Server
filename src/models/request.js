import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    tags: [{ type: String }],
    category: {
      type: String,
      required: true,
      enum: ["Web Development", "Design", "Career", "Backend", "General"],
      default: "General",
    },
    urgency: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    status: { type: String, enum: ["Open", "Solved"], default: "Open" },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    authorName: { type: String, required: true },
    helpers: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name: String,
        skills: String,
      },
    ],
    aiSummary: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Request", requestSchema);
