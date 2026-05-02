const TrafficGenerator = require('./TrafficGenerator');
const Server = require('./Server');
const MetricsCollector = require('./MetricsCollector');
const RoundRobinBalancer = require('./load-balancers/RoundRobinBalancer');
const WeightedRoundRobinBalancer = require('./load-balancers/WeightedRoundRobinBalancer');
const LeastConnectionsBalancer = require('./load-balancers/LeastConnectionsBalancer');
const { LOAD_BALANCING_ALGORITHMS, DEFAULT_CONFIG } = require('../config/constants');
const logger = require('../utils/logger');

class SimulationEngine {
    constructor(config) {
        this.config = this.validateAndNormalizeConfig(config);
        this.timeStep = this.config.timeStep || DEFAULT_CONFIG.TIME_STEP;
        this.currentTime = 0;
        
        this.initializeTrafficGenerator();
        this.initializeServers();
        this.initializeLoadBalancer();
        this.metricsCollector = new MetricsCollector();
    }

    validateAndNormalizeConfig(config) {
        const normalized = { ...config };
        
        normalized.timeStep = normalized.timeStep || DEFAULT_CONFIG.TIME_STEP;
        normalized.maxQueueSize = normalized.maxQueueSize || DEFAULT_CONFIG.MAX_QUEUE_SIZE;
        
        if (!normalized.algorithm) {
            throw new Error('Load balancing algorithm is required');
        }
        
        if (!normalized.requestRate || normalized.requestRate <= 0) {
            throw new Error('Request rate must be positive');
        }
        
        if (!normalized.numServers || normalized.numServers <= 0) {
            throw new Error('Number of servers must be positive');
        }
        
        if (!normalized.duration || normalized.duration <= 0) {
            throw new Error('Simulation duration must be positive');
        }
        
        return normalized;
    }

    initializeTrafficGenerator() {
        const burstConfig = this.config.enableBurst ? {
            enabled: true,
            startTime: 10,
            duration: this.config.burstDuration || 5,
            interval: this.config.burstInterval || 30,
            multiplier: this.config.burstMultiplier || 3
        } : null;
        
        this.trafficGenerator = new TrafficGenerator(
            this.config.requestRate,
            burstConfig
        );
    }

    initializeServers() {
        this.servers = [];
        const baseCapacity = this.config.serverCapacity || DEFAULT_CONFIG.DEFAULT_PROCESSING_RATE;
        const maxQueueSize = this.config.maxQueueSize || DEFAULT_CONFIG.MAX_QUEUE_SIZE;
        
        // Use seeded random for deterministic but varied server capacities
        const seed = 12345;
        const random = (idx) => {
            const x = Math.sin(seed + idx * 1000) * 10000;
            return x - Math.floor(x);
        };
        
        for (let i = 0; i < this.config.numServers; i++) {
            // Add variation (±15%) using seeded random for reproducibility
            const variation = 0.85 + (random(i) * 0.3);
            const capacity = baseCapacity * variation;
            
            const server = new Server(i, capacity, maxQueueSize);
            this.servers.push(server);
        }
        
        logger.info(`Initialized ${this.servers.length} servers with avg capacity: ${baseCapacity}, max queue: ${maxQueueSize}`);
    }

    initializeLoadBalancer() {
        switch (this.config.algorithm) {
            case LOAD_BALANCING_ALGORITHMS.ROUND_ROBIN:
                this.loadBalancer = new RoundRobinBalancer();
                break;
                
            case LOAD_BALANCING_ALGORITHMS.WEIGHTED_ROUND_ROBIN:
                this.loadBalancer = new WeightedRoundRobinBalancer();
                break;
                
            case LOAD_BALANCING_ALGORITHMS.LEAST_CONNECTIONS:
                this.loadBalancer = new LeastConnectionsBalancer();
                break;
                
            default:
                throw new Error(`Unknown algorithm: ${this.config.algorithm}`);
        }
        
        logger.info(`Initialized load balancer: ${this.loadBalancer.getName()}`);
    }

    async run() {
        const startTime = Date.now();
        this.metricsCollector.startCollection();
        
        const numSteps = Math.ceil(this.config.duration / this.timeStep);
        let processedRequests = 0;
        
        logger.info(`Starting simulation: ${numSteps} steps, duration: ${this.config.duration}s`);
        
        for (let step = 0; step < numSteps; step++) {
            this.currentTime = step * this.timeStep;
            
            try {
                // 1. Generate incoming requests
                const newRequests = this.trafficGenerator.generateRequests(
                    this.timeStep,
                    this.currentTime
                );
                
                processedRequests += newRequests.length;
                
                // Record requests
                newRequests.forEach(request => {
                    this.metricsCollector.recordRequest(request);
                });
                
                // 2. Route requests using load balancing strategy
                for (const request of newRequests) {
                    try {
                        const server = this.loadBalancer.selectServer(this.servers, request);
                        server.acceptRequest(request);
                    } catch (error) {
                        logger.error('Error routing request:', error);
                        this.metricsCollector.failedRequests++;
                    }
                }
                
                // 3. Process server queues
                let completedInStep = 0;
                for (const server of this.servers) {
                    const completed = server.process(this.timeStep);
                    completedInStep += completed.length;
                    
                    completed.forEach(request => {
                        this.metricsCollector.recordCompletedRequest(request);
                    });
                }
                
                // 4. Update system state
                this.metricsCollector.recordServerState(this.servers, this.currentTime);
                this.metricsCollector.recordThroughput(
                    this.currentTime,
                    completedInStep / this.timeStep
                );
                
                // Progress logging for long simulations
                if (step % 100 === 0 && step > 0) {
                    logger.debug(`Simulation progress: ${((step / numSteps) * 100).toFixed(1)}%`);
                }
                
            } catch (error) {
                logger.error(`Error in simulation step ${step}:`, error);
                throw error;
            }
        }
        
        this.metricsCollector.endCollection();
        
        const metrics = this.metricsCollector.getMetrics();
        const executionTime = (Date.now() - startTime) / 1000;
        
        logger.info(`Simulation completed in ${executionTime.toFixed(2)}s`, {
            totalRequests: metrics.totalRequests,
            completedRequests: metrics.completedRequests,
            avgLatency: metrics.avgLatency
        });
        
        return {
            metrics,
            executionTime,
            config: this.config
        };
    }

    getStatus() {
        return {
            currentTime: this.currentTime,
            servers: this.servers.map(s => s.getStats()),
            metrics: this.metricsCollector.getMetrics()
        };
    }

    reset() {
        this.currentTime = 0;
        this.servers.forEach(server => server.reset());
        this.loadBalancer.reset();
        this.trafficGenerator.reset();
        this.metricsCollector.reset();
    }
}

module.exports = SimulationEngine;