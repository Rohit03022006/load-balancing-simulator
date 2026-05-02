import { useMemo } from 'react'
import { metricsService } from '@/services/metricsService'

export const useChartData = (data, type, options = {}) => {
  const chartData = useMemo(() => {
    if (!data) return []
    
    const { smooth = true, aggregateInterval = 1, showAnomalies = false } = options
    
    let processedData = data
    
    if (aggregateInterval > 1) {
      processedData = metricsService.aggregateTimeSeriesData(data, aggregateInterval)
    }
    
    if (smooth && processedData.length > 10) {
      const values = processedData.map(d => d.value)
      const smoothed = metricsService.calculateMovingAverage(values, 5)
      processedData = processedData.map((d, i) => ({
        ...d,
        value: smoothed[i]
      }))
    }
    
    if (showAnomalies && processedData.length > 0) {
      const values = processedData.map(d => d.value)
      const anomalies = metricsService.detectAnomalies(values)
      processedData = processedData.map((d, i) => ({
        ...d,
        isAnomaly: anomalies[i]
      }))
    }
    
    return processedData
  }, [data, options])
  
  const trend = useMemo(() => {
    if (chartData.length === 0) return 'stable'
    const values = chartData.map(d => d.value)
    return metricsService.calculateTrend(values)
  }, [chartData])
  
  return {
    chartData,
    trend,
    isEmpty: chartData.length === 0
  }
}