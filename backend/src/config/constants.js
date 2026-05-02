module.exports = {
  SIMULATION_STATUS: {
    PENDING: "pending",
    RUNNING: "running",
    COMPLETED: "completed",
    FAILED: "failed",
  },

  LOAD_BALANCING_ALGORITHMS: {
    ROUND_ROBIN: "round_robin",
    WEIGHTED_ROUND_ROBIN: "weighted_round_robin",
    LEAST_CONNECTIONS: "least_connections",
  },

  DEFAULT_CONFIG: {
    TIME_STEP: 0.1, // 100ms
    MAX_QUEUE_SIZE: 10000,
    DEFAULT_PROCESSING_RATE: 10, // requests per second
    BURST_MULTIPLIER: 3,
    BURST_DURATION: 5, // seconds
  },

  VALIDATION: {
    MIN_REQUEST_RATE: 1,
    MAX_REQUEST_RATE: 10000,
    MIN_SERVERS: 1,
    MAX_SERVERS: 100,
    MIN_DURATION: 1,
    MAX_DURATION: 300,
    MIN_CAPACITY: 1,
    MAX_CAPACITY: 1000,
  },
};
