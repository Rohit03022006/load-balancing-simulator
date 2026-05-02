const { Pool } = require("pg");
const logger = require("../utils/logger");

class Database {
  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      max: parseInt(process.env.DB_POOL_MAX),
      min: parseInt(process.env.DB_POOL_MIN),
      idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT),
      connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT),
    });

    this.pool.on("error", (err) => {
      logger.error("Unexpected database error:", err);
    });

    this.pool.on("connect", () => {
      logger.debug("Database connection established");
    });
  }

  async query(text, params) {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      logger.debug("Executed query", { text, duration, rows: result.rowCount });
      return result;
    } catch (error) {
      logger.error("Query error:", { text, error: error.message });
      throw error;
    }
  }

  async getClient() {
    const client = await this.pool.connect();
    const query = client.query;
    const release = client.release;

    // Set a timeout of 5 seconds
    const timeout = setTimeout(() => {
      logger.error("A client has been checked out for more than 5 seconds");
    }, 5000);

    // Monkey patch the query method to track last query
    client.query = (...args) => {
      client.lastQuery = args;
      return query.apply(client, args);
    };

    client.release = () => {
      clearTimeout(timeout);
      client.query = query;
      client.release = release;
      return release.apply(client);
    };

    return client;
  }

  async transaction(callback) {
    const client = await this.getClient();
    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async healthCheck() {
    try {
      await this.pool.query("SELECT 1");
      return true;
    } catch (error) {
      logger.error("Database health check failed:", error);
      return false;
    }
  }

  async close() {
    await this.pool.end();
    logger.info("Database pool closed");
  }
}

module.exports = new Database();
