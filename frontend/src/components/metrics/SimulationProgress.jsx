import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Activity,
  Server,
  Clock,
  Zap,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { formatDuration } from "@/lib/utils";

export const SimulationProgress = ({ simulation, progress = 0, onCancel }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedRemaining, setEstimatedRemaining] = useState(0);

  useEffect(() => {
    if (!simulation) return;

    const startTime = new Date(simulation.createdAt).getTime();

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setElapsedTime(elapsed);

      if ((progress || 0) > 0) {
        const total = (elapsed / (progress || 0)) * 100;
        setEstimatedRemaining(Math.max(0, total - elapsed));
      }
    }, 100);

    return () => clearInterval(interval);
  }, [simulation, progress]);

  const config = simulation?.config || {};

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 animate-pulse" />
                Simulation in Progress
              </CardTitle>
              <CardDescription>ID: {simulation?.id}</CardDescription>
            </div>
            <Badge variant="secondary" className="animate-pulse">
              Running
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-mono">{(progress || 0).toFixed(1)}%</span>
            </div>
            <Progress value={progress || 0} className="h-3" />
          </div>

          {/* Time Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Elapsed</div>
              <div className="text-2xl font-bold font-mono">
                {formatDuration(Math.floor(elapsedTime))}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Remaining</div>
              <div className="text-2xl font-bold font-mono">
                {formatDuration(Math.floor(estimatedRemaining))}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="text-2xl font-bold font-mono">
                {formatDuration(config.duration || 0)}
              </div>
            </div>
          </div>

          {/* Simulation Details */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium">Configuration</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Algorithm</span>
                  <span className="font-medium">{config.algorithm}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Request Rate</span>
                  <span className="font-medium">
                    {config.requestRate} req/s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Servers</span>
                  <span className="font-medium">{config.numServers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Capacity</span>
                  <span className="font-medium">
                    {config.numServers * config.serverCapacity} req/s
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Live Metrics</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Server className="h-4 w-4 text-blue-500" />
                  <span className="text-muted-foreground">Active Servers:</span>
                  <span className="font-medium">{config.numServers}</span>
                  <CheckCircle2 className="ml-auto h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-muted-foreground">
                    Requests Generated:
                  </span>
                  <span className="font-medium">
                    ~{Math.floor(elapsedTime * config.requestRate)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <span className="text-muted-foreground">Time Step:</span>
                  <span className="font-medium">{config.timeStep || 0.1}s</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cancel Button */}
          <div className="flex justify-end">
            <Button variant="destructive" onClick={onCancel}>
              <XCircle className="mr-2 h-4 w-4" />
              Cancel Simulation
            </Button>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertDescription>
          Simulation is running in real-time. Results will be available once
          completed. You can safely navigate away and check back later.
        </AlertDescription>
      </Alert>
    </div>
  );
};
