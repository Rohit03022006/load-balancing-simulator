import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ComparisonChart } from '@/components/charts/ComparisonChart'
import { MetricsOverview } from '@/components/metrics/MetricsOverview'
import { useSimulationStore } from '@/store/simulationStore'
import { simulationService } from '@/services/simulationService'
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip
} from 'recharts'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion, AnimatePresence } from 'framer-motion'
import {
    BarChart3,
    Play,
    Plus,
    Trash2,
    Copy,
    CheckCircle2,
    XCircle,
    Clock,
    Activity,
    Server,
    Trophy,
    Sliders,
    Zap,
    Target
} from 'lucide-react'
import { toast } from 'sonner'
import { formatLatency, formatThroughput, formatPercentage, cn } from '@/lib/utils'

export default function ComparisonPage() {
    const { algorithms, setAlgorithms } = useSimulationStore()
    const [selectedAlgorithms, setSelectedAlgorithms] = useState([])
    const [comparisonResults, setComparisonResults] = useState(null)
    const [isComparing, setIsComparing] = useState(false)

    const [config, setConfig] = useState({
        requestRate: 100,
        numServers: 5,
        serverCapacity: 30,
        duration: 15
    })

    useEffect(() => {
        if (!algorithms || !Array.isArray(algorithms) || algorithms.length === 0) {
            simulationService.getAlgorithms().then(res => {
              if (res && res.algorithms) {
                setAlgorithms(res.algorithms)
              } else if (Array.isArray(res)) {
                setAlgorithms(res)
              }
            }).catch(err => {
              console.error('Failed to fetch algorithms:', err)
            })
        }
    }, [algorithms, setAlgorithms])

    const ALGO_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f43f5e']

    const addAlgorithm = (algorithmId) => {
        if (selectedAlgorithms.find(a => a === algorithmId)) {
            toast.warning('Algorithm already added')
            return
        }
        setSelectedAlgorithms([...selectedAlgorithms, algorithmId])
    }

    const removeAlgorithm = (algorithmId) => {
        setSelectedAlgorithms(selectedAlgorithms.filter(a => a !== algorithmId))
    }

    const runComparison = async () => {
        if (selectedAlgorithms.length < 2) {
            toast.error('Select at least 2 algorithms to compare')
            return
        }

        setIsComparing(true)
        setComparisonResults(null)

        try {
            const configs = selectedAlgorithms.map(algo => ({
                ...config,
                algorithm: algo
            }))

            const response = await simulationService.compareAlgorithms(configs)
            setComparisonResults(response.results)
            toast.success('Comparison completed!')

        } catch (error) {
            toast.error('Failed to run comparison')
        } finally {
            setIsComparing(false)
        }
    }

    const radarData = useMemo(() => {
        if (!comparisonResults) return []

        const successfulResults = comparisonResults.filter(r => !r.error)
        if (successfulResults.length === 0) return []

        const metrics = [
            { key: 'Latency Score', label: 'Latency' },
            { key: 'Throughput %', label: 'Throughput' },
            { key: 'Success Rate', label: 'Success' },
            { key: 'Utilization', label: 'Utilization' },
            { key: 'Stability', label: 'P95 Stability' }
        ]

        return metrics.map(m => {
            const row = { subject: m.label }
            successfulResults.forEach(result => {
                const algo = algorithms.find(a => a.id === result.algorithm)
                const name = algo?.name || result.algorithm
                
                let value = 0
                if (m.key === 'Latency Score') {
                    // Normalize: 0ms = 100, 200ms+ = 0
                    value = Math.max(0, 100 - (result.metrics.avgLatency * 1000 / 2))
                } else if (m.key === 'Throughput %') {
                    value = (result.metrics.avgThroughput / config.requestRate) * 100
                } else if (m.key === 'Success Rate') {
                    value = result.metrics.successRate
                } else if (m.key === 'Utilization') {
                    value = result.metrics.serverUtilization.reduce((a, b) => a + b, 0) / result.metrics.serverUtilization.length
                } else if (m.key === 'Stability') {
                    // P95 latency score
                    value = Math.max(0, 100 - (result.metrics.p95Latency * 1000 / 4))
                }
                
                row[name] = value
            })
            return row
        })
    }, [comparisonResults, algorithms, config.requestRate])

    const activeAlgoNames = useMemo(() => {
        if (!comparisonResults) return []
        const names = comparisonResults
            .filter(r => !r.error)
            .map(r => {
                const algo = algorithms.find(a => a.id === r.algorithm)
                return algo?.name || r.algorithm
            })
        return [...new Set(names)]
    }, [comparisonResults, algorithms])

    const getWinner = (metric) => {
        if (!comparisonResults) return null

        const validResults = comparisonResults.filter(r => !r.error)
        if (validResults.length === 0) return null

        switch (metric) {
            case 'latency':
                return validResults.reduce((best, current) =>
                    current.metrics.avgLatency < best.metrics.avgLatency ? current : best
                )
            case 'throughput':
                return validResults.reduce((best, current) =>
                    current.metrics.avgThroughput > best.metrics.avgThroughput ? current : best
                )
            case 'utilization':
                const avgUtil = (r) => r.metrics.serverUtilization.reduce((a, b) => a + b, 0) / r.metrics.serverUtilization.length
                return validResults.reduce((best, current) =>
                    avgUtil(current) > avgUtil(best) ? current : best
                )
            default:
                return null
        }
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <BarChart3 className="h-8 w-8" />
                    Algorithm Comparison
                </h1>
                <p className="text-muted-foreground">
                    Compare multiple load balancing algorithms side by side
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Algorithm Selection */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Select Algorithms</CardTitle>
                        <CardDescription>
                            Choose algorithms to compare
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            {algorithms.map((algo) => (
                                <Button
                                    key={algo.id}
                                    variant="outline"
                                    className="w-full justify-between"
                                    onClick={() => addAlgorithm(algo.id)}
                                    disabled={selectedAlgorithms.includes(algo.id)}
                                >
                                    <span>{algo.name}</span>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            ))}
                        </div>

                        {selectedAlgorithms.length > 0 && (
                            <div className="space-y-2">
                                <div className="text-sm font-medium">Selected Algorithms:</div>
                                {selectedAlgorithms.map((algoId) => {
                                    const algo = algorithms.find(a => a.id === algoId)
                                    return (
                                        <div key={algoId} className="flex items-center justify-between rounded-md border p-2">
                                            <span className="text-sm">{algo?.name}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeAlgorithm(algoId)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        <Button
                            className="w-full"
                            onClick={runComparison}
                            disabled={selectedAlgorithms.length < 2 || isComparing}
                        >
                            {isComparing ? (
                                <>Running Comparison...</>
                            ) : (
                                <>
                                    <Play className="mr-2 h-4 w-4" />
                                    Run Comparison
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Test Configuration */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sliders className="h-4 w-4" />
                            Test Configuration
                        </CardTitle>
                        <CardDescription>
                            Parameters applied to all algorithms
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <Label>Request Rate (req/s)</Label>
                                    <span className="font-mono font-bold text-primary">{config.requestRate}</span>
                                </div>
                                <Slider
                                    value={[config.requestRate]}
                                    onValueChange={(val) => setConfig(prev => ({ ...prev, requestRate: Array.isArray(val) ? val[0] : val }))}
                                    max={1000}
                                    step={10}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <Label>Number of Servers</Label>
                                    <span className="font-mono font-bold text-primary">{config.numServers}</span>
                                </div>
                                <Slider
                                    value={[config.numServers]}
                                    onValueChange={(val) => setConfig(prev => ({ ...prev, numServers: Array.isArray(val) ? val[0] : val }))}
                                    min={1}
                                    max={50}
                                    step={1}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <Label>Server Capacity</Label>
                                    <span className="font-mono font-bold text-primary">{config.serverCapacity}</span>
                                </div>
                                <Slider
                                    value={[config.serverCapacity]}
                                    onValueChange={(val) => setConfig(prev => ({ ...prev, serverCapacity: Array.isArray(val) ? val[0] : val }))}
                                    max={100}
                                    step={5}
                                />
                            </div>
                        </div>

                        <div className="pt-2 border-t">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Zap className="h-3 w-3" />
                                    System Capacity
                                </div>
                                <div className="text-sm font-bold">{config.numServers * config.serverCapacity} req/s</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Winners */}
                {comparisonResults && (
                    <Card className="lg:col-span-1 border-primary/50 shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-yellow-500" />
                                Comparison Winners
                            </CardTitle>
                            <CardDescription>
                                Top performers per category
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { label: 'Latency', metric: 'latency', icon: Clock, color: 'text-orange-500' },
                                { label: 'Throughput', metric: 'throughput', icon: Activity, color: 'text-blue-500' },
                                { label: 'Utilization', metric: 'utilization', icon: Server, color: 'text-purple-500' }
                            ].map(({ label, metric, icon: Icon, color }) => {
                                const winner = getWinner(metric)
                                const algoName = winner ? algorithms.find(a => a.id === winner.algorithm)?.name : 'N/A'

                                return (
                                    <div key={metric} className="group flex flex-col gap-1 rounded-xl border bg-muted/30 p-3 transition-all hover:bg-muted/50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Icon className={cn("h-4 w-4", color)} />
                                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
                                            </div>
                                            <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-200 shadow-none dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800">
                                                Winner
                                            </Badge>
                                        </div>
                                        <div className="text-sm font-bold truncate pl-6">
                                            {algoName}
                                        </div>
                                    </div>
                                )
                            })}
                        </CardContent>
                    </Card>
                )}
            </div>
            
            <div className="h-px w-full bg-border my-8" />

            {/* Results */}
            <AnimatePresence>
                {comparisonResults && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <Tabs defaultValue="charts" className="space-y-4">
                            <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
                                <TabsTrigger value="charts">Summary Charts</TabsTrigger>
                                <TabsTrigger value="radar">Multi-Metric Radar</TabsTrigger>
                                <TabsTrigger value="table">Detailed Table</TabsTrigger>
                            </TabsList>

                            <TabsContent value="charts">
                                <ComparisonChart results={comparisonResults} algorithms={algorithms} />
                            </TabsContent>

                            <TabsContent value="radar">
                                <Card className="border-primary/20 shadow-sm">
                                  <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                      <Target className="h-5 w-5 text-primary" />
                                      Comparison Radar
                                    </CardTitle>
                                    <CardDescription>Normalized multi-dimensional analysis</CardDescription>
                                  </CardHeader>
                                  <CardContent className="h-[450px] min-h-[400px] pb-10">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                        <PolarGrid strokeOpacity={0.4} />
                                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} hide />
                                        <Tooltip 
                                          content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                              return (
                                                <div className="rounded-lg border bg-background p-3 shadow-xl ring-1 ring-black/5">
                                                  <p className="font-bold text-sm mb-2">{payload[0].payload.subject}</p>
                                                  <div className="space-y-1">
                                                    {payload.map((p, i) => {
                                                      const val = Number(p.value) || 0
                                                      return (
                                                        <div key={`${p.name}-${i}`} className="flex items-center justify-between gap-4 text-xs">
                                                          <span className="text-muted-foreground">{p.name}:</span>
                                                          <span className="font-mono font-bold" style={{ color: p.color }}>{val.toFixed(1)}%</span>
                                                        </div>
                                                      )
                                                    })}
                                                  </div>
                                                </div>
                                              )
                                            }
                                            return null
                                          }}
                                        />
                                        {activeAlgoNames.map((name, index) => (
                                          <Radar 
                                            key={`${name}-${index}`}
                                            name={name} 
                                            dataKey={name} 
                                            stroke={ALGO_COLORS[index % ALGO_COLORS.length]} 
                                            strokeWidth={2}
                                            fill={ALGO_COLORS[index % ALGO_COLORS.length]} 
                                            fillOpacity={0.3} 
                                          />
                                        ))}
                                        <Legend />
                                      </RadarChart>
                                    </ResponsiveContainer>
                                  </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="table">
                                <Card className="border-primary/20 shadow-sm">
                                    <CardContent className="pt-6">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                        <th className="text-left py-3 px-4">Algorithm</th>
                                                        <th className="text-right py-3 px-4">Avg Latency</th>
                                                        <th className="text-right py-3 px-4">P95 Latency</th>
                                                        <th className="text-right py-3 px-4">Throughput</th>
                                                        <th className="text-right py-3 px-4">Success Rate</th>
                                                        <th className="text-right py-3 px-4">Avg Utilization</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {comparisonResults.map((result, index) => {
                                                        if (result.error) {
                                                            return (
                                                                <tr key={index} className="border-b">
                                                                    <td className="py-3 px-4" colSpan={6}>
                                                                        <div className="flex items-center gap-2 text-red-500 text-sm">
                                                                            <XCircle className="h-4 w-4" />
                                                                            Error: {result.error}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        }

                                                        const algo = algorithms.find(a => a.id === result.algorithm)
                                                        const algoName = algo?.name || result.algorithm || 'Unknown'
                                                        const avgUtil = result.metrics.serverUtilization.reduce((a, b) => a + b, 0) / result.metrics.serverUtilization.length

                                                        return (
                                                            <tr key={index} className="border-b hover:bg-muted/50 transition-colors">
                                                                <td className="py-3 px-4 font-bold text-sm">{algoName}</td>
                                                                <td className="text-right py-3 px-4 font-mono text-sm">
                                                                    {formatLatency(result.metrics.avgLatency * 1000)}
                                                                </td>
                                                                <td className="text-right py-3 px-4 font-mono text-sm text-muted-foreground">
                                                                    {formatLatency(result.metrics.p95Latency * 1000)}
                                                                </td>
                                                                <td className="text-right py-3 px-4 font-mono text-sm font-semibold">
                                                                    {formatThroughput(result.metrics.avgThroughput)}
                                                                </td>
                                                                <td className="text-right py-3 px-4">
                                                                    <div className="flex items-center justify-end gap-2">
                                                                        {result.metrics.successRate > 95 ? (
                                                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                                        ) : (
                                                                            <XCircle className="h-4 w-4 text-red-500" />
                                                                        )}
                                                                        <span className="font-mono text-sm">
                                                                            {formatPercentage(result.metrics.successRate)}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="text-right py-3 px-4 font-mono text-sm">
                                                                    {formatPercentage(avgUtil)}
                                                                </td>
                                                            </tr>
                                                        )
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}