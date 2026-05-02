const LoadBalancer = require('./LoadBalancer');

class LeastConnectionsBalancer extends LoadBalancer {
    constructor() {
        super();
    }

    selectServer(servers, request) {
        if (!servers || servers.length === 0) {
            throw new Error('No servers available');
        }

        let selectedServer = servers[0];
        let minConnections = selectedServer.getActiveConnections();

        for (let i = 1; i < servers.length; i++) {
            const server = servers[i];
            const connections = server.getActiveConnections();
            
            // If connections are equal, consider processing rate
            if (connections < minConnections) {
                selectedServer = server;
                minConnections = connections;
            } else if (connections === minConnections) {
                // Tiebreaker: choose server with higher processing rate
                if (server.processingRate > selectedServer.processingRate) {
                    selectedServer = server;
                }
            }
        }

        return selectedServer;
    }

    getName() {
        return 'Least Connections';
    }
}

module.exports = LeastConnectionsBalancer;