import api from './api'

export const analyticsService = {
  getOverview: () => api.get('/analytics/overview'),
  getByAlgorithm: () => api.get('/analytics/by-algorithm'),
  getLatencyOverTime: (days = 30) => api.get(`/analytics/latency-over-time?days=${days}`),
  getScatterData: () => api.get('/analytics/scatter'),
  getHeatmapData: () => api.get('/analytics/heatmap'),
  getThroughputDistribution: () => api.get('/analytics/throughput-distribution'),
}
