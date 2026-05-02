import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { MetricsOverview } from '@/components/metrics/MetricsOverview'
import { LatencyChart } from '@/components/charts/LatencyChart'
import { ThroughputChart } from '@/components/charts/ThroughputChart'
import { ServerLoadChart } from '@/components/charts/ServerLoadChart'
import { QueueLengthChart } from '@/components/charts/QueueLengthChart'
import { PercentileChart } from '@/components/charts/PercentileChart'
import { ServerUtilizationGrid } from '@/components/metrics/ServerUtilizationGrid'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ResultsPageSkeleton } from '@/components/ui/skeletons'
import { ErrorState } from '@/components/ui/error-state'
import { Badge } from '@/components/ui/badge'
import { simulationService } from '@/services/simulationService'
import { exportService } from '@/services/exportService'
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  RotateCcw,
  Clock,
  Server,
  Activity,
  AlertCircle
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

export default function ResultsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(null)
  
  useEffect(() => {
    loadResults()
  }, [id])
  
  const loadResults = async () => {
    try {
      setLoading(true)
      const data = await simulationService.getSimulation(id)
      setResults(data)
    } catch (error) {
      setError(error.message)
      toast.error('Failed to load results')
    } finally {
      setLoading(false)
    }
  }
  
  const handleExport = (format) => {
    if (!results) return
    
    try {
      switch (format) {
        case 'json':
          exportService.exportAsJSON(results, `simulation-${id}`)
          break
        case 'csv':
          exportService.exportAsCSV(results, `simulation-${id}`)
          break
        case 'pdf':
          exportService.exportAsPDF(results, `simulation-${id}`)
          break
      }
      toast.success(`Exported as ${format.toUpperCase()}`)
    } catch (error) {
      toast.error('Failed to export results')
    }
  }
  
  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href)
    toast.success('Link copied to clipboard!')
  }
  
  const handleRerun = () => {
    navigate('/simulate', { 
      state: { config: results?.simulation?.config }
    })
  }
  
  if (loading) {
    return <ResultsPageSkeleton />
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <ErrorState
          title="Failed to load results"
          message={error}
          onRetry={loadResults}
        />
      </div>
    )
  }

  if (!results) {
    return (
      <div className="container mx-auto p-6">
        <ErrorState
          title="Simulation not found"
          message="This simulation could not be found. It may have been deleted."
          onRetry={() => navigate('/history')}
        />
      </div>
    )
  }
  
  const { simulation, result } = results
  const config = simulation.config
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Simulation Results
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant="outline" className="font-mono">
                ID: {id}
              </Badge>
              <Badge 
                variant={
                  simulation.status === 'completed' ? 'success' :
                  simulation.status === 'failed' ? 'destructive' :
                  simulation.status === 'cancelled' ? 'outline' :
                  'secondary'
                }
              >
                {simulation.status}
              </Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(simulation.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" onClick={() => handleExport('json')}>
            <Download className="mr-2 h-4 w-4" />
            JSON
          </Button>
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button onClick={handleRerun}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Rerun
          </Button>
        </div>
      </div>
      
      {/* Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Simulation Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Algorithm</div>
              <div className="font-medium">{config.algorithm}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Request Rate</div>
              <div className="font-medium">{config.requestRate} req/s</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Servers</div>
              <div className="font-medium">{config.numServers}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Capacity/Server</div>
              <div className="font-medium">{config.serverCapacity} req/s</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Duration</div>
              <div className="font-medium">{config.duration}s</div>
            </div>
            {config.enableBurst && (
              <div>
                <div className="text-sm text-muted-foreground">Burst Mode</div>
                <div className="font-medium">{config.burstMultiplier}x</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Results */}
      {result ? (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="latency">Latency Analysis</TabsTrigger>
            <TabsTrigger value="servers">Server Metrics</TabsTrigger>
            <TabsTrigger value="raw">Raw Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <MetricsOverview metrics={result.metrics} status={simulation.status} />
            
            <div className="grid gap-6 lg:grid-cols-2">
              <LatencyChart data={result} metrics={result.metrics} />
              <ThroughputChart data={result} metrics={result.metrics} />
            </div>
            
            <div className="grid gap-6 lg:grid-cols-2">
              <ServerLoadChart data={result} metrics={result.metrics} />
              <QueueLengthChart data={result} metrics={result.metrics} />
            </div>
          </TabsContent>
          
          <TabsContent value="latency" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <LatencyChart data={result} metrics={result.metrics} />
              <PercentileChart metrics={result.metrics} />
            </div>
          </TabsContent>
          
          <TabsContent value="servers" className="space-y-6">
            <ServerLoadChart data={result} metrics={result.metrics} />
            <ServerUtilizationGrid metrics={result.metrics} />
          </TabsContent>
          
          <TabsContent value="raw">
            <Card>
              <CardHeader>
                <CardTitle>Raw Metrics Data</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96">
                  {JSON.stringify(result.metrics, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Alert>
          <Activity className="h-4 w-4" />
          <AlertDescription>
            Results are still being processed or not available.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}