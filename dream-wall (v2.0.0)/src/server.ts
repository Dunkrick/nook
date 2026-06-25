import express from "express";
import dreamRoutes from "./routes/dreams.js";
import pool from "./postgres.js";

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

async function testConnection() {
    try {
        const result = await pool.query("SELECT NOW()");
        console.log("Database connected!");
        console.log(result.rows[0]);
    }
    catch (error) {
        console.error("Database connection failed", error);
    }
}

testConnection();

app.listen(PORT, () => {
    console.log(`server is running on port http://localhost:${PORT}`);
});