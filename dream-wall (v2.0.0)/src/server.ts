import express from "express";
import dreamRoutes from "./src/routes/dreams.js"

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

app.listen(PORT, () => {
    console.log(`server is running on port http://localhost:${PORT}`);
});