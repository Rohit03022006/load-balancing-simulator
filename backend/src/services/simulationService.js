const { SimulationEngine } = require('../simulation-engine');
const Simulation = require('../models/Simulation');
const SimulationResult = require('../models/SimulationResult');
const { SIMULATION_STATUS, LOAD_BALANCING_ALGORITHMS } = require('../config/constants');
const logger = require('../utils/logger');

class SimulationService {
    constructor() {
        this.runningSimulations = new Map();
    }

    async createSimulation(config) {
        // Validate configuration
        this.validateConfig(config);
        
        // Create simulation record
        const simulation = await Simulation.create(config);
        
        return simulation;
    }

    validateConfig(config) {
        const errors = [];
        
        if (!config.algorithm || !Object.values(LOAD_BALANCING_ALGORITHMS).includes(config.algorithm)) {
            errors.push(`Invalid algorithm. Must be one of: ${Object.values(LOAD_BALANCING_ALGORITHMS).join(', ')}`);
        }
        
        if (!config.requestRate || config.requestRate < 1 || config.requestRate > 10000) {
            errors.push('Request rate must be between 1 and 10000');
        }
        
        if (!config.numServers || config.numServers < 1 || config.numServers > 100) {
            errors.push('Number of servers must be between 1 and 100');
        }
        
        if (!config.serverCapacity || config.serverCapacity < 1 || config.serverCapacity > 1000) {
            errors.push('Server capacity must be between 1 and 1000');
        }
        
        if (!config.duration || config.duration < 1 || config.duration > 300) {
            errors.push('Simulation duration must be between 1 and 300 seconds');
        }
        
        if (errors.length > 0) {
            throw new Error(`Validation failed: ${errors.join('; ')}`);
        }
    }

    async runSimulation(simulationId) {
        const simulation = await Simulation.findById(simulationId);
        
        if (!simulation) {
            throw new Error(`Simulation ${simulationId} not found`);
        }
        
        if (simulation.status !== SIMULATION_STATUS.PENDING) {
            throw new Error(`Simulation ${simulationId} is not in pending state`);
        }
        
        // Update status to running
        await simulation.updateStatus(SIMULATION_STATUS.RUNNING);
        
        // Track running simulation
        this.runningSimulations.set(simulationId, { startTime: Date.now() });
        
        try {
            // Create and run simulation engine
            const engine = new SimulationEngine(simulation.config);
            const result = await engine.run();
            
            // Save core metrics — must succeed for the simulation to complete
            await SimulationResult.create(simulationId, result.metrics, result.metrics.timeSeriesData);
            
            // Mark as completed BEFORE the optional bulk time-series insert
            await simulation.updateStatus(SIMULATION_STATUS.COMPLETED);
            
            // Save detailed time series — best-effort, non-fatal, fire and forget
            SimulationResult.saveServerMetricsTimeSeries(simulationId, result.metrics.timeSeriesData)
                .catch(err => logger.warn(`Non-fatal: failed to save server metrics time series for ${simulationId}:`, err.message));
            
            // Get the saved result
            const savedResult = await SimulationResult.findBySimulationId(simulationId);
            
            logger.info(`Simulation ${simulationId} completed successfully`);
            
            return {
                simulation_id: simulationId,
                status: SIMULATION_STATUS.COMPLETED,
                metrics: savedResult.toJSON().metrics,
                time_series_data: savedResult.timeSeriesData,
                execution_time: result.executionTime
            };
            
        } catch (error) {
            logger.error(`Simulation ${simulationId} failed:`, error);
            
            // Update simulation status to failed
            await simulation.updateStatus(SIMULATION_STATUS.FAILED, error.message);
            
            throw error;
        } finally {
            this.runningSimulations.delete(simulationId);
        }
    }

    async runSimulationAsync(simulationId) {
        // Run simulation in background
        this.runningSimulations.set(simulationId, true);
        setImmediate(() => {
            this.runSimulation(simulationId).catch(error => {
                logger.error(`Background simulation ${simulationId} failed:`, error);
            });
        });
        
        return {
            simulation_id: simulationId,
            status: SIMULATION_STATUS.RUNNING,
            message: 'Simulation started successfully'
        };
    }

    async getSimulationResult(simulationId) {
        const simulation = await Simulation.findById(simulationId);
        
        if (!simulation) {
            return { simulation: null, result: null };
        }
        
        const result = await SimulationResult.findBySimulationId(simulationId);
        
        return {
            simulation: simulation.toJSON(),
            result: result ? result.toJSON() : null
        };
    }

    async getAvailableAlgorithms() {
        return Object.values(LOAD_BALANCING_ALGORITHMS).map(key => ({
            id: key,
            name: key.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' '),
            description: this.getAlgorithmDescription(key)
        }));
    }

    getAlgorithmDescription(algorithm) {
        const descriptions = {
            [LOAD_BALANCING_ALGORITHMS.ROUND_ROBIN]: 'Distributes requests sequentially across all servers',
            [LOAD_BALANCING_ALGORITHMS.WEIGHTED_ROUND_ROBIN]: 'Distributes requests based on server capacity weights',
            [LOAD_BALANCING_ALGORITHMS.LEAST_CONNECTIONS]: 'Sends requests to the server with fewest active connections'
        };
        
        return descriptions[algorithm] || '';
    }

    async compareAlgorithms(configs) {
        const results = [];
        
        for (const config of configs) {
            try {
                const simulation = await this.createSimulation(config);
                const result = await this.runSimulation(simulation.id);
                results.push({
                    ...result,
                    algorithm: config.algorithm
                });
            } catch (error) {
                logger.error('Error in comparison simulation:', error);
                results.push({
                    algorithm: config.algorithm,
                    error: error.message
                });
            }
        }
        
        return results;
    }

    getRunningSimulations() {
        return Array.from(this.runningSimulations.keys());
    }

    async cancelSimulation(simulationId) {
        if (this.runningSimulations.has(simulationId)) {
            // In a real implementation, we would have a way to stop the simulation
            this.runningSimulations.delete(simulationId);
            
            const simulation = await Simulation.findById(simulationId);
            if (simulation) {
                await simulation.updateStatus(SIMULATION_STATUS.FAILED, 'Cancelled by user');
            }
            
            return { cancelled: true };
        }
        
        return { cancelled: false, message: 'Simulation not running' };
    }

    async deleteSimulation(simulationId) {
        // 1. Cancel if running
        if (this.runningSimulations.has(simulationId)) {
            this.runningSimulations.delete(simulationId);
        }

        // 2. Delete results first (foreign key constraints)
        await SimulationResult.deleteBySimulationId(simulationId);

        // 3. Delete simulation record
        const deleted = await Simulation.delete(simulationId);

        return { success: deleted };
    }
}

module.exports = new SimulationService();