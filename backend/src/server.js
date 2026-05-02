require("dotenv").config();

const app = require("./app");
const db = require("./config/database");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 3000;

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  try {
    // Close database connection
    await db.close();
    logger.info("Database connection closed");

    process.exit(0);
  } catch (error) {
    logger.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const isHealthy = await db.healthCheck();

    if (!isHealthy) {
      throw new Error("Database health check failed");
    }

    logger.info("Database connection established successfully");

    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`
    ╔═══════════════════════════════════════════════════════╗
    ║                                                       ║
    ║   Load Balancing Strategy Simulator API               ║
    ║                                                       ║
    ║   Server running on port ${PORT}                      ║
    ║  Environment: ${process.env.NODE_ENV || "development"}║
    ║                                                       ║
    ║   API Documentation: http://localhost:${PORT}/api     ║
    ║   Health Check: http://localhost:${PORT}/health       ║
    ║                                                       ║
    ╚═══════════════════════════════════════════════════════╝
            `);
    });

    // Server error handling
    server.on("error", (error) => {
      if (error.syscall !== "listen") {
        throw error;
      }

      switch (error.code) {
        case "EACCES":
          logger.error(`Port ${PORT} requires elevated privileges`);
          process.exit(1);
          break;
        case "EADDRINUSE":
          logger.error(`Port ${PORT} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
