# Load Balancing Simulator - Backend

This is the Node.js/Express-based simulation engine and API for the Load Balancing Simulator.

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in this directory:
```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=loadbalancer_simulator
DB_USER=postgres
DB_PASSWORD=postgres
```

### 3. Database Migration
Ensure PostgreSQL is running and you have created the database specified in `.env`. The application will attempt to initialize tables on start if they don't exist.

### 4. Run Development Server
```bash
npm run dev
```

## 🏗 System Modules

- **`src/simulation-engine/`**: The core discrete-event simulation logic.
- **`src/algorithms/`**: Implementations of Round Robin, Weighted Round Robin, etc.
- **`src/controllers/`**: API request handlers for simulations and analytics.
- **`src/models/`**: PostgreSQL schema definitions.

---
For full project documentation, please refer to the [Root README](../README.md).
