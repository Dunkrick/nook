import express from "express";
import artifactRouter from "./routes/artifacts.js";
import authRouter from "./routes/auth.js";
import prisma from "./prisma.js";
import cors from "cors";
import { errorHandler } from "./lib/error.js";

const app = express();
const PORT = process.env.PORT || 3003;

const allowedOrigins = [
    "http://localhost:5173",
    "https://nookmy.vercel.app",
];

app.use(
    cors({
        origin(origin, callback) {
            // Allow server-to-server requests (no Origin header)
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

//middleware
app.use(express.json());
app.use(express.static("public"));
app.use("/", artifactRouter);
app.use("/auth", authRouter);

//router
app.get("/health", (_, res) => {
    res.status(200).json({
        "status": "ok",
        "database": "connected",
        "version": "1.1.0"
    });
});

app.get("/", (_, res) => {
    res.send("Hello from Nook!");
});

app.get("/crash", async (_, res) => {
    res.status(500).json({
        "success": false,
        "error": {
            "message": "Something went wrong!",
            "code": "INTERNAL_SERVER_ERROR"
        }
    });
});

app.use(errorHandler);

async function startServer() {
    try {
        await prisma.$connect();

        console.log("Database connected.");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();