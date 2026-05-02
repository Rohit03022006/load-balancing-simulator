const { v4: uuidv4 } = require('uuid');

class Request {
    constructor(arrivalTime, processingTime, size = 1) {
        this.id = uuidv4();
        this.arrivalTime = arrivalTime;
        this.processingTime = processingTime;
        this.size = size;
        this.processingStartTime = null;
        this.completionTime = null;
        this.remainingTime = processingTime;
        this.serverId = null;
        this.waitTime = 0;
    }

    startProcessing(currentTime) {
        this.processingStartTime = currentTime;
        this.waitTime = currentTime - this.arrivalTime;
    }

    processPartial(timeAmount) {
        this.remainingTime -= timeAmount;
        if (this.remainingTime < 0) {
            this.remainingTime = 0;
        }
    }

    complete(completionTime) {
        this.completionTime = completionTime;
        this.remainingTime = 0;
    }

    getLatency() {
        if (this.completionTime === null) {
            return null;
        }
        return this.completionTime - this.arrivalTime;
    }

    getWaitTime() {
        return this.waitTime;
    }

    isCompleted() {
        return this.completionTime !== null;
    }

    toJSON() {
        return {
            id: this.id,
            arrivalTime: this.arrivalTime,
            processingTime: this.processingTime,
            waitTime: this.waitTime,
            latency: this.getLatency(),
            serverId: this.serverId
        };
    }
}

module.exports = Request;