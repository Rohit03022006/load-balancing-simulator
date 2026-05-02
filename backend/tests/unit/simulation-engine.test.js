const {
  SimulationEngine,
  TrafficGenerator,
  Server,
  Request,
  MetricsCollector,
} = require("../../src/simulation-engine");

const { LOAD_BALANCING_ALGORITHMS } = require("../../src/config/constants");

describe("Simulation Engine", () => {
  describe("TrafficGenerator", () => {
    let generator;

    beforeEach(() => {
      generator = new TrafficGenerator(10); // 10 requests per second
    });

    test("should generate requests following Poisson distribution", () => {
      const requests = generator.generateRequests(1.0); // 1 second

      // Number of requests should be around lambda (10)
      expect(requests.length).toBeGreaterThan(0);
      expect(requests.length).toBeLessThan(25); // Reasonable upper bound

      // Each request should have valid properties
      requests.forEach((request) => {
        expect(request).toHaveProperty("id");
        expect(request).toHaveProperty("arrivalTime");
        expect(request).toHaveProperty("processingTime");
        expect(request.processingTime).toBeGreaterThan(0);
      });
    });

    test("should respect time step scaling", () => {
      const requests1 = generator.generateRequests(0.1); // 100ms
      const requests2 = generator.generateRequests(1.0); // 1 second

      // Average requests per second should be similar
      const rate1 = requests1.length / 0.1;
      const rate2 = requests2.length / 1.0;

      expect(rate1).toBeCloseTo(rate2, 1);
    });

    test("should handle burst mode", () => {
      const burstGenerator = new TrafficGenerator(10, {
        enabled: true,
        startTime: 5,
        duration: 2,
        interval: 10,
        multiplier: 3,
      });

      // Before burst
      const requestsBefore = burstGenerator.generateRequests(1.0, 0);
      const avgBefore = requestsBefore.length;

      // During burst
      const requestsDuring = burstGenerator.generateRequests(1.0, 5.5);
      const avgDuring = requestsDuring.length;

      // After burst
      const requestsAfter = burstGenerator.generateRequests(1.0, 8);
      const avgAfter = requestsAfter.length;

      // Burst should generate more requests
      expect(avgDuring).toBeGreaterThan(avgBefore);
      expect(avgAfter).toBeCloseTo(avgBefore, 1);
    });
  });

  describe("Server", () => {
    let server;

    beforeEach(() => {
      server = new Server(1, 10); // Server ID 1, 10 req/sec
    });

    test("should process requests in FIFO order", () => {
      const request1 = new Request(0, 0.1);
      const request2 = new Request(0, 0.1);

      server.acceptRequest(request1);
      server.acceptRequest(request2);

      expect(server.getQueueLength()).toBe(2);

      const completed = server.process(0.2); // 0.2 seconds

      expect(completed.length).toBe(2);
      expect(completed[0].id).toBe(request1.id);
      expect(completed[1].id).toBe(request2.id);
      expect(server.getQueueLength()).toBe(0);
    });

    test("should handle partial processing", () => {
      const request = new Request(0, 0.2); // Needs 0.2 seconds

      server.acceptRequest(request);

      // Process only 0.1 seconds worth
      const completed = server.process(0.1);

      expect(completed.length).toBe(0);
      expect(server.getQueueLength()).toBe(1);
      expect(request.remainingTime).toBeLessThan(0.2);
    });

    test("should calculate correct utilization", () => {
      const request1 = new Request(0, 0.05);
      const request2 = new Request(0, 0.05);

      server.acceptRequest(request1);
      server.acceptRequest(request2);

      server.process(0.1);

      expect(server.getUtilization()).toBe(100);
    });

    test("should track metrics correctly", () => {
      const request = new Request(0, 0.1);
      server.acceptRequest(request);
      server.process(0.1);

      const stats = server.getStats();

      expect(stats.totalProcessed).toBe(1);
      expect(stats.avgResponseTime).toBeGreaterThan(0);
      expect(stats.queueLength).toBe(0);
    });
  });

  describe("Request", () => {
    test("should calculate latency correctly", () => {
      const request = new Request(0, 0.1);
      request.startProcessing(0.05);
      request.complete(0.15);

      expect(request.getLatency()).toBe(0.15);
      expect(request.getWaitTime()).toBe(0.05);
    });

    test("should handle partial processing", () => {
      const request = new Request(0, 0.1);
      request.processPartial(0.05);

      expect(request.remainingTime).toBe(0.05);
      expect(request.isCompleted()).toBe(false);
    });
  });

  describe("Load Balancers", () => {
    let servers;

    beforeEach(() => {
      servers = [new Server(0, 10), new Server(1, 20), new Server(2, 30)];
    });

    test("Round Robin should cycle through servers", () => {
      const RoundRobinBalancer = require("../../src/simulation-engine/load-balancers/RoundRobinBalancer");
      const balancer = new RoundRobinBalancer();

      const request = new Request(0, 0.1);

      const selected1 = balancer.selectServer(servers, request);
      const selected2 = balancer.selectServer(servers, request);
      const selected3 = balancer.selectServer(servers, request);
      const selected4 = balancer.selectServer(servers, request);

      expect(selected1.id).toBe(0);
      expect(selected2.id).toBe(1);
      expect(selected3.id).toBe(2);
      expect(selected4.id).toBe(0);
    });

    test("Least Connections should select server with fewest connections", () => {
      const LeastConnectionsBalancer = require("../../src/simulation-engine/load-balancers/LeastConnectionsBalancer");
      const balancer = new LeastConnectionsBalancer();

      const request = new Request(0, 0.1);

      // Add some connections
      servers[1].acceptRequest(new Request(0, 0.1));
      servers[1].acceptRequest(new Request(0, 0.1));
      servers[2].acceptRequest(new Request(0, 0.1));

      const selected = balancer.selectServer(servers, request);

      expect(selected.id).toBe(0); // Server 0 has 0 connections
    });

    test("Weighted Round Robin should distribute according to weights", () => {
      const WeightedRoundRobinBalancer = require("../../src/simulation-engine/load-balancers/WeightedRoundRobinBalancer");
      const balancer = new WeightedRoundRobinBalancer([1, 2, 3]);

      const request = new Request(0, 0.1);
      const selections = [];

      // Make multiple selections
      for (let i = 0; i < 60; i++) {
        const server = balancer.selectServer(servers, request);
        selections.push(server.id);
      }

      // Count frequencies
      const counts = { 0: 0, 1: 0, 2: 0 };
      selections.forEach((id) => counts[id]++);

      // Should be roughly proportional to weights
      expect(counts[0]).toBeLessThan(counts[1]);
      expect(counts[1]).toBeLessThan(counts[2]);
      expect(counts[2] / counts[0]).toBeCloseTo(3, 1);
    });
  });

  describe("MetricsCollector", () => {
    let collector;

    beforeEach(() => {
      collector = new MetricsCollector();
    });

    test("should calculate percentiles correctly", () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

      values.forEach((v) => collector.latencies.push(v));

      const metrics = collector.getMetrics();

      expect(metrics.avgLatency).toBe(5.5);
      expect(metrics.p95Latency).toBe(10);
      expect(metrics.p99Latency).toBe(10);
    });

    test("should track throughput over time", () => {
      collector.recordThroughput(0, 100);
      collector.recordThroughput(1, 150);
      collector.recordThroughput(2, 120);

      const metrics = collector.getMetrics();

      expect(metrics.avgThroughput).toBe(123.33);
      expect(metrics.peakThroughput).toBe(150);
    });

    test("should calculate server utilization", () => {
      const servers = [new Server(0, 10), new Server(1, 10)];

      servers[0].busyTime = 5;
      servers[0].currentTime = 10;
      servers[1].busyTime = 8;
      servers[1].currentTime = 10;

      collector.recordServerState(servers, 0);

      const metrics = collector.getMetrics();

      expect(metrics.serverUtilization[0]).toBe(50);
      expect(metrics.serverUtilization[1]).toBe(80);
    });
  });

  describe("SimulationEngine", () => {
    test("should run complete simulation", async () => {
      const config = {
        algorithm: LOAD_BALANCING_ALGORITHMS.ROUND_ROBIN,
        requestRate: 20,
        numServers: 2,
        serverCapacity: 15,
        duration: 2,
        timeStep: 0.1,
      };

      const engine = new SimulationEngine(config);
      const result = await engine.run();

      expect(result).toHaveProperty("metrics");
      expect(result).toHaveProperty("executionTime");

      const metrics = result.metrics;
      expect(metrics).toHaveProperty("avgLatency");
      expect(metrics).toHaveProperty("totalRequests");
      expect(metrics).toHaveProperty("completedRequests");
      expect(metrics.completedRequests).toBeGreaterThan(0);
    });

    test("should handle different algorithms", async () => {
      const algorithms = Object.values(LOAD_BALANCING_ALGORITHMS);

      for (const algorithm of algorithms) {
        const config = {
          algorithm,
          requestRate: 15,
          numServers: 3,
          serverCapacity: 10,
          duration: 1,
          timeStep: 0.1,
        };

        const engine = new SimulationEngine(config);
        const result = await engine.run();

        expect(result.metrics).toBeDefined();
      }
    });

    test("should produce deterministic results with same seed", async () => {
      const config = {
        algorithm: LOAD_BALANCING_ALGORITHMS.ROUND_ROBIN,
        requestRate: 25,
        numServers: 2,
        serverCapacity: 15,
        duration: 1,
        timeStep: 0.1,
      };

      const engine1 = new SimulationEngine(config);
      const result1 = await engine1.run();

      const engine2 = new SimulationEngine(config);
      const result2 = await engine2.run();

      // Results should be identical due to deterministic RNG
      expect(result1.metrics.totalRequests).toBe(result2.metrics.totalRequests);
      expect(result1.metrics.completedRequests).toBe(
        result2.metrics.completedRequests,
      );
      expect(result1.metrics.avgLatency).toBeCloseTo(
        result2.metrics.avgLatency,
        5,
      );
    });
  });
});
