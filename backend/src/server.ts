import app from "./app.js";
import prisma from "./prisma.js";

const PORT = process.env.PORT || 3003;

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