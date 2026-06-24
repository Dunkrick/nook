import express from "express";
import dreamRoutes from "./routes/dreams.js"

const app = express();
const PORT = process.env.PORT || 3003;

//middleware
app.use(express.json());
app.use(express.static("public"));

//router
app.use("/", dreamRoutes);

app.listen(PORT, () => {
    console.log(`server is running on port http://localhost:${PORT}`);
});