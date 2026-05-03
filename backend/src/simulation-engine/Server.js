const { DEFAULT_CONFIG } = require('../config/constants');
const logger = require('../utils/logger');

class Server {
    constructor(id, processingRate, maxQueueSize = DEFAULT_CONFIG.MAX_QUEUE_SIZE) {
        this.id = id;
        this.processingRate = processingRate; // requests per second
        this.maxQueueSize = maxQueueSize;
        this.queue = [];
        this.currentTime = 0;
        this.activeConnections = 0;
        this.totalProcessed = 0;
        this.totalWaitTime = 0;
        this.totalProcessingTime = 0;
        this.busyTime = 0;
        
        // Metrics tracking
        this.metrics = {
            queueLengthHistory: [],
            utilizationHistory: [],
            processedCount: 0
        };
    }

    acceptRequest(request) {
        request.serverId = this.id;
        this.queue.push(request);
        this.activeConnections++;
        
        if (this.queue.length > this.maxQueueSize) {
            logger.warn(`Server ${this.id} queue exceeded ${this.maxQueueSize} requests`);
        }
    }

    process(timeStep) {
        const processingCapacity = timeStep; // seconds available to process
        let processedTime = 0;
        const completedRequests = [];
        const startQueueLength = this.queue.length;

        // Process requests in FIFO order
        while (this.queue.length > 0 && processedTime < processingCapacity) {
            const request = this.queue[0];
            
            if (request.processingStartTime === null) {
                request.startProcessing(this.currentTime);
            }

            const timeNeeded = request.remainingTime;

            if (processedTime + timeNeeded <= processingCapacity) {
                // Complete the request
                this.queue.shift();
                processedTime += timeNeeded;
                
                const completionTime = this.currentTime + processedTime;
                request.complete(completionTime);
                
                completedRequests.push(request);
                this.totalProcessed++;
                this.totalProcessingTime += timeNeeded;
                this.totalWaitTime += request.waitTime;
                this.activeConnections--;
            } else {
                // Partial processing
                const partialTime = processingCapacity - processedTime;
                request.processPartial(partialTime);
                processedTime = processingCapacity;
                break;
            }
        }

        // Update server metrics
        const utilization = (processedTime / timeStep) * 100;
        this.busyTime += processedTime;
        
        this.metrics.utilizationHistory.push({
            time: this.currentTime,
            value: utilization
        });
        
        this.metrics.queueLengthHistory.push({
            time: this.currentTime,
            value: startQueueLength
        });

        this.currentTime += timeStep;
        
        return completedRequests;
    }

    getUtilization() {
        if (this.currentTime === 0) return 0;
        return (this.busyTime / this.currentTime) * 100;
    }

    getQueueLength() {
        return this.queue.length;
    }

    getActiveConnections() {
        return this.activeConnections;
    }

    getAverageResponseTime() {
        if (this.totalProcessed === 0) return 0;
        return (this.totalWaitTime + this.totalProcessingTime) / this.totalProcessed;
    }

    getAverageWaitTime() {
        if (this.totalProcessed === 0) return 0;
        return this.totalWaitTime / this.totalProcessed;
    }

    getStats() {
        return {
            id: this.id,
            processingRate: this.processingRate,
            queueLength: this.getQueueLength(),
            activeConnections: this.activeConnections,
            utilization: this.getUtilization(),
            totalProcessed: this.totalProcessed,
            avgResponseTime: this.getAverageResponseTime(),
            avgWaitTime: this.getAverageWaitTime()
        };
    }

    reset() {
        this.queue = [];
        this.currentTime = 0;
        this.activeConnections = 0;
        this.totalProcessed = 0;
        this.totalWaitTime = 0;
        this.totalProcessingTime = 0;
        this.busyTime = 0;
        this.metrics = {
            queueLengthHistory: [],
            utilizationHistory: [],
            processedCount: 0
        };
    }
}

module.exports = Server;