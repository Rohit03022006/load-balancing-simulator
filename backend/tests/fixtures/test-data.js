const { LOAD_BALANCING_ALGORITHMS } = require("../../src/config/constants");

const validSimulationConfigs = {
  basic: {
    algorithm: LOAD_BALANCING_ALGORITHMS.ROUND_ROBIN,
    requestRate: 50,
    numServers: 3,
    serverCapacity: 20,
    duration: 10,
    timeStep: 0.1,
  },

  withBurst: {
    algorithm: LOAD_BALANCING_ALGORITHMS.LEAST_CONNECTIONS,
    requestRate: 40,
    numServers: 4,
    serverCapacity: 25,
    duration: 15,
    timeStep: 0.1,
    enableBurst: true,
    burstMultiplier: 3,
    burstDuration: 3,
    burstInterval: 12,
  },

  weighted: {
    algorithm: LOAD_BALANCING_ALGORITHMS.WEIGHTED_ROUND_ROBIN,
    requestRate: 60,
    numServers: 3,
    serverCapacity: 30,
    duration: 8,
    timeStep: 0.1,
    serverWeights: [1, 2, 3],
  },

  highLoad: {
    algorithm: LOAD_BALANCING_ALGORITHMS.ROUND_ROBIN,
    requestRate: 200,
    numServers: 10,
    serverCapacity: 25,
    duration: 5,
    timeStep: 0.05,
  },
};

const expectedMetricsStructure = {
  avgLatency: "number",
  p95Latency: "number",
  p99Latency: "number",
  avgWaitTime: "number",
  avgThroughput: "number",
  peakThroughput: "number",
  totalRequests: "number",
  completedRequests: "number",
  failedRequests: "number",
  successRate: "number",
  serverUtilization: "object",
  avgQueueLength: "number",
  simulationDuration: "number",
  timeSeriesData: "object",
};

const mockRequestData = {
  arrivalTime: 1.5,
  processingTime: 0.1,
  size: 2,
};

const mockServerData = {
  id: 1,
  processingRate: 25,
  queueLength: 5,
  activeConnections: 3,
  utilization: 75.5,
};

module.exports = {
  validSimulationConfigs,
  expectedMetricsStructure,
  mockRequestData,
  mockServerData,
};
