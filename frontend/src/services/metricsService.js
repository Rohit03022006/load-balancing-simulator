export const metricsService = {
  calculateMovingAverage(data, windowSize = 5) {
    const result = []
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - windowSize + 1)
      const window = data.slice(start, i + 1)
      const avg = window.reduce((sum, val) => sum + val, 0) / window.length
      result.push(avg)
    }
    return result
  },
  
  detectAnomalies(data, threshold = 2) {
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length
    const stdDev = Math.sqrt(
      data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
    )
    
    return data.map(val => Math.abs(val - mean) > threshold * stdDev)
  },
  
  calculateTrend(data) {
    if (data.length < 2) return 'stable'
    
    const x = Array.from({ length: data.length }, (_, i) => i)
    const y = data
    
    const n = data.length
    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0)
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    
    if (slope > 0.01) return 'increasing'
    if (slope < -0.01) return 'decreasing'
    return 'stable'
  },
  
  aggregateTimeSeriesData(timeSeriesData, interval = 1) {
    if (!timeSeriesData || timeSeriesData.length === 0) return []
    
    const aggregated = []
    let currentInterval = Math.floor(timeSeriesData[0].timestamp / interval)
    let intervalData = []
    
    for (const point of timeSeriesData) {
      const pointInterval = Math.floor(point.timestamp / interval)
      
      if (pointInterval !== currentInterval) {
        if (intervalData.length > 0) {
          const avg = intervalData.reduce((sum, d) => sum + d.value, 0) / intervalData.length
          aggregated.push({
            timestamp: currentInterval * interval,
            value: avg
          })
        }
        currentInterval = pointInterval
        intervalData = [point]
      } else {
        intervalData.push(point)
      }
    }
    
    if (intervalData.length > 0) {
      const avg = intervalData.reduce((sum, d) => sum + d.value, 0) / intervalData.length
      aggregated.push({
        timestamp: currentInterval * interval,
        value: avg
      })
    }
    
    return aggregated
  }
}