const express = require('express');
const router = express.Router();
const simulationController = require('../controllers/simulationController');
const { validateSimulationConfig } = require('../middleware/validation');

// POST /simulate - Create and start a new simulation
router.post('/simulate', 
    validateSimulationConfig,
    simulationController.createSimulation
);

// POST /simulate/sync - Run simulation synchronously
router.post('/simulate/sync',
    validateSimulationConfig,
    simulationController.runSimulationSync
);

// GET /results/:id - Get simulation results
router.get('/results/:id', 
    simulationController.getSimulationResult
);

// GET /simulations/:id/status - Get simulation status
router.get('/simulations/:id/status',
    simulationController.getSimulationStatus
);

// GET /simulations - List all simulations
router.get('/simulations',
    simulationController.listSimulations
);

// GET /algorithms - Get available algorithms
router.get('/algorithms',
    simulationController.getAvailableAlgorithms
);

// POST /simulate/compare - Compare multiple algorithms
router.post('/simulate/compare',
    simulationController.compareAlgorithms
);

// DELETE /simulations/:id - Delete/Cancel a simulation
router.delete('/simulations/:id',
    simulationController.deleteSimulation
);

// GET /simulations/running - Get currently running simulations
router.get('/simulations/running',
    simulationController.getRunningSimulations
);

module.exports = router;