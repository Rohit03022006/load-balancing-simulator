const logger = require('../utils/logger');

class MetricsCollector {
    constructor() {
        this.reset();
    }

    reset() {
        this.latencies = [];
        this.waitTimes = [];
        this.throughputData = [];
        this.queueLengthHistory = [];
        this.utilizationHistory = [];
        this.serverStates = [];
        this.requestTimeline = [];
        
        this.startTime = null;
        this.endTime = null;
        this.totalRequests = 0;
        this.completedRequests = 0;
        this.failedRequests = 0;
    }

    startCollection() {
        this.startTime = Date.now();
    }

    endCollection() {
        this.endTime = Date.now();
    }

    recordRequest(request) {
        this.totalRequests++;
        this.requestTimeline.push({
            id: request.id,
            arrivalTime: request.arrivalTime,
            serverId: request.serverId
        });
    }

    recordCompletedRequest(request) {
        this.completedRequests++;
        const latency = request.getLatency();
        
        if (latency !== null) {
            this.latencies.push(latency);
            this.waitTimes.push(request.waitTime);
        }
    }

    recordServerState(servers, timestamp) {
        const state = {
            timestamp,
            servers: servers.map(server => ({
                id: server.id,
                queueLength: server.getQueueLength(),
                utilization: server.getUtilization(),
                activeConnections: server.getActiveConnections(),
                totalProcessed: server.totalProcessed
            }))
        };
        
        this.serverStates.push(state);
        
        // Aggregate queue lengths and utilizations
        const avgQueueLength = servers.reduce((sum, s) => sum + s.getQueueLength(), 0) / servers.length;
        const avgUtilization = servers.reduce((sum, s) => sum + s.getUtilization(), 0) / servers.length;
        
        this.queueLengthHistory.push({
            timestamp,
            value: avgQueueLength
        });
        
        this.utilizationHistory.push({
            timestamp,
            value: avgUtilization
        });
    }

    recordThroughput(timestamp, requestCount) {
        this.throughputData.push({
            timestamp,
            value: requestCount
        });
    }

    calculatePercentile(values, percentile) {
        if (values.length === 0) return 0;
        
        const sorted = [...values].sort((a, b) => a - b);
        const index = Math.ceil((percentile / 100) * sorted.length) - 1;
        return sorted[Math.max(0, index)];
    }

    getMetrics() {
        const simulationDuration = this.endTime && this.startTime 
            ? (this.endTime - this.startTime) / 1000 
            : 0;
        
        // Calculate throughput metrics
        const throughputValues = this.throughputData.map(d => d.value);
        const avgThroughput = throughputValues.length > 0
            ? throughputValues.reduce((a, b) => a + b, 0) / throughputValues.length
            : 0;
        const peakThroughput = throughputValues.length > 0
            ? Math.max(...throughputValues)
            : 0;
        
        // Calculate latency metrics
        const avgLatency = this.latencies.length > 0
            ? this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length
            : 0;
        
        const p95Latency = this.calculatePercentile(this.latencies, 95);
        const p99Latency = this.calculatePercentile(this.latencies, 99);
        
        const avgWaitTime = this.waitTimes.length > 0
            ? this.waitTimes.reduce((a, b) => a + b, 0) / this.waitTimes.length
            : 0;
        
        // Calculate server utilization
        const serverUtilization = this.serverStates.length > 0
            ? this.serverStates[this.serverStates.length - 1].servers.map(s => s.utilization)
            : [];
        
        const avgQueueLength = this.queueLengthHistory.length > 0
            ? this.queueLengthHistory.reduce((sum, d) => sum + d.value, 0) / this.queueLengthHistory.length
            : 0;
        
        return {
            // Summary metrics
            avgLatency: Number(avgLatency.toFixed(3)),
            p95Latency: Number(p95Latency.toFixed(3)),
            p99Latency: Number(p99Latency.toFixed(3)),
            avgWaitTime: Number(avgWaitTime.toFixed(3)),
            
            // Throughput metrics
            avgThroughput: Number(avgThroughput.toFixed(2)),
            peakThroughput: Number(peakThroughput.toFixed(2)),
            
            // Request metrics
            totalRequests: this.totalRequests,
            completedRequests: this.completedRequests,
            failedRequests: this.failedRequests,
            successRate: this.totalRequests > 0 
                ? Number(((this.completedRequests / this.totalRequests) * 100).toFixed(2))
                : 0,
            
            // Server metrics
            serverUtilization: serverUtilization.map(u => Number(u.toFixed(2))),
            avgQueueLength: Number(avgQueueLength.toFixed(2)),
            
            // Simulation info
            simulationDuration: Number(simulationDuration.toFixed(2)),
            
            // Time series data
            timeSeriesData: {
                throughput: this.throughputData,
                queueLength: this.queueLengthHistory,
                utilization: this.utilizationHistory,
                serverStates: this.serverStates
            }
        };
    }

    toJSON() {
        return this.getMetrics();
    }
}

module.exports = MetricsCollector;