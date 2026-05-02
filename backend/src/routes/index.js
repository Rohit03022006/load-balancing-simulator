const express = require("express");
const router = express.Router();
const simulationRoutes = require("./simulationRoutes");

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

const analyticsRoutes = require("./analyticsRoutes");

// API routes
router.use("/api/v1", simulationRoutes);
router.use("/api/v1/analytics", analyticsRoutes);

// API documentation endpoint
router.get("/api", (req, res) => {
  res.json({
    name: "Load Balancing Strategy Simulator API",
    version: "1.0.0",
    endpoints: {
      "POST /api/v1/simulate": "Create and start a simulation",
      "POST /api/v1/simulate/sync": "Run simulation synchronously",
      "GET /api/v1/results/:id": "Get simulation results",
      "GET /api/v1/simulations/:id/status": "Get simulation status",
      "GET /api/v1/simulations": "List all simulations",
      "GET /api/v1/algorithms": "Get available algorithms",
      "POST /api/v1/simulate/compare": "Compare multiple algorithms",
      "DELETE /api/v1/simulations/:id": "Cancel simulation",
      "GET /api/v1/simulations/running": "Get running simulations",
    },
  });
});

module.exports = router;
