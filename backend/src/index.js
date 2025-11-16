import express from "express";
import "dotenv/config";
import authRoutes from "./routes/authRoutes.js";
import { connectDB } from "./lib/db.js";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json()); // parses JSON request bodies
app.use(express.urlencoded({ extended: true })); // parses form data

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
