const Request = require('./Request');
const logger = require('../utils/logger');

class TrafficGenerator {
    constructor(lambda, burstConfig = null) {
        this.lambda = lambda; // Average request rate per second
        this.burstConfig = burstConfig;
        this.seed = 12345; // Fixed seed for deterministic simulation
        
        // Poisson distribution parameters
        this.L = Math.exp(-lambda);
        this.time = 0;
    }

    // Simple linear congruential generator for deterministic randomness
    random() {
        this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
        return this.seed / 0x7fffffff;
    }

    // Poisson distribution using Knuth's algorithm
    poissonRandom() {
        let k = 0;
        let p = 1.0;
        const L = Math.exp(-this.lambda);
        
        do {
            k++;
            p *= this.random();
        } while (p > L);
        
        return k - 1;
    }

    // Generate request processing time using exponential distribution
    generateProcessingTime(meanProcessingTime = 0.1) {
        return -Math.log(1 - this.random()) * meanProcessingTime;
    }

    // Check if current time is in burst period
    isInBurst(currentTime) {
        if (!this.burstConfig || !this.burstConfig.enabled) {
            return false;
        }

        const { startTime, duration, interval } = this.burstConfig;
        
        if (currentTime < startTime) {
            return false;
        }

        const timeSinceStart = currentTime - startTime;
        const burstPhase = Math.floor(timeSinceStart / interval);
        const timeInPhase = timeSinceStart % interval;
        
        return timeInPhase < duration;
    }

    // Generate requests for a given time step
    generateRequests(timeStep, currentTime = 0) {
        const requests = [];
        
        // Validate inputs
        if (this.lambda <= 0) {
            return requests; // No requests if rate is invalid
        }
        
        // Adjust lambda for burst periods
        let effectiveLambda = this.lambda;
        if (this.isInBurst(currentTime)) {
            effectiveLambda *= (this.burstConfig.multiplier || 3);
            logger.debug(`Burst mode active at time ${currentTime}, lambda=${effectiveLambda}`);
        }

        // Generate number of requests using Poisson distribution
        const scaledLambda = effectiveLambda * timeStep;
        
        // Prevent very small scaledLambda that could cause infinite loops
        if (scaledLambda < 1e-10) {
            return requests; // Too small to generate meaningful requests
        }
        
        const L = Math.exp(-scaledLambda);
        
        let numRequests = 0;
        let p = 1.0;
        let maxIterations = 10000; // Safety limit
        let iterations = 0;
        
        do {
            numRequests++;
            p *= this.random();
            iterations++;
        } while (p > L && iterations < maxIterations);
        
        numRequests = Math.max(0, numRequests - 1);

        // Create request objects
        for (let i = 0; i < numRequests; i++) {
            // Distribute arrival times uniformly within the time step
            const arrivalOffset = this.random() * timeStep;
            const arrivalTime = currentTime + arrivalOffset;
            
            // Generate processing time (exponential distribution, mean = 0.1 seconds)
            const processingTime = this.generateProcessingTime(0.1);
            
            // Vary request sizes (1-5 units)
            const size = Math.floor(this.random() * 5) + 1;
            
            const request = new Request(arrivalTime, processingTime, size);
            requests.push(request);
        }

        return requests;
    }

    // Generate a traffic pattern with spikes
    generateSpikePattern(baseLambda, spikeMultiplier, spikeDuration, spikeInterval) {
        this.burstConfig = {
            enabled: true,
            startTime: 10, // Start after 10 seconds
            duration: spikeDuration,
            interval: spikeInterval,
            multiplier: spikeMultiplier
        };
    }

    reset() {
        this.seed = 12345;
        this.time = 0;
    }
}

module.exports = TrafficGenerator;