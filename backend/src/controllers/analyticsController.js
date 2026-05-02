const db = require("../config/database");
const logger = require("../utils/logger");

class AnalyticsController {
  async getOverview(req, res, next) {
    try {
      const result = await db.query(`
                SELECT
                    COUNT(*)::int                                         AS total_simulations,
                    COUNT(*) FILTER (WHERE s.status = 'completed')::int  AS completed,
                    COUNT(*) FILTER (WHERE s.status = 'failed')::int     AS failed,
                    COALESCE(AVG(r.avg_latency), 0)                      AS avg_latency,
                    COALESCE(AVG(r.avg_throughput), 0)                   AS avg_throughput,
                    COALESCE(SUM(r.total_requests), 0)::bigint           AS total_requests,
                    COALESCE(SUM(r.total_processed), 0)::bigint          AS total_processed,
                    COALESCE(AVG(r.avg_queue_length), 0)                 AS avg_queue_length
                FROM simulations s
                LEFT JOIN simulation_results r ON r.simulation_id = s.id
            `);

      res.json(result.rows[0]);
    } catch (err) {
      logger.error("Analytics overview error:", err);
      next(err);
    }
  }

  async getByAlgorithm(req, res, next) {
    try {
      const result = await db.query(`
                SELECT
                    s.config->>'algorithm'                      AS algorithm,
                    COUNT(*)::int                               AS count,
                    ROUND(AVG(r.avg_latency)::numeric, 4)      AS avg_latency,
                    ROUND(AVG(r.p95_latency)::numeric, 4)      AS p95_latency,
                    ROUND(AVG(r.p99_latency)::numeric, 4)      AS p99_latency,
                    ROUND(AVG(r.avg_throughput)::numeric, 2)   AS avg_throughput,
                    ROUND(AVG(r.peak_throughput)::numeric, 2)  AS peak_throughput,
                    ROUND(AVG(r.avg_queue_length)::numeric, 2) AS avg_queue_length,
                    SUM(r.total_requests)::bigint               AS total_requests,
                    SUM(r.total_processed)::bigint              AS total_processed
                FROM simulations s
                JOIN simulation_results r ON r.simulation_id = s.id
                WHERE s.status = 'completed'
                GROUP BY s.config->>'algorithm'
                ORDER BY avg_throughput DESC
            `);

      res.json({ algorithms: result.rows });
    } catch (err) {
      logger.error("Analytics by-algorithm error:", err);
      next(err);
    }
  }

  async getLatencyOverTime(req, res, next) {
    try {
      const days = Math.min(parseInt(req.query.days) || 30, 90);
      const result = await db.query(`
                SELECT
                    DATE_TRUNC('day', s.created_at)::date         AS date,
                    s.config->>'algorithm'                         AS algorithm,
                    ROUND(AVG(r.avg_latency * 1000)::numeric, 1)  AS avg_latency_ms,
                    ROUND(AVG(r.p95_latency * 1000)::numeric, 1)  AS p95_latency_ms,
                    ROUND(AVG(r.avg_throughput)::numeric, 1)       AS avg_throughput,
                    COUNT(*)::int                                   AS sim_count
                FROM simulations s
                JOIN simulation_results r ON r.simulation_id = s.id
                WHERE s.status = 'completed'
                  AND s.created_at >= NOW() - INTERVAL '${days} days'
                GROUP BY 1, 2
                ORDER BY 1 ASC, 2 ASC
            `);

      res.json({ series: result.rows });
    } catch (err) {
      logger.error("Analytics latency-over-time error:", err);
      next(err);
    }
  }

  async getScatterData(req, res, next) {
    try {
      const result = await db.query(`
                SELECT
                    s.id,
                    s.config->>'algorithm'                           AS algorithm,
                    (s.config->>'numServers')::int                   AS num_servers,
                    (s.config->>'requestRate')::int                  AS request_rate,
                    ROUND((r.avg_latency * 1000)::numeric, 1)       AS latency_ms,
                    ROUND(r.avg_throughput::numeric, 1)              AS throughput,
                    ROUND(r.avg_queue_length::numeric, 2)            AS queue_length,
                    ROUND(
                        (r.total_processed::float / NULLIF(r.total_requests,0) * 100)::numeric
                    , 1)                                             AS success_rate
                FROM simulations s
                JOIN simulation_results r ON r.simulation_id = s.id
                WHERE s.status = 'completed'
                ORDER BY s.created_at DESC
                LIMIT 200
            `);

      res.json({ points: result.rows });
    } catch (err) {
      logger.error("Analytics scatter error:", err);
      next(err);
    }
  }

  async getHeatmapData(req, res, next) {
    try {
      const result = await db.query(`
                SELECT
                    (s.config->>'numServers')::int                   AS num_servers,
                    (s.config->>'requestRate')::int                  AS request_rate,
                    ROUND((AVG(r.avg_latency) * 1000)::numeric, 1)  AS avg_latency_ms,
                    ROUND(AVG(r.avg_throughput)::numeric, 1)         AS avg_throughput,
                    COUNT(*)::int                                     AS count
                FROM simulations s
                JOIN simulation_results r ON r.simulation_id = s.id
                WHERE s.status = 'completed'
                GROUP BY 1, 2
                ORDER BY 1 ASC, 2 ASC
            `);

      res.json({ cells: result.rows });
    } catch (err) {
      logger.error("Analytics heatmap error:", err);
      next(err);
    }
  }

  async getThroughputDistribution(req, res, next) {
    try {
      const result = await db.query(`
                SELECT
                    WIDTH_BUCKET(r.avg_throughput, 0,
                        (SELECT MAX(avg_throughput) + 1 FROM simulation_results), 12) AS bucket,
                    MIN(r.avg_throughput)::int  AS bucket_min,
                    MAX(r.avg_throughput)::int  AS bucket_max,
                    COUNT(*)::int               AS frequency
                FROM simulations s
                JOIN simulation_results r ON r.simulation_id = s.id
                WHERE s.status = 'completed'
                GROUP BY 1
                ORDER BY 1
            `);

      res.json({ buckets: result.rows });
    } catch (err) {
      logger.error("Analytics throughput-distribution error:", err);
      next(err);
    }
  }
}

module.exports = new AnalyticsController();
