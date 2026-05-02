import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SimulationControls } from '@/components/dashboard/SimulationControls'
import { AlgorithmSelector } from '@/components/dashboard/AlgorithmSelector'
import { ServerConfig } from '@/components/dashboard/ServerConfig'
import { TrafficConfig } from '@/components/dashboard/TrafficConfig'
import { LatencyChart } from '@/components/charts/LatencyChart'
import { ThroughputChart } from '@/components/charts/ThroughputChart'
import { ServerLoadChart } from '@/components/charts/ServerLoadChart'
import { QueueLengthChart } from '@/components/charts/QueueLengthChart'
import { MetricsOverview } from '@/components/metrics/MetricsOverview'
import { ConfigPanelSkeleton } from '@/components/ui/skeletons'
import { ErrorState, FieldError } from '@/components/ui/error-state'
import { useSimulation } from '@/hooks/useSimulation'
import { useFormValidation, rules } from '@/hooks/useFormValidation'
import {
  FiPlay,
  FiSquare,
  FiRefreshCw,
  FiDownload,
  FiShare2,
  FiAlertCircle
} from 'react-icons/fi'

const DEFAULT_CONFIG = {
  algorithm: 'round_robin',
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

// Validation rules for the simulation config form
const VALIDATION_RULES = {
  requestRate: rules.range(1, 10000, 'Request rate'),
  numServers: rules.range(1, 50, 'Number of servers'),
  serverCapacity: rules.range(1, 1000, 'Server capacity'),
  duration: rules.range(5, 300, 'Duration'),
  burstMultiplier: (v, values) =>
    values.enableBurst && Number(v) < 1.1
      ? 'Burst multiplier must be at least 1.1 when bursts are enabled'
      : undefined,
}

export default function SimulationPage() {
  const navigate = useNavigate()
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [submitError, setSubmitError] = useState(null)

  const {
    isRunning,
    progress,
    currentSimulation,
    results,
    startSimulation,
    stopSimulation,
    isLoading
  } = useSimulation()

  const { errors, validate, clearError } = useFormValidation(VALIDATION_RULES)

  const handleConfigChange = (keyOrObject, value) => {
    if (typeof keyOrObject === 'object' && keyOrObject !== null) {
      setConfig(prev => ({ ...prev, ...keyOrObject }))
    } else {
      setConfig(prev => ({ ...prev, [keyOrObject]: value }))
      clearError(keyOrObject)   // clear field error on change
    }
    setSubmitError(null)         // clear global submit error on any change
  }

  const handleStartSimulation = async () => {
    setSubmitError(null)

    // Client-side validation before hitting the API
    const isValid = validate(config)
    if (!isValid) {
      toast.error('Please fix the configuration errors before starting.')
      return
    }

    try {
      const simulationId = await startSimulation(config)
      toast.success('Simulation started successfully')
      navigate(`/results/${simulationId}`)
    } catch (error) {
      const msg = error?.message || 'Failed to start simulation'
      setSubmitError(msg)
      toast.error(msg)
    }
  }

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG)
    setSubmitError(null)
  }

  const handleExportResults = () => {
    if (!results) return

    try {
      const dataStr = JSON.stringify(results, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
      const exportFileDefaultName = `simulation-${Date.now()}.json`

      const link = document.createElement('a')
      link.setAttribute('href', dataUri)
      link.setAttribute('download', exportFileDefaultName)
      link.click()

      toast.success('Results exported successfully')
    } catch {
      toast.error('Failed to export results')
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Load Balancing Simulator
          </h1>
          <p className="text-muted-foreground">
            Test and compare different load balancing strategies
          </p>
        </div>
        <div className="flex gap-2">
          {!isRunning ? (
            <Button onClick={handleStartSimulation} disabled={isLoading}>
              <FiPlay className="mr-2 h-4 w-4" />
              {isLoading ? 'Starting…' : 'Start Simulation'}
            </Button>
          ) : (
            <Button variant="destructive" onClick={stopSimulation}>
              <FiSquare className="mr-2 h-4 w-4" />
              Stop
            </Button>
          )}
          <Button variant="outline" onClick={handleReset} disabled={isRunning}>
            <FiRefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          {results && (
            <>
              <Button variant="outline" onClick={handleExportResults}>
                <FiDownload className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="outline">
                <FiShare2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Global submit error */}
      {submitError && (
        <ErrorState
          title="Could not start simulation"
          message={submitError}
          onRetry={handleStartSimulation}
        />
      )}

      {/* Validation summary — show when there are field errors */}
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <FiAlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please fix the following errors:{' '}
            {Object.values(errors).join(' · ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Configuration Panel */}
      {isLoading && !results ? (
        <ConfigPanelSkeleton />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Simulation Configuration</CardTitle>
            <CardDescription>
              Configure the simulation parameters and load balancing strategy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-3">
              <div>
                <AlgorithmSelector
                  value={config.algorithm}
                  onChange={(value) => handleConfigChange('algorithm', value)}
                />
                <FieldError message={errors.algorithm} />
              </div>
              <div>
                <ServerConfig config={config} onChange={handleConfigChange} />
                {(errors.numServers || errors.serverCapacity) && (
                  <div className="mt-2 space-y-1">
                    <FieldError message={errors.numServers} />
                    <FieldError message={errors.serverCapacity} />
                  </div>
                )}
              </div>
              <div>
                <TrafficConfig config={config} onChange={handleConfigChange} />
                {(errors.requestRate || errors.duration || errors.burstMultiplier) && (
                  <div className="mt-2 space-y-1">
                    <FieldError message={errors.requestRate} />
                    <FieldError message={errors.duration} />
                    <FieldError message={errors.burstMultiplier} />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Simulation Control */}
      <SimulationControls
        isRunning={isRunning}
        progress={progress}
        onStart={handleStartSimulation}
        onStop={stopSimulation}
        onReset={handleReset}
        onExport={handleExportResults}
      />

      {/* Metrics Overview */}
      {results && <MetricsOverview metrics={results.metrics} />}

      {/* Charts */}
      {results && (
        <Tabs defaultValue="latency" className="space-y-4">
          <TabsList>
            <TabsTrigger value="latency">Latency</TabsTrigger>
            <TabsTrigger value="throughput">Throughput</TabsTrigger>
            <TabsTrigger value="servers">Server Load</TabsTrigger>
            <TabsTrigger value="queue">Queue Length</TabsTrigger>
          </TabsList>

          <TabsContent value="latency" className="space-y-4">
            <LatencyChart data={results} />
          </TabsContent>
          <TabsContent value="throughput" className="space-y-4">
            <ThroughputChart data={results} />
          </TabsContent>
          <TabsContent value="servers" className="space-y-4">
            <ServerLoadChart data={results} />
          </TabsContent>
          <TabsContent value="queue" className="space-y-4">
            <QueueLengthChart data={results} />
          </TabsContent>
        </Tabs>
      )}

      {/* Loading State */}
      {isLoading && !results && (
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Running simulation…</p>
          </div>
        </div>
      )}
    </div>
  )
}