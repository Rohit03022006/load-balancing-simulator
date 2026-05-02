import { formatLatency, formatThroughput, formatPercentage } from '@/lib/utils'

export const exportService = {
  exportAsJSON(data, filename) {
    const jsonStr = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    this.downloadFile(blob, `${filename}.json`)
  },
  
  exportAsCSV(data, filename) {
    if (!data.result) return
    
    const metrics = data.result.metrics
    const config = data.simulation.config
    
    // Create CSV content
    const headers = [
      'Metric',
      'Value',
      'Unit'
    ].join(',')
    
    const rows = [
      ['Algorithm', config.algorithm, ''],
      ['Request Rate', config.requestRate, 'req/s'],
      ['Number of Servers', config.numServers, ''],
      ['Server Capacity', config.serverCapacity, 'req/s'],
      ['Duration', config.duration, 's'],
      ['Average Latency', formatLatency(metrics.avgLatency * 1000), 'ms'],
      ['P95 Latency', formatLatency(metrics.p95Latency * 1000), 'ms'],
      ['P99 Latency', formatLatency(metrics.p99Latency * 1000), 'ms'],
      ['Average Throughput', formatThroughput(metrics.avgThroughput), 'req/s'],
      ['Peak Throughput', formatThroughput(metrics.peakThroughput), 'req/s'],
      ['Total Requests', metrics.totalRequests, ''],
      ['Completed Requests', metrics.completedRequests, ''],
      ['Failed Requests', metrics.failedRequests, ''],
      ['Success Rate', formatPercentage(metrics.successRate), ''],
      ['Average Queue Length', (metrics.avgQueueLength || 0).toFixed(2), ''],
      ['Simulation Duration', (metrics.simulationDuration || 0).toFixed(2), 's']
    ]
    
    const csvContent = [
      headers,
      ...rows.map(row => row.join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    this.downloadFile(blob, `${filename}.csv`)
  },
  
  exportAsPDF(data, filename) {
    // This would require a PDF library like jsPDF
    // For now, we'll trigger a print dialog with formatted content
    const printWindow = window.open('', '_blank')
    
    const metrics = data.result.metrics
    const config = data.simulation.config
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Simulation Results - ${filename}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 2rem; }
            h1 { color: #1a1a1a; }
            .metric-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
            .metric-card { border: 1px solid #e5e5e5; padding: 1rem; border-radius: 0.5rem; }
            .metric-label { color: #666; font-size: 0.875rem; }
            .metric-value { font-size: 1.5rem; font-weight: bold; margin-top: 0.25rem; }
            table { width: 100%; border-collapse: collapse; margin-top: 2rem; }
            th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e5e5e5; }
          </style>
        </head>
        <body>
          <h1>Load Balancing Simulation Results</h1>
          <p>Simulation ID: ${data.simulation.id}</p>
          <p>Created: ${new Date(data.simulation.createdAt).toLocaleString()}</p>
          
          <h2>Configuration</h2>
          <table>
            <tr><th>Parameter</th><th>Value</th></tr>
            <tr><td>Algorithm</td><td>${config.algorithm}</td></tr>
            <tr><td>Request Rate</td><td>${config.requestRate} req/s</td></tr>
            <tr><td>Number of Servers</td><td>${config.numServers}</td></tr>
            <tr><td>Server Capacity</td><td>${config.serverCapacity} req/s</td></tr>
            <tr><td>Duration</td><td>${config.duration}s</td></tr>
          </table>
          
          <h2>Performance Metrics</h2>
          <div class="metric-grid">
            <div class="metric-card">
              <div class="metric-label">Average Latency</div>
              <div class="metric-value">${formatLatency(metrics.avgLatency * 1000)}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">P95 Latency</div>
              <div class="metric-value">${formatLatency(metrics.p95Latency * 1000)}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Average Throughput</div>
              <div class="metric-value">${formatThroughput(metrics.avgThroughput)}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Success Rate</div>
              <div class="metric-value">${formatPercentage(metrics.successRate)}</div>
            </div>
          </div>
          
          <h2>Request Statistics</h2>
          <table>
            <tr><th>Metric</th><th>Value</th></tr>
            <tr><td>Total Requests</td><td>${metrics.totalRequests}</td></tr>
            <tr><td>Completed Requests</td><td>${metrics.completedRequests}</td></tr>
            <tr><td>Failed Requests</td><td>${metrics.failedRequests}</td></tr>
            <tr><td>Average Queue Length</td><td>${(metrics.avgQueueLength || 0).toFixed(2)}</td></tr>
          </table>
        </body>
      </html>
    `)
    
    printWindow.document.close()
    printWindow.print()
  },
  
  downloadFile(blob, filename) {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }
}