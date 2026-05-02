#!/usr/bin/env node

require("dotenv").config();
const { Client } = require("pg");
const { LOAD_BALANCING_ALGORITHMS } = require("../src/config/constants");

async function seedDatabase() {
  const config = {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "loadbalancer_simulator",
  };

  const client = new Client(config);

  try {
    await client.connect();
    console.log("Connected to database, seeding sample data...\n");

    // Create sample simulation configs
    const sampleConfigs = [
      {
        algorithm: LOAD_BALANCING_ALGORITHMS.ROUND_ROBIN,
        requestRate: 50,
        numServers: 3,
        serverCapacity: 20,
        duration: 30,
        timeStep: 0.1,
        description: "Sample Round Robin simulation",
      },
      {
        algorithm: LOAD_BALANCING_ALGORITHMS.LEAST_CONNECTIONS,
        requestRate: 75,
        numServers: 4,
        serverCapacity: 25,
        duration: 45,
        timeStep: 0.1,
        enableBurst: true,
        burstMultiplier: 2.5,
        description: "Sample Least Connections with burst",
      },
      {
        algorithm: LOAD_BALANCING_ALGORITHMS.WEIGHTED_ROUND_ROBIN,
        requestRate: 100,
        numServers: 5,
        serverCapacity: 30,
        duration: 60,
        timeStep: 0.1,
        serverWeights: [1, 2, 3, 2, 1],
        description: "Sample Weighted Round Robin",
      },
    ];

    // Insert sample simulations
    for (const config of sampleConfigs) {
      const result = await client.query(
        `INSERT INTO simulations (config, status, created_at) 
                 VALUES ($1, 'completed', NOW() - INTERVAL '1 day') 
                 RETURNING id`,
        [config],
      );

      const simulationId = result.rows[0].id;

      // Add sample results
      await client.query(
        `INSERT INTO simulation_results (
                    simulation_id, avg_latency, p95_latency, p99_latency,
                    avg_throughput, peak_throughput, total_requests,
                    total_processed, server_utilization, avg_queue_length,
                    time_series_data
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          simulationId,
          0.125, // avg_latency
          0.25, // p95_latency
          0.35, // p99_latency
          48.5, // avg_throughput
          62.0, // peak_throughput
          1500, // total_requests
          1498, // total_processed
          JSON.stringify([45.2, 52.1, 48.7]), // server_utilization
          3.2, // avg_queue_length
          JSON.stringify({ sample: true }), // time_series_data
        ],
      );

      console.log(
        `Created sample simulation: ${simulationId} (${config.algorithm})`,
      );
    }

    console.log("\n✅ Sample data seeded successfully!\n");
  } catch (error) {
    console.error("Error seeding database:", error.message);
    throw error;
  } finally {
    await client.end();
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase().catch(console.error);
}

module.exports = seedDatabase;
