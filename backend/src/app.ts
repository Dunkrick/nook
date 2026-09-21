import express from "express";
import cors from "cors";
import { env } from "./config/env.js";

import workspaceRouter from "./routes/workspaces.js";
import authRouter from "./routes/auth.js";
import { errorHandler } from "./lib/error.js";
import prisma from "./prisma.js";
import uploadRouter from "./routes/uploads.js";
import artifactRouter from "./routes/artifacts.js";

const app = express();

const allowedOrigins = [
  env.FRONTEND_URL,
  "http://localhost:5173",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("Blocked CORS Origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.static("public"));

app.use("/auth", authRouter);
app.use("/workspaces", workspaceRouter);
app.use("/uploads", uploadRouter);
app.use("/artifacts", artifactRouter);

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "ok",
      database: "connected",
      version: "1.1.0",
    });
  } catch (error) {
    console.error("Health check failed:", error);

    res.status(503).json({
      status: "degraded",
      database: "disconnected",
      version: "1.1.0",
    });
  }
});

app.get("/", (_req, res) => {
  res.send("Hello from Nook!");
});

app.get("/crash", async (_req, res) => {
  res.status(500).json({
    success: false,
    error: {
      message: "Something went wrong!",
      code: "INTERNAL_SERVER_ERROR",
    },
  });
});

app.use(errorHandler);

export default app;