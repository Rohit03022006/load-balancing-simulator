/**
 * Centralised, environment-based configuration.
 * Import this instead of accessing import.meta.env directly.
 */

export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_URL || '/api/v1',
    wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:3000',
    timeout: 60_000,
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Load Balancing Simulator',
    version: import.meta.env.VITE_APP_VERSION || '2.0.0',
  },
  polling: {
    interval: Number(import.meta.env.VITE_POLLING_INTERVAL) || 2000,
  },
  features: {
    enableWebSockets: import.meta.env.VITE_ENABLE_WEBSOCKETS === 'true',
    enableExport: import.meta.env.VITE_ENABLE_EXPORT !== 'false',
    maxHistoryItems: Number(import.meta.env.VITE_MAX_HISTORY_ITEMS) || 100,
  },
  chart: {
    theme: import.meta.env.VITE_CHART_THEME || 'light',
  },
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
}
