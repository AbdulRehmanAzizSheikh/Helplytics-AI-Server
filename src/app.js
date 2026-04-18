import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/requests", requestRoutes);

app.get("/", (req, res) => {
  res.send("Helplytics API is running!");
});

export default app;
