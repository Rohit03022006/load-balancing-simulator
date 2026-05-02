import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Clock, 
  Activity, 
  Server, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Timer,
  Gauge,
  AlertTriangle
} from 'lucide-react'
import { formatLatency, formatThroughput, formatPercentage, formatDuration } from '@/lib/utils'

const MetricCard = ({ title, value, subtitle, icon: Icon, trend, color = 'default' }) => {
  const colors = {
    default: 'text-foreground',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    info: 'text-blue-600'
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${colors[color]}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${colors[color]}`}>{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
        {trend && (
          <div className="mt-2 flex items-center text-xs">
            <TrendingUp className="mr-1 h-3 w-3" />
            <span className="text-muted-foreground">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export const MetricsOverview = ({ metrics, status }) => {
  if (!metrics) return null
  
  const totalRequests = Number(metrics.totalRequests || 0)
  const completedRequests = Number(metrics.completedRequests || 0)
  const failedRequests = Number(metrics.failedRequests || 0)

  // A simulation can fail at the process level (crash/cancel) while all
  // individual requests it *did* process appear successful. In that case
  // the computed rate is misleading — flag it instead of showing 100%.
  const simulationFailed = status === 'failed' || status === 'cancelled'
  const successRate = totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0
  const processingEfficiency = totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0

  // Determine success rate card colour:
  // - simulation failed → always warning (even if rate says 100%)
  // - rate < 95%         → warning
  // - rate >= 95%        → success
  const successRateColor = simulationFailed ? 'warning' : successRate > 95 ? 'success' : 'warning'
  const successRateValue = simulationFailed
    ? `${formatPercentage(successRate)} ⚠`
    : formatPercentage(successRate)
  
  return (
    <div className="space-y-6">
      {/* Failed simulation banner */}
      {simulationFailed && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This simulation <strong>{status}</strong> before completing normally.
            Metrics below reflect only the requests processed before the failure
            and may not represent the full intended run.
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Average Latency"
          value={formatLatency(metrics.avgLatency * 1000)}
          subtitle={`P95: ${formatLatency(metrics.p95Latency * 1000)}`}
          icon={Clock}
          color={metrics.avgLatency > 0.5 ? 'warning' : 'success'}
        />
        
        <MetricCard
          title="Throughput"
          value={formatThroughput(metrics.avgThroughput)}
          subtitle={`Peak: ${formatThroughput(metrics.peakThroughput)}`}
          icon={Activity}
          color="info"
        />
        
        <MetricCard
          title="Success Rate"
          value={successRateValue}
          subtitle={
            simulationFailed
              ? `Partial run — simulation ${status}`
              : `${completedRequests.toLocaleString()} / ${totalRequests.toLocaleString()} requests`
          }
          icon={simulationFailed ? AlertTriangle : CheckCircle}
          color={successRateColor}
        />
        
        <MetricCard
          title="Avg Queue Length"
          value={(Number(metrics.avgQueueLength) || 0).toFixed(1)}
          subtitle={`${failedRequests} failed requests`}
          icon={Server}
          color={metrics.avgQueueLength > 10 ? 'warning' : 'default'}
        />
      </div>
      
      {/* Detailed Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Processing Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Processing Efficiency</span>
                <span className="font-mono">{(processingEfficiency || 0).toFixed(1)}%</span>
              </div>
              <Progress value={processingEfficiency || 0} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <div className="text-2xl font-bold">
                  {formatDuration(metrics.simulationDuration)}
                </div>
                <div className="text-xs text-muted-foreground">Total Duration</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {formatLatency(metrics.avgWaitTime * 1000)}
                </div>
                <div className="text-xs text-muted-foreground">Avg Wait Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Request Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Completed</span>
                </div>
                <span className="font-mono font-medium">
                  {completedRequests.toLocaleString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Failed</span>
                </div>
                <span className="font-mono font-medium">
                  {failedRequests.toLocaleString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">In Queue</span>
                </div>
                <span className="font-mono font-medium">
                  {(totalRequests - completedRequests - failedRequests).toLocaleString()}
                </span>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex items-center justify-between font-medium">
                  <span>Total Requests</span>
                  <span className="font-mono">{totalRequests.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Percentile Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Latency Percentile Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: 'P50 (Median)', value: metrics.avgLatency },
              { label: 'P95', value: metrics.p95Latency },
              { label: 'P99', value: metrics.p99Latency }
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{item.label}</span>
                  <span className="font-mono">{formatLatency(item.value * 1000)}</span>
                </div>
                <Progress 
                  value={metrics.p99Latency > 0 ? (item.value / metrics.p99Latency) * 100 : 0} 
                  className="h-1.5"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}