const db = require("../config/database");
const logger = require("../utils/logger");

class SimulationResult {
  constructor(data) {
    this.id = data.id;
    this.simulationId = data.simulation_id;
    this.avgLatency = Number(data.avg_latency || 0);
    this.p95Latency = Number(data.p95_latency || 0);
    this.p99Latency = Number(data.p99_latency || 0);
    this.avgThroughput = Number(data.avg_throughput || 0);
    this.peakThroughput = Number(data.peak_throughput || 0);
    this.totalRequests = Number(data.total_requests || 0);
    this.totalProcessed = Number(data.total_processed || 0);
    this.failedRequests = Number(data.failed_requests || 0);
    this.serverUtilization =
      typeof data.server_utilization === "string"
        ? JSON.parse(data.server_utilization)
        : data.server_utilization || [];
    this.avgQueueLength = Number(data.avg_queue_length || 0);
    this.timeSeriesData =
      typeof data.time_series_data === "string"
        ? JSON.parse(data.time_series_data)
        : data.time_series_data || {};
    this.additionalMetrics =
      typeof data.additional_metrics === "string"
        ? JSON.parse(data.additional_metrics)
        : data.additional_metrics || {};
    this.createdAt = data.created_at;
  }

  static async create(simulationId, metrics, timeSeriesData) {
    const query = `
            INSERT INTO simulation_results (
                simulation_id,
                avg_latency,
                p95_latency,
                p99_latency,
                avg_throughput,
                peak_throughput,
                total_requests,
                total_processed,
                failed_requests,
                server_utilization,
                avg_queue_length,
                time_series_data,
                additional_metrics
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
        `;

    try {
      const result = await db.query(query, [
        simulationId,
        metrics.avgLatency,
        metrics.p95Latency,
        metrics.p99Latency,
        metrics.avgThroughput,
        metrics.peakThroughput,
        metrics.totalRequests,
        metrics.completedRequests,
        metrics.failedRequests,
        JSON.stringify(metrics.serverUtilization),
        metrics.avgQueueLength,
        JSON.stringify(timeSeriesData || metrics.timeSeriesData),
        JSON.stringify({
          avgWaitTime: metrics.avgWaitTime,
          successRate: metrics.successRate,
          simulationDuration: metrics.simulationDuration,
        }),
      ]);

      return new SimulationResult(result.rows[0]);
    } catch (error) {
      logger.error("Error creating simulation result:", error);
      throw error;
    }
  }

  static async findBySimulationId(simulationId) {
    const query = "SELECT * FROM simulation_results WHERE simulation_id = $1";

    try {
      const result = await db.query(query, [simulationId]);
      return result.rows[0] ? new SimulationResult(result.rows[0]) : null;
    } catch (error) {
      logger.error("Error finding simulation result:", error);
      throw error;
    }
  }

  static async saveServerMetricsTimeSeries(simulationId, timeSeriesData) {
    if (
      !timeSeriesData ||
      !timeSeriesData.serverStates ||
      timeSeriesData.serverStates.length === 0
    ) {
      return; // nothing to save — not an error
    }

    try {
      await db.transaction(async (client) => {
        const insertQuery = `
                    INSERT INTO server_metrics_time_series (
                        simulation_id, timestamp, server_id, queue_length, 
                        utilization, active_connections, requests_processed, avg_response_time
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    ON CONFLICT (simulation_id, timestamp, server_id) DO NOTHING
                `;

        for (const state of timeSeriesData.serverStates) {
          for (const server of state.servers) {
            await client.query(insertQuery, [
              simulationId,
              Math.floor(state.timestamp * 1000),
              server.id,
              server.queueLength,
              server.utilization,
              server.activeConnections,
              server.totalProcessed,
              null,
            ]);
          }
        }
      });

      logger.info(
        `Saved ${timeSeriesData.serverStates.length} time series records for simulation ${simulationId}`,
      );
    } catch (error) {
      // Log but do NOT re-throw — this is a best-effort supplemental insert
      logger.error("Error saving server metrics time series:", error.message);
    }
  }

  static async deleteBySimulationId(simulationId) {
    try {
      await db.transaction(async (client) => {
        await client.query(
          "DELETE FROM server_metrics_time_series WHERE simulation_id = $1",
          [simulationId],
        );

        await client.query(
          "DELETE FROM simulation_results WHERE simulation_id = $1",
          [simulationId],
        );
      });
      return true;
    } catch (error) {
      logger.error(
        `Error deleting results for simulation ${simulationId}:`,
        error,
      );
      throw error;
    }
  }

  toJSON() {
    return {
      id: this.id,
      simulation_id: this.simulationId,
      metrics: {
        avgLatency: this.avgLatency,
        p95Latency: this.p95Latency,
        p99Latency: this.p99Latency,
        avgThroughput: this.avgThroughput,
        peakThroughput: this.peakThroughput,
        totalRequests: this.totalRequests,
        completedRequests: this.totalProcessed,
        failedRequests: this.failedRequests,
        serverUtilization: this.serverUtilization,
        avgQueueLength: this.avgQueueLength,
        avgWaitTime: this.additionalMetrics?.avgWaitTime || 0,
        successRate: this.additionalMetrics?.successRate || 0,
        simulationDuration: this.additionalMetrics?.simulationDuration || 0,
      },
      timeSeriesData: this.timeSeriesData,
      time_series_data: this.timeSeriesData,
      created_at: this.createdAt,
    };
  }
}

module.exports = SimulationResult;
