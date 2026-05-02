import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Server, Cpu, HardDrive } from 'lucide-react'

export const ServerConfig = ({ config, onChange }) => {
  const totalCapacity = config.numServers * config.serverCapacity

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Server Configuration
        </CardTitle>
        <CardDescription>Configure the backend server pool</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Number of Servers */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              Number of Servers
            </Label>
            <Badge variant="outline">{config.numServers}</Badge>
          </div>
          <Slider
            value={config.numServers}
            onValueChange={(value) => onChange({ numServers: value })}
            min={1}
            max={50}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1</span>
            <span>25</span>
            <span>50</span>
          </div>
        </div>

        {/* Server Capacity */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              Processing Capacity (req/s)
            </Label>
            <Badge variant="outline">{config.serverCapacity}</Badge>
          </div>
          <Slider
            value={config.serverCapacity}
            onValueChange={(value) => onChange({ serverCapacity: value })}
            min={5}
            max={200}
            step={5}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Low (5)</span>
            <span>Medium (100)</span>
            <span>High (200)</span>
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-lg bg-muted p-4 space-y-3">
          <h4 className="text-sm font-medium">Pool Summary</h4>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-muted-foreground">Total Servers</div>
              <div className="text-lg font-bold">{config.numServers}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">
                Total Capacity
              </div>
              <div className="text-lg font-bold text-green-600">
                {totalCapacity} req/s
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Average Load</span>
              <span>
                {((config.requestRate / totalCapacity) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  config.requestRate / totalCapacity > 0.8
                    ? "bg-red-500"
                    : config.requestRate / totalCapacity > 0.6
                      ? "bg-yellow-500"
                      : "bg-green-500"
                }`}
                style={{
                  width: `${Math.min((config.requestRate / totalCapacity) * 100, 100)}%`,
                }}
              />
            </div>
          </div>

          {config.requestRate > totalCapacity && (
            <p className="text-xs text-red-500">
              ⚠️ Request rate exceeds total capacity. Queue buildup expected.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}