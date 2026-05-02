const simulationService = require("../services/simulationService");
const { SIMULATION_STATUS } = require("../config/constants");
const logger = require("../utils/logger");

class SimulationController {
  async createSimulation(req, res, next) {
    try {
      const config = req.body;

      // Validate required fields
      const requiredFields = [
        "algorithm",
        "requestRate",
        "numServers",
        "serverCapacity",
        "duration",
      ];
      const missingFields = requiredFields.filter((field) => !config[field]);

      if (missingFields.length > 0) {
        return res.status(400).json({
          error: "Missing required fields",
          fields: missingFields,
        });
      }

      // Create simulation
      const simulation = await simulationService.createSimulation(config);

      // Start simulation asynchronously
      const response = await simulationService.runSimulationAsync(
        simulation.id,
      );

      res.status(201).json(response);
    } catch (error) {
      logger.error("Error creating simulation:", error);

      if (error.message.includes("Validation failed")) {
        return res.status(400).json({ error: error.message });
      }

      next(error);
    }
  }

  async runSimulationSync(req, res, next) {
    try {
      const config = req.body;

      // Create simulation
      const simulation = await simulationService.createSimulation(config);

      // Run simulation synchronously
      const result = await simulationService.runSimulation(simulation.id);

      res.json(result);
    } catch (error) {
      logger.error("Error running simulation:", error);
      next(error);
    }
  }

  async getSimulationResult(req, res, next) {
    try {
      const { id } = req.params;

      const result = await simulationService.getSimulationResult(id);

      if (!result.simulation) {
        return res.status(404).json({ error: "Simulation not found" });
      }

      res.json(result);
    } catch (error) {
      logger.error("Error fetching simulation result:", error);
      next(error);
    }
  }

  async getSimulationStatus(req, res, next) {
    try {
      const { id } = req.params;

      const result = await simulationService.getSimulationResult(id);

      if (!result.simulation) {
        return res.status(404).json({ error: "Simulation not found" });
      }

      res.json({
        id: result.simulation.id,
        status: result.simulation.status,
        createdAt: result.simulation.createdAt,
        startedAt: result.simulation.startedAt,
        completedAt: result.simulation.completedAt,
        has_results: !!result.result,
      });
    } catch (error) {
      logger.error("Error fetching simulation status:", error);
      next(error);
    }
  }

  async listSimulations(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const offset = parseInt(req.query.offset) || 0;

      const Simulation = require("../models/Simulation");
      const simulations = await Simulation.findAll(limit, offset);

      res.json({
        simulations: simulations.map((s) => s.toJSON()),
        pagination: {
          limit,
          offset,
          total: simulations.length,
        },
      });
    } catch (error) {
      logger.error("Error listing simulations:", error);
      next(error);
    }
  }

  async getAvailableAlgorithms(req, res, next) {
    try {
      const algorithms = await simulationService.getAvailableAlgorithms();
      res.json({ algorithms });
    } catch (error) {
      logger.error("Error fetching algorithms:", error);
      next(error);
    }
  }

  async compareAlgorithms(req, res, next) {
    try {
      const { configs } = req.body;

      if (!configs || !Array.isArray(configs) || configs.length === 0) {
        return res.status(400).json({ error: "Configs array is required" });
      }

      const results = await simulationService.compareAlgorithms(configs);
      res.json({ results });
    } catch (error) {
      logger.error("Error comparing algorithms:", error);
      next(error);
    }
  }

  async deleteSimulation(req, res, next) {
    try {
      const { id } = req.params;

      const result = await simulationService.deleteSimulation(id);
      res.json(result);
    } catch (error) {
      logger.error("Error deleting simulation:", error);
      next(error);
    }
  }

  async getRunningSimulations(req, res, next) {
    try {
      const running = simulationService.getRunningSimulations();
      res.json({ running_simulations: running });
    } catch (error) {
      logger.error("Error fetching running simulations:", error);
      next(error);
    }
  }
}

module.exports = new SimulationController();
