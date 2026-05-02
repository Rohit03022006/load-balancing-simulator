import { useState, useEffect } from 'react'
import { analyticsService } from '@/services/analyticsService'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  ScatterChart, Scatter, ZAxis,
  BarChart, Bar, Cell,
  LineChart, Line
} from 'recharts'
import { 
  TrendingUp, 
  Activity, 
  Server, 
  CheckCircle2, 
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  MousePointer2,
  Zap,
  Clock
} from 'lucide-react'
import { formatLatency, formatThroughput, formatPercentage, cn } from '@/lib/utils'
import { MetricsGridSkeleton, ChartSkeleton } from '@/components/ui/skeletons'
import { ErrorState } from '@/components/ui/error-state'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip'
import { toast } from 'sonner'

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState({
    overview: null,
    algorithms: [],
    trends: [],
    scatter: [],
    heatmap: [],
    distribution: []
  })

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true)
      try {
        const [overview, algorithms, trends, scatter, heatmap, distribution] = await Promise.all([
          analyticsService.getOverview(),
          analyticsService.getByAlgorithm(),
          analyticsService.getLatencyOverTime(30),
          analyticsService.getScatterData(),
          analyticsService.getHeatmapData(),
          analyticsService.getThroughputDistribution()
        ])

        setData({
          overview: overview || null,
          algorithms: algorithms?.algorithms || [],
          trends: trends?.series || [],
          scatter: scatter?.points || [],
          heatmap: heatmap?.cells || [],
          distribution: distribution?.buckets || []
        })
      } catch (err) {
        console.error('Failed to fetch analytics:', err)
        setError(err.message || 'Failed to load analytical data')
        toast.error('Could not load some analytics data')
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">System Analytics</h1>
          <p className="text-muted-foreground">Deep dive into simulation performance across all historical runs.</p>
        </div>
        <MetricsGridSkeleton cols={4} />
        <div className="grid gap-6 md:grid-cols-2">
          <ChartSkeleton height="h-80" />
          <ChartSkeleton height="h-80" />
        </div>
        <ChartSkeleton height="h-96" />
      </div>
    )
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />
  }

  const { overview, algorithms, trends, scatter, heatmap, distribution } = data

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ── Header ── */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">System Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights from {overview?.total_simulations} historical simulations.</p>
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard 
          title="Total Requests" 
          value={formatThroughput(Number(overview?.total_requests || 0)).split(' ')[0]} 
          unit="Requests"
          icon={Activity}
          description="Processed across all runs"
          color="text-blue-500"
        />
        <SummaryCard 
          title="Avg. Latency" 
          value={(Number(overview?.avg_latency || 0) * 1000).toFixed(1)} 
          unit="ms"
          icon={Clock}
          description="Global average response time"
          color="text-orange-500"
        />
        <SummaryCard 
          title="Total Processed" 
          value={formatThroughput(Number(overview?.total_processed || 0)).split(' ')[0]} 
          unit="Requests"
          icon={CheckCircle2}
          description={`${((Number(overview?.total_processed || 0) / Math.max(1, Number(overview?.total_requests || 1))) * 100).toFixed(1)}% global success rate`}
          color="text-emerald-500"
        />
        <SummaryCard 
          title="Avg. Throughput" 
          value={Number(overview?.avg_throughput || 0).toFixed(1)} 
          unit="req/s"
          icon={TrendingUp}
          description="Average system throughput"
          color="text-purple-500"
        />
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
        </TabsList>

        {/* ── Performance Tab ── */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Algorithm Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Throughput by Algorithm
                </CardTitle>
                <CardDescription>Average processed requests per second</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={algorithms} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="algorithm" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      width={120}
                      tick={{ fontSize: 12, fill: 'currentColor' }}
                      formatter={(val) => val.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}
                    />
                    <RechartsTooltip 
                      cursor={{ fill: 'currentColor', opacity: 0.1 }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-3 shadow-xl ring-1 ring-black/5">
                              <p className="font-bold text-sm mb-1">{payload[0].payload.algorithm.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}</p>
                              <div className="space-y-1">
                                <p className="text-xs flex justify-between gap-4">
                                  <span className="text-muted-foreground">Throughput:</span>
                                  <span className="font-mono font-bold text-primary">{Number(payload[0].value).toFixed(1)} req/s</span>
                                </p>
                                <p className="text-xs flex justify-between gap-4">
                                  <span className="text-muted-foreground">Latency (avg):</span>
                                  <span className="font-mono">{(Number(payload[0].payload.avg_latency) * 1000).toFixed(2)} ms</span>
                                </p>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar 
                      dataKey="avg_throughput" 
                      radius={[0, 4, 4, 0]}
                      barSize={24}
                    >
                      {algorithms.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={ALGO_COLORS[entry.algorithm] || '#8884d8'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Latency Distribution (Scatter Plot) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MousePointer2 className="h-4 w-4 text-primary" />
                  Throughput vs Latency
                </CardTitle>
                <CardDescription>Each point is a finished simulation run</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis 
                      type="number" 
                      dataKey="throughput" 
                      name="Throughput" 
                      unit=" r/s" 
                      label={{ value: 'Throughput (req/s)', position: 'insideBottom', offset: -10, fontSize: 12 }}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="latency_ms" 
                      name="Latency" 
                      unit="ms" 
                      label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft', fontSize: 12 }}
                      tick={{ fontSize: 10 }}
                    />
                    <ZAxis type="number" dataKey="num_servers" range={[40, 400]} name="Servers" />
                    <RechartsTooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="rounded-lg border bg-background p-3 shadow-xl ring-1 ring-black/5">
                              <p className="font-bold text-sm mb-2">{data.algorithm.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}</p>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Throughput</span>
                                <span className="text-[10px] font-mono font-bold text-right">{data.throughput}</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Latency</span>
                                <span className="text-[10px] font-mono font-bold text-right">{data.latency_ms} ms</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Servers</span>
                                <span className="text-[10px] font-mono font-bold text-right">{data.num_servers}</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Request Rate</span>
                                <span className="text-[10px] font-mono font-bold text-right">{data.request_rate}</span>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    {Object.keys(ALGO_COLORS).map(algo => (
                      <Scatter 
                        key={algo}
                        name={algo.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')} 
                        data={scatter.filter(p => p.algorithm === algo)} 
                        fill={ALGO_COLORS[algo]} 
                        opacity={0.6}
                      />
                    ))}
                    <Legend wrapperStyle={{ paddingTop: 20 }} />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Trends Tab ── */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Latency & Throughput History
              </CardTitle>
              <CardDescription>Daily performance trends for completed simulations</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formatTrendData(trends)}>
                  <defs>
                    <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10 }}
                    minTickGap={30}
                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  />
                  <YAxis 
                    yAxisId="left" 
                    tick={{ fontSize: 10 }} 
                    label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft', fontSize: 12 }} 
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    tick={{ fontSize: 10 }} 
                    label={{ value: 'Throughput', angle: 90, position: 'insideRight', fontSize: 12 }} 
                  />
                  <RechartsTooltip />
                  <Legend />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="avg_latency_ms" 
                    name="Avg Latency (ms)"
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorLatency)" 
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="avg_throughput" 
                    name="Avg Throughput"
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Efficiency Tab ── */}
        <TabsContent value="efficiency" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Heatmap Grid approximation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Efficiency Heatmap
                </CardTitle>
                <CardDescription>Latency (ms) across Load (Request Rate) vs Capacity (Servers)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-hidden rounded-md border">
                  <div className="grid grid-cols-[auto_1fr] p-4">
                    {/* Y-axis label */}
                    <div className="flex items-center [writing-mode:vertical-lr] rotate-180 text-[10px] text-muted-foreground mr-2">
                      NUMBER OF SERVERS
                    </div>
                    <div>
                      {/* Grid */}
                      <div className="grid grid-cols-6 gap-1">
                        {/* Empty corner */}
                        <div></div>
                        {/* X-axis headers */}
                        {[200, 500, 1000, 2000, 5000].map(rate => (
                          <div key={rate} className="text-[10px] text-center text-muted-foreground uppercase">{rate}r/s</div>
                        ))}

                        {/* Rows */}
                        {[2, 5, 10, 20, 50].map(servers => (
                          <>
                            <div key={`s-${servers}`} className="text-[10px] text-right pr-2 font-medium self-center">{servers} Srv</div>
                            {[200, 500, 1000, 2000, 5000].map(rate => {
                              const cell = heatmap.find(c => {
                                // loose match on ranges
                                const rateMatch = c.request_rate >= rate * 0.8 && c.request_rate <= rate * 1.2
                                const serverMatch = c.num_servers >= servers * 0.8 && c.num_servers <= servers * 1.2
                                return rateMatch && serverMatch
                              })
                              
                              const val = cell?.avg_latency_ms
                              const numVal = val ? Number(val) : null
                              const color = !numVal ? 'bg-muted/30' : 
                                numVal < 50 ? 'bg-emerald-500/80' :
                                numVal < 200 ? 'bg-yellow-500/80' :
                                numVal < 500 ? 'bg-orange-500/80' : 'bg-red-500/80'

                              return (
                                <TooltipProvider key={`${servers}-${rate}`}>
                                  <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                      <div className={cn(
                                        "h-10 rounded-sm flex items-center justify-center text-[10px] font-bold text-white transition-all hover:scale-105 cursor-help shadow-sm",
                                        color
                                      )}>
                                        {numVal ? numVal.toFixed(0) : ''}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <div className="text-xs space-y-1">
                                        <p className="font-bold">Cell Details</p>
                                        <p>Servers: {servers}</p>
                                        <p>Rate: {rate} req/s</p>
                                        {numVal && <p className="text-primary font-bold">Latency: {numVal.toFixed(2)} ms</p>}
                                        {!numVal && <p className="italic text-muted-foreground">No data</p>}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )
                            })}
                          </>
                        ))}
                      </div>
                      <div className="mt-4 text-[10px] text-center text-muted-foreground uppercase tracking-widest">
                        INPUT REQUEST RATE
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Throughput Frequency */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Throughput Distribution
                </CardTitle>
                <CardDescription>Frequency of achieved throughput levels</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distribution}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis 
                      dataKey="bucket_min" 
                      label={{ value: 'Throughput Bucket (req/s)', position: 'insideBottom', offset: -10, fontSize: 12 }}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis 
                      tick={{ fontSize: 10 }}
                      label={{ value: 'Frequency', angle: -90, position: 'insideLeft', fontSize: 12 }}
                    />
                    <RechartsTooltip 
                      formatter={(val) => [val, 'Simulations']}
                      labelFormatter={(label, payload) => {
                        if (payload && payload.length) {
                          return `Throughput: ${payload[0].payload.bucket_min} - ${payload[0].payload.bucket_max} req/s`
                        }
                        return label
                      }}
                    />
                    <Bar dataKey="frequency" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function SummaryCard({ title, value, unit, icon: Icon, description, color }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-4 w-4", color)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value}
          <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}

const ALGO_COLORS = {
  round_robin: '#3b82f6', // blue
  weighted_round_robin: '#8b5cf6', // purple
  least_connections: '#10b981', // emerald
}

function formatTrendData(trends) {
  // Group trends by date to simplify visualization if needed
  // Current data is already date_trunc'd but contains algorithm breakdown
  const dailyMap = {}
  
  trends.forEach(t => {
    const d = t.date
    if (!dailyMap[d]) {
      dailyMap[d] = { date: d, count: 0, lat: 0, thr: 0 }
    }
    dailyMap[d].count += t.sim_count
    dailyMap[d].lat += t.avg_latency_ms * t.sim_count
    dailyMap[d].thr += t.avg_throughput * t.sim_count
  })

  return Object.values(dailyMap).map(day => ({
    date: day.date,
    avg_latency_ms: Number((day.lat / day.count).toFixed(1)),
    avg_throughput: Number((day.thr / day.count).toFixed(1))
  }))
}
