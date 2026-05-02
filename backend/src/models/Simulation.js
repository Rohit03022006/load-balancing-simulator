const db = require("../config/database");
const { SIMULATION_STATUS } = require("../config/constants");
const logger = require("../utils/logger");

class Simulation {
  constructor(data) {
    this.id = data.id;
    this.config = data.config;
    this.status = data.status || SIMULATION_STATUS.PENDING;
    this.createdAt = data.created_at;
    this.startedAt = data.started_at;
    this.completedAt = data.completed_at;
    this.errorMessage = data.error_message;
  }

  static async create(config) {
    const query = `
            INSERT INTO simulations (config, status)
            VALUES ($1, $2)
            RETURNING *
        `;

    try {
      const result = await db.query(query, [config, SIMULATION_STATUS.PENDING]);
      return new Simulation(result.rows[0]);
    } catch (error) {
      logger.error("Error creating simulation:", error);
      throw error;
    }
  }

  static async findById(id) {
    const query = "SELECT * FROM simulations WHERE id = $1";

    try {
      const result = await db.query(query, [id]);
      return result.rows[0] ? new Simulation(result.rows[0]) : null;
    } catch (error) {
      logger.error("Error finding simulation:", error);
      throw error;
    }
  }

  static async findAll(limit = 100, offset = 0) {
    const query = `
            SELECT * FROM simulations 
            ORDER BY created_at DESC 
            LIMIT $1 OFFSET $2
        `;

    try {
      const result = await db.query(query, [limit, offset]);
      return result.rows.map((row) => new Simulation(row));
    } catch (error) {
      logger.error("Error finding all simulations:", error);
      throw error;
    }
  }

  async updateStatus(status, errorMessage = null) {
    const query = `
            UPDATE simulations 
            SET status = $1::varchar, 
                error_message = $2,
                started_at = CASE WHEN $1::varchar = 'running' THEN CURRENT_TIMESTAMP ELSE started_at END,
                completed_at = CASE WHEN $1::varchar IN ('completed', 'failed') THEN CURRENT_TIMESTAMP ELSE completed_at END
            WHERE id = $3
            RETURNING *
        `;

    try {
      const result = await db.query(query, [status, errorMessage, this.id]);
      Object.assign(this, result.rows[0]);
      return this;
    } catch (error) {
      logger.error("Error updating simulation status:", error);
      throw error;
    }
  }

  static async delete(id) {
    const query = "DELETE FROM simulations WHERE id = $1";

    try {
      const result = await db.query(query, [id]);
      return result.rowCount > 0;
    } catch (error) {
      logger.error("Error deleting simulation:", error);
      throw error;
    }
  }

  toJSON() {
    return {
      id: this.id,
      config: this.config,
      status: this.status,
      createdAt: this.createdAt,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      errorMessage: this.errorMessage,
    };
  }
}

module.exports = Simulation;
