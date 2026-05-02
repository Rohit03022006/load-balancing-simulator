import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { simulationService } from '@/services/simulationService'
import { useSimulationStore } from '@/store/simulationStore'
import { 
  History, 
  Search, 
  MoreVertical, 
  Eye, 
  Download, 
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Play,
  Filter
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { formatLatency, formatThroughput, getStatusColor } from '@/lib/utils'
import { toast } from 'sonner'

export default function HistoryPage() {
  const navigate = useNavigate()
  const { history, addResult, setHistory } = useSimulationStore()
  const [loading, setLoading] = useState(true)
  const [simulations, setSimulations] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  
  useEffect(() => {
    loadHistory()
  }, [])
  
  const loadHistory = async () => {
    try {
      setLoading(true)
      const data = await simulationService.listSimulations({ limit: 100 })
      setSimulations(data.simulations || [])
    } catch (error) {
      toast.error('Failed to load history')
    } finally {
      setLoading(false)
    }
  }
  
  const filteredSimulations = simulations.filter(sim => {
    const matchesSearch = sim.id.includes(searchTerm) || 
                         sim.config?.algorithm?.includes(searchTerm)
    const matchesFilter = filter === 'all' || sim.status === filter
    return matchesSearch && matchesFilter
  })
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusLabel = (status) => {
    const colorMap = {
      completed: 'text-green-600 dark:text-green-400',
      running:   'text-blue-600 dark:text-blue-400',
      failed:    'text-red-600 dark:text-red-400',
      cancelled: 'text-yellow-600 dark:text-yellow-400',
    }
    return (
      <span className={`capitalize font-medium ${colorMap[status] || 'text-muted-foreground'}`}>
        {status}
      </span>
    )
  }
  
  const handleViewResults = async (simulationId) => {
    try {
      const data = await simulationService.getSimulation(simulationId)
      if (data.result) {
        addResult(data)
        navigate(`/results/${simulationId}`)
      } else {
        toast.info('Results not yet available')
      }
    } catch (error) {
      toast.error('Failed to load results')
    }
  }
  
  const handleDelete = async (simulationId) => {
    try {
      await simulationService.cancelSimulation(simulationId)
      setSimulations(sims => sims.filter(s => s.id !== simulationId))
      
      // Update global store
      if (history) {
        const updatedHistory = history.filter(h => h.id !== simulationId)
        setHistory(updatedHistory)
      }
      
      toast.success('Simulation deleted')
    } catch (error) {
      toast.error('Failed to delete simulation')
    }
  }
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <History className="h-8 w-8" />
          Simulation History
        </h1>
        <p className="text-muted-foreground">
          View and manage your past simulations
        </p>
      </div>

        {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Simulations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{simulations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {simulations.filter(s => s.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Running</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {simulations.filter(s => s.status === 'running').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {simulations.filter(s => s.status === 'failed').length}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID or algorithm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Status: {filter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilter('all')}>
                  All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('completed')}>
                  Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('running')}>
                  Running
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('failed')}>
                  Failed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
      
      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredSimulations.length === 0 ? (
            <div className="text-center py-12">
              <History className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No simulations found</h3>
              <p className="text-muted-foreground mb-4">
                Run your first simulation to see results here
              </p>
              <Button onClick={() => navigate('/simulate')}>
                <Play className="mr-2 h-4 w-4" />
                Run Simulation
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Algorithm</TableHead>
                  <TableHead>Request Rate</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSimulations.map((sim) => (
                  <TableRow key={sim.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(sim.status)}
                        {getStatusLabel(sim.status)}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {sim.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {sim.config?.algorithm || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {sim.config?.requestRate || 0} req/s
                    </TableCell>
                    <TableCell>
                      {sim.config?.duration || 0}s
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDistanceToNow(new Date(sim.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewResults(sim.id)}
                          disabled={sim.status !== 'completed'}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewResults(sim.id)}>
                              View Results
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/compare?sim=${sim.id}`)}>
                              Compare
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(sim.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
    
    </div>
  )
}