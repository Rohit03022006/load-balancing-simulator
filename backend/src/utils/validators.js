const validateUUID = (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
};

const validateSimulationConfig = (config) => {
    const errors = [];
    
    if (!config.algorithm) {
        errors.push('Algorithm is required');
    }
    
    if (!config.requestRate || config.requestRate <= 0) {
        errors.push('Request rate must be positive');
    }
    
    if (!config.numServers || config.numServers <= 0) {
        errors.push('Number of servers must be positive');
    }
    
    if (!config.serverCapacity || config.serverCapacity <= 0) {
        errors.push('Server capacity must be positive');
    }
    
    if (!config.duration || config.duration <= 0) {
        errors.push('Duration must be positive');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

module.exports = {
    validateUUID,
    validateSimulationConfig
};