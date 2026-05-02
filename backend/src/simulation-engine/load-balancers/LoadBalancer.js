class LoadBalancer {
    constructor() {
        if (this.constructor === LoadBalancer) {
            throw new Error('LoadBalancer is an abstract class and cannot be instantiated directly');
        }
    }

    selectServer(servers, request) {
        throw new Error('selectServer method must be implemented by subclass');
    }

    getName() {
        throw new Error('getName method must be implemented by subclass');
    }

    reset() {
        // Optional: override in subclass if state needs resetting
    }
}

module.exports = LoadBalancer;