export const LOAD_BALANCING_ALGORITHMS = {
  ROUND_ROBIN: 'round_robin',
  WEIGHTED_ROUND_ROBIN: 'weighted_round_robin',
  LEAST_CONNECTIONS: 'least_connections'
}

export const SIMULATION_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed'
}

export const CHART_COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  pink: '#ec4899',
  cyan: '#06b6d4',
  orange: '#f97316',
  indigo: '#6366f1',
  teal: '#14b8a6'
}

export const DEFAULT_CONFIG = {
  algorithm: LOAD_BALANCING_ALGORITHMS.ROUND_ROBIN,
  requestRate: 50,
  numServers: 3,
  serverCapacity: 20,
  duration: 30,
  timeStep: 0.1,
  enableBurst: false,
  burstMultiplier: 3,
  burstDuration: 5,
  burstInterval: 30
}

export const VALIDATION_RANGES = {
  requestRate: { min: 1, max: 10000, step: 1 },
  numServers: { min: 1, max: 100, step: 1 },
  serverCapacity: { min: 1, max: 1000, step: 1 },
  duration: { min: 1, max: 300, step: 1 },
  timeStep: { min: 0.01, max: 1.0, step: 0.01 },
  burstMultiplier: { min: 1.5, max: 10, step: 0.5 },
  burstDuration: { min: 1, max: 30, step: 1 },
  burstInterval: { min: 10, max: 120, step: 5 }
}