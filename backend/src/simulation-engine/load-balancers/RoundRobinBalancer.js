const LoadBalancer = require('./LoadBalancer');

class RoundRobinBalancer extends LoadBalancer {
    constructor() {
        super();
        this.currentIndex = 0;
    }

    selectServer(servers, request) {
        if (!servers || servers.length === 0) {
            throw new Error('No servers available');
        }

        const server = servers[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % servers.length;
        
        return server;
    }

    getName() {
        return 'Round Robin';
    }

    reset() {
        this.currentIndex = 0;
    }
}

module.exports = RoundRobinBalancer;