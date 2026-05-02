import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Server, Activity, Clock } from 'lucide-react'
import { formatPercentage } from '@/lib/utils'

export const ServerUtilizationGrid = ({ metrics }) => {
  if (!metrics || !metrics.serverUtilization) return null
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Server Utilization Details
        </CardTitle>
        <CardDescription>
          Individual server performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {metrics.serverUtilization.map((utilization, index) => {
            const status = utilization > 80 ? 'critical' : utilization > 60 ? 'warning' : 'healthy'
            const statusColors = {
              healthy: 'bg-green-500',
              warning: 'bg-yellow-500',
              critical: 'bg-red-500'
            }
            
            return (
              <div key={index} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${statusColors[status]}`} />
                    <span className="font-medium">Server {index + 1}</span>
                  </div>
                  <Badge variant={status === 'critical' ? 'destructive' : status === 'warning' ? 'warning' : 'default'}>
                    {status}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Utilization</span>
                      <span className="font-mono">{formatPercentage(utilization)}</span>
                    </div>
                    <Progress value={utilization} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 pt-2 text-sm">
                    <div>
                      <div className="text-muted-foreground">Capacity</div>
                      <div className="font-mono">{metrics.serverCapacity || 20} req/s</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Processed</div>
                      <div className="font-mono">
                        {Math.floor(metrics.completedRequests / metrics.serverUtilization.length)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Activity className="h-3 w-3" />
                    <span>Active connections: {Math.floor(utilization / 10)}</span>
                    <Clock className="ml-2 h-3 w-3" />
                    <span>Queue: {Math.floor(utilization / 20)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}