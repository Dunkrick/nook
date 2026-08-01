import express from "express";
import cardRouter from "./routes/cards.js";
import authRouter from "./routes/auth.js";
import prisma from "./prisma.js";
import cors from "cors";
import { errorHandler } from "./lib/error.js";

const app = express();
const PORT = process.env.PORT || 3003;

const allowedOrigins = ["http://localhost:5173"];
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ""));
}

app.use(
    cors({
        origin: allowedOrigins,
    })
);

//middleware
app.use(express.json());
app.use(express.static("public"));
app.use("/", cardRouter);
app.use("/auth", authRouter);

//router
app.get("/", (_, res) => {
    res.send("Hello from Nook! v4");
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

async function testConnection() {
    try {
        await prisma.$queryRaw`SELECT NOW()`;
        console.log("Database connected via Prisma!");
    }
    catch (error) {
        console.error("Database connection failed via Prisma:", error);
    }
}

testConnection();

app.listen(PORT, () => {
    console.log(`server is running on port http://localhost:${PORT}`);
});