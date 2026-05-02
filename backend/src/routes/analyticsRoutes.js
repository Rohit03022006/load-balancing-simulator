const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");

router.get("/overview", analyticsController.getOverview);
router.get("/by-algorithm", analyticsController.getByAlgorithm);
router.get("/latency-over-time", analyticsController.getLatencyOverTime);
router.get("/scatter", analyticsController.getScatterData);
router.get("/heatmap", analyticsController.getHeatmapData);
router.get(
  "/throughput-distribution",
  analyticsController.getThroughputDistribution,
);

module.exports = router;
