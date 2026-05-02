# Load Balancing Simulator - Frontend

This is the React-based frontend for the Load Balancing Simulator.

##  Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in this directory:
```env
VITE_API_URL=http://localhost:3000/api/v1
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Production Build
```bash
npm run build
```

## 🏗 Key Components

- **`src/pages/SimulationPage.jsx`**: The main sandbox environment.
- **`src/pages/ComparePage.jsx`**: Side-by-side algorithm comparison tool.
- **`src/pages/AnalyticsPage.jsx`**: Global system performance dashboards.
- **`src/components/visualizer/`**: Recharts-based metric components.
- **`src/store/simulationStore.js`**: Zustand store for global application state.

---
For full project documentation, please refer to the [Root README](../README.md).
