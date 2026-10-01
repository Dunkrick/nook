import app from "./app.js";
import { env } from "./config/env.js";
import { setupGithubQueue } from "./queue/github-events.js";
import prisma from "./prisma.js";

const PORT = env.PORT;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("Database connected.");

    await setupGithubQueue();
    console.log("GitHub queue setup complete.");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();