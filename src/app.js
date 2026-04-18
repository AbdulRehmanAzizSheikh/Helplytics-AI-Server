import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Helplytics AI API is running!",
    endpoints: {
      users: "/api/users",
      requests: "/api/requests",
      messages: "/api/messages",
      notifications: "/api/notifications",
    },
  });
});

export default app;
