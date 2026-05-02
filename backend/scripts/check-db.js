#!/usr/bin/env node

require("dotenv").config();
const { Client } = require("pg");

async function checkDatabase() {
  const config = {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "loadbalancer_simulator",
  };

  console.log("\n🔍 Checking PostgreSQL connection...\n");
  console.log(`Host: ${config.host}:${config.port}`);
  console.log(`Database: ${config.database}`);
  console.log(`User: ${config.user}\n`);

  const client = new Client(config);

  try {
    await client.connect();
    console.log("Successfully connected to PostgreSQL!\n");

    // Check tables
    const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);

    if (tables.rows.length > 0) {
      console.log("📊 Existing tables:");
      tables.rows.forEach((row) => {
        console.log(`  - ${row.table_name}`);
      });

      // Count records
      const counts = await client.query(`
                SELECT 
                    (SELECT COUNT(*) FROM simulations) as simulations,
                    (SELECT COUNT(*) FROM simulation_results) as results,
                    (SELECT COUNT(*) FROM server_metrics_time_series) as metrics
            `);

      console.log("\n📈 Record counts:");
      console.log(`  - Simulations: ${counts.rows[0].simulations}`);
      console.log(`  - Results: ${counts.rows[0].results}`);
      console.log(`  - Metrics: ${counts.rows[0].metrics}`);
    } else {
      console.log(
        "⚠️  No tables found. Run `npm run init-db` to create tables.",
      );
    }

    console.log("\n✨ Database check complete!\n");
  } catch (error) {
    console.error("\n❌ Connection failed:", error.message);
    console.log("\n💡 Troubleshooting:");
    console.log("1. Make sure PostgreSQL is running");
    console.log("2. Check your .env file configuration");
    console.log("3. Run `npm run init-db` to create the database");
    console.log("4. Verify PostgreSQL is installed: psql --version\n");
    process.exit(1);
  } finally {
    await client.end();
  }
}

checkDatabase();
