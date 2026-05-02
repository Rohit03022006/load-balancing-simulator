#!/usr/bin/env node

require("dotenv").config();
const { Client } = require("pg");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const logger = console;

class DatabaseInitializer {
  constructor() {
    this.defaultConfig = {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      database: "postgres", // Connect to default postgres database first
    };

    this.targetDatabase = process.env.DB_NAME || "loadbalancer_simulator";
  }

  async checkDatabaseExists(client) {
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [this.targetDatabase],
    );
    return result.rowCount > 0;
  }

  async createDatabase() {
    const client = new Client(this.defaultConfig);

    try {
      await client.connect();
      logger.info(
        `Connected to PostgreSQL server at ${this.defaultConfig.host}:${this.defaultConfig.port}`,
      );

      const exists = await this.checkDatabaseExists(client);

      if (exists) {
        logger.info(`Database "${this.targetDatabase}" already exists`);
        const answer = await this.askQuestion(
          "Do you want to drop and recreate it? (y/N): ",
        );

        if (answer.toLowerCase() === "y") {
          await client.query(`DROP DATABASE ${this.targetDatabase}`);
          logger.info(`Dropped database "${this.targetDatabase}"`);
        } else {
          logger.info("Keeping existing database");
          return false;
        }
      }

      await client.query(`CREATE DATABASE ${this.targetDatabase}`);
      logger.info(`Created database "${this.targetDatabase}"`);
      return true;
    } catch (error) {
      logger.error("Error creating database:", error.message);
      throw error;
    } finally {
      await client.end();
    }
  }

  async initializeSchema() {
    const client = new Client({
      ...this.defaultConfig,
      database: this.targetDatabase,
    });

    try {
      await client.connect();
      logger.info(`Connected to database "${this.targetDatabase}"`);

      // Read and execute schema SQL
      const schemaPath = path.join(__dirname, "init.sql");

      if (!fs.existsSync(schemaPath)) {
        throw new Error(`Schema file not found: ${schemaPath}`);
      }

      const schema = fs.readFileSync(schemaPath, "utf8");

      await client.query(schema);
      logger.info("Database schema initialized successfully");

      // Verify tables were created
      const tables = await client.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name
            `);

      logger.info("\nCreated tables:");
      tables.rows.forEach((row) => {
        logger.info(`  - ${row.table_name}`);
      });

      return true;
    } catch (error) {
      logger.error("Error initializing schema:", error.message);
      throw error;
    } finally {
      await client.end();
    }
  }

  async testConnection() {
    const client = new Client({
      ...this.defaultConfig,
      database: this.targetDatabase,
    });

    try {
      await client.connect();
      const result = await client.query(
        "SELECT NOW() as time, version() as version",
      );
      logger.info("\nDatabase connection test successful!");
      logger.info(
        `PostgreSQL Version: ${result.rows[0].version.split(",")[0]}`,
      );
      logger.info(`Server Time: ${result.rows[0].time}`);
      return true;
    } catch (error) {
      logger.error("Connection test failed:", error.message);
      return false;
    } finally {
      await client.end();
    }
  }

  async askQuestion(question) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer);
      });
    });
  }

  async run() {
    console.log("\n═══════════════════════════════════════════════════════");
    console.log("     Load Balancing Simulator - Database Setup");
    console.log("═══════════════════════════════════════════════════════\n");

    try {
      // Step 1: Create database
      logger.info("Step 1: Creating database...");
      const created = await this.createDatabase();

      if (created) {
        // Step 2: Initialize schema
        logger.info("\nStep 2: Initializing schema...");
        await this.initializeSchema();
      }

      // Step 3: Test connection
      logger.info("\nStep 3: Testing connection...");
      const connected = await this.testConnection();

      if (connected) {
        console.log("\n✅ Database setup completed successfully!");
        console.log("\nYou can now start the application with:");
        console.log("  npm start");
        console.log("  or");
        console.log("  npm run dev\n");
      } else {
        console.log("\n❌ Database setup completed with warnings.");
        console.log("Please check your configuration and try again.\n");
        process.exit(1);
      }
    } catch (error) {
      console.error("\n❌ Database setup failed:", error.message);
      console.log("\nTroubleshooting tips:");
      console.log("1. Make sure PostgreSQL is running");
      console.log("2. Check your .env file for correct credentials");
      console.log(
        "3. Ensure PostgreSQL is accessible on the specified host/port",
      );
      console.log("4. Try connecting with: psql -U postgres\n");
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const init = new DatabaseInitializer();
  init.run().catch(console.error);
}

module.exports = DatabaseInitializer;
