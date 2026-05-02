const LoadBalancer = require('./LoadBalancer');

class WeightedRoundRobinBalancer extends LoadBalancer {
    constructor(weights = null) {
        super();
        this.weights = weights;
        this.currentIndex = 0;
        this.currentWeight = 0;
        this.gcd = 1;
        this.maxWeight = 1;
    }

    initializeWeights(servers) {
        if (!this.weights) {
            // Default: assign weights based on server processing rate
            const totalRate = servers.reduce((sum, s) => sum + s.processingRate, 0);
            this.weights = servers.map(s => Math.ceil((s.processingRate / totalRate) * 10));
        }

        // Calculate GCD and max weight for efficient weighted round-robin
        this.gcd = this.calculateGCD(this.weights);
        this.maxWeight = Math.max(...this.weights);
    }

    calculateGCD(numbers) {
        if (!numbers || numbers.length === 0) {
            return 1; // Default GCD
        }
        const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
        return numbers.reduce((a, b) => gcd(a, b));
    }

    selectServer(servers, request) {
        if (!servers || servers.length === 0) {
            throw new Error('No servers available');
        }

        if (!this.weights) {
            this.initializeWeights(servers);
        }

        // Check if all weights are zero
        if (this.maxWeight === 0) {
            return servers[0]; // Fallback to first server
        }

        let attempts = 0;
        const maxAttempts = servers.length * 2; // Prevent infinite loops
        
        while (attempts < maxAttempts) {
            this.currentIndex = (this.currentIndex + 1) % servers.length;
            
            if (this.currentIndex === 0) {
                this.currentWeight = this.currentWeight - this.gcd;
                if (this.currentWeight <= 0) {
                    this.currentWeight = this.maxWeight;
                }
            }

            if (this.weights[this.currentIndex] >= this.currentWeight) {
                return servers[this.currentIndex];
            }
            
            attempts++;
        }
        
        // Fallback if no server found
        return servers[0];
    }

    getName() {
        return 'Weighted Round Robin';
    }

    reset() {
        this.currentIndex = 0;
        this.currentWeight = 0;
        this.weights = null;
    }
}

module.exports = WeightedRoundRobinBalancer;