import express from "express";
import dreamRoutes from "./routes/dreams.js";
import prisma from "./prisma.js";
import { errorHandler } from "./lib/error.js";

const app = express();
const PORT = process.env.PORT || 3003;

//middleware
app.use(express.json());
app.use(express.static("public"));
app.use("/", dreamRoutes);

//router
app.get("/", (_, res) => {
    res.send("Hello from Dream Wall v2");
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