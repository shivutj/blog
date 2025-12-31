import express from "express";
import cors from "cors";
import "dotenv/config";
import aiRouter from "./routes/aiRoutes.js";
import connectCloudinary from "./configs/cloudinary.js";
import userRouter from "./routes/userRoutes.js";
import sql from "./configs/db.js";

const app = express();

const corsOrigin = process.env.CORS_ORIGIN || [
  "http://localhost:5173",
  "http://localhost:5174",
];

async function startServer() {
  try {
    console.log("Connecting to database...");
    await sql`SELECT 1`;
    console.log("Database connected!");

    console.log("Connecting to Cloudinary...");
    await connectCloudinary();
    console.log("Cloudinary connected!");

    app.use(
      cors({
        origin: corsOrigin,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );
    app.use(express.json());

    app.get("/", (req, res) => res.send("Server is Live!"));

    app.use("/api/ai", aiRouter);
    app.use("/api/user", userRouter);

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log("Server is running on port", PORT);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
