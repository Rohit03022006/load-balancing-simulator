require("dotenv").config();
const request = require("supertest");
const app = require("../../src/app");
const db = require("../../src/config/database");
const { LOAD_BALANCING_ALGORITHMS } = require("../../src/config/constants");

describe("Load Balancing Simulator API", () => {
  let testSimulationId;

  beforeAll(async () => {
    // Clean up test data
    await db.query(
      "DELETE FROM simulation_results WHERE simulation_id IN (SELECT id FROM simulations WHERE config->>'test' = 'true')",
    );
    await db.query("DELETE FROM simulations WHERE config->>'test' = 'true'");
  });

  afterAll(async () => {
    // Wait for any background simulations to finish saving to DB
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await db.close();
  });

  describe("GET /api", () => {
    it("should return API documentation", async () => {
      const res = await request(app)
        .get("/api")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(res.body).toHaveProperty("name");
      expect(res.body).toHaveProperty("version");
      expect(res.body).toHaveProperty("endpoints");
    });
  });

  describe("GET /health", () => {
    it("should return health status", async () => {
      const res = await request(app)
        .get("/health")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(res.body).toHaveProperty("status", "healthy");
      expect(res.body).toHaveProperty("timestamp");
      expect(res.body).toHaveProperty("uptime");
    });
  });

  describe("GET /api/v1/algorithms", () => {
    it("should return available algorithms", async () => {
      const res = await request(app)
        .get("/api/v1/algorithms")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(res.body).toHaveProperty("algorithms");
      expect(Array.isArray(res.body.algorithms)).toBe(true);
      expect(res.body.algorithms.length).toBeGreaterThan(0);

      const algorithm = res.body.algorithms[0];
      expect(algorithm).toHaveProperty("id");
      expect(algorithm).toHaveProperty("name");
      expect(algorithm).toHaveProperty("description");
    });
  });

  describe("POST /api/v1/simulate", () => {
    const validConfig = {
      algorithm: LOAD_BALANCING_ALGORITHMS.ROUND_ROBIN,
      requestRate: 50,
      numServers: 3,
      serverCapacity: 20,
      duration: 10,
      test: true,
    };

    it("should create and start a simulation", async () => {
      const res = await request(app)
        .post("/api/v1/simulate")
        .send(validConfig)
        .expect("Content-Type", /json/)
        .expect(201);

      expect(res.body).toHaveProperty("simulation_id");
      expect(res.body).toHaveProperty("status", "running");

      testSimulationId = res.body.simulation_id;
    });

    it("should validate required fields", async () => {
      const invalidConfig = {
        algorithm: LOAD_BALANCING_ALGORITHMS.ROUND_ROBIN,
        // Missing required fields
      };

      const res = await request(app)
        .post("/api/v1/simulate")
        .send(invalidConfig)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(res.body).toHaveProperty("error");
    });

    it("should validate algorithm value", async () => {
      const invalidConfig = {
        ...validConfig,
        algorithm: "invalid_algorithm",
      };

      const res = await request(app)
        .post("/api/v1/simulate")
        .send(invalidConfig)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(res.body).toHaveProperty("error");
    });

    it("should validate numeric ranges", async () => {
      const invalidConfig = {
        ...validConfig,
        requestRate: 20000, // Too high
      };

      const res = await request(app)
        .post("/api/v1/simulate")
        .send(invalidConfig)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(res.body).toHaveProperty("error");
    });
  });

  describe("POST /api/v1/simulate/sync", () => {
    it("should run simulation synchronously and return results", async () => {
      const config = {
        algorithm: LOAD_BALANCING_ALGORITHMS.LEAST_CONNECTIONS,
        requestRate: 30,
        numServers: 2,
        serverCapacity: 15,
        duration: 5,
        test: true,
      };

      const res = await request(app)
        .post("/api/v1/simulate/sync")
        .send(config)
        .expect("Content-Type", /json/)
        .expect(200);

      expect(res.body).toHaveProperty("simulation_id");
      expect(res.body).toHaveProperty("status", "completed");
      expect(res.body).toHaveProperty("metrics");
      expect(res.body).toHaveProperty("execution_time");

      // Check metrics structure
      expect(res.body.metrics).toHaveProperty("avgLatency");
      expect(res.body.metrics).toHaveProperty("p95Latency");
      expect(res.body.metrics).toHaveProperty("p99Latency");
      expect(res.body.metrics).toHaveProperty("avgThroughput");
      expect(res.body.metrics).toHaveProperty("totalRequests");
      expect(res.body.metrics).toHaveProperty("serverUtilization");
    }, 30000); // Increase timeout for simulation
  });

  describe("GET /api/v1/simulations/:id/status", () => {
    it("should return simulation status", async () => {
      const res = await request(app)
        .get(`/api/v1/simulations/${testSimulationId}/status`)
        .expect("Content-Type", /json/)
        .expect(200);

      expect(res.body).toHaveProperty("id", testSimulationId);
      expect(res.body).toHaveProperty("status");
      expect(res.body).toHaveProperty("createdAt");
      expect(res.body).toHaveProperty("has_results");
    });

    it("should return 404 for non-existent simulation", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";

      await request(app)
        .get(`/api/v1/simulations/${fakeId}/status`)
        .expect("Content-Type", /json/)
        .expect(404);
    });
  });

  describe("GET /api/v1/simulations", () => {
    it("should list simulations with pagination", async () => {
      const res = await request(app)
        .get("/api/v1/simulations")
        .query({ limit: 10, offset: 0 })
        .expect("Content-Type", /json/)
        .expect(200);

      expect(res.body).toHaveProperty("simulations");
      expect(res.body).toHaveProperty("pagination");
      expect(Array.isArray(res.body.simulations)).toBe(true);
      expect(res.body.pagination).toHaveProperty("limit", 10);
      expect(res.body.pagination).toHaveProperty("offset", 0);
    });
  });

  describe("GET /api/v1/simulations/running", () => {
    it("should return currently running simulations", async () => {
      const res = await request(app)
        .get("/api/v1/simulations/running")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(res.body).toHaveProperty("running_simulations");
      expect(Array.isArray(res.body.running_simulations)).toBe(true);
    });
  });

  describe("POST /api/v1/simulate/compare", () => {
    it("should compare multiple algorithms", async () => {
      const configs = [
        {
          algorithm: LOAD_BALANCING_ALGORITHMS.ROUND_ROBIN,
          requestRate: 40,
          numServers: 3,
          serverCapacity: 15,
          duration: 5,
          test: true,
        },
        {
          algorithm: LOAD_BALANCING_ALGORITHMS.LEAST_CONNECTIONS,
          requestRate: 40,
          numServers: 3,
          serverCapacity: 15,
          duration: 5,
          test: true,
        },
      ];

      const res = await request(app)
        .post("/api/v1/simulate/compare")
        .send({ configs })
        .expect("Content-Type", /json/)
        .expect(200);

      expect(res.body).toHaveProperty("results");
      expect(Array.isArray(res.body.results)).toBe(true);
      expect(res.body.results.length).toBe(2);

      // Each result should have metrics
      res.body.results.forEach((result) => {
        if (!result.error) {
          expect(result).toHaveProperty("metrics");
        }
      });
    }, 30000);
  });

  describe("DELETE /api/v1/simulations/:id", () => {
    it("should cancel a running simulation", async () => {
      // Create a new simulation
      const createRes = await request(app).post("/api/v1/simulate").send({
        algorithm: LOAD_BALANCING_ALGORITHMS.ROUND_ROBIN,
        requestRate: 10,
        numServers: 2,
        serverCapacity: 10,
        duration: 60, // Long duration
        test: true,
      });

      const simulationId = createRes.body.simulation_id;

      // Cancel it
      const cancelRes = await request(app)
        .delete(`/api/v1/simulations/${simulationId}`)
        .expect("Content-Type", /json/)
        .expect(200);

      expect(cancelRes.body).toHaveProperty("cancelled");
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle burst mode configuration", async () => {
      const config = {
        algorithm: LOAD_BALANCING_ALGORITHMS.WEIGHTED_ROUND_ROBIN,
        requestRate: 50,
        numServers: 4,
        serverCapacity: 20,
        duration: 5,
        enableBurst: true,
        burstMultiplier: 3,
        burstDuration: 2,
        burstInterval: 10,
        test: true,
      };

      const res = await request(app)
        .post("/api/v1/simulate/sync")
        .send(config)
        .expect(200);

      expect(res.body.status).toBe("completed");
      expect(res.body.metrics).toBeDefined();
    });

    it("should handle weighted servers configuration", async () => {
      const config = {
        algorithm: LOAD_BALANCING_ALGORITHMS.WEIGHTED_ROUND_ROBIN,
        requestRate: 60,
        numServers: 3,
        serverCapacity: 25,
        duration: 5,
        serverWeights: [1, 2, 3],
        test: true,
      };

      const res = await request(app)
        .post("/api/v1/simulate/sync")
        .send(config)
        .expect(200);

      expect(res.body.status).toBe("completed");
    });

    it("should reject invalid JSON payload", async () => {
      await request(app)
        .post("/api/v1/simulate")
        .set("Content-Type", "application/json")
        .send("invalid json")
        .expect(400);
    });

    it("should handle large payload gracefully", async () => {
      const largeConfig = {
        algorithm: LOAD_BALANCING_ALGORITHMS.ROUND_ROBIN,
        requestRate: 100,
        numServers: 10,
        serverCapacity: 50,
        duration: 5,
        // Add large data to test payload limits
        extraData: "x".repeat(1000),
        test: true,
      };

      await request(app).post("/api/v1/simulate").send(largeConfig).expect(201);
    });
  });
});
