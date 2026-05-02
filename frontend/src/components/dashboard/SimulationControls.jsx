import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Save,
  Download,
  Clock,
  Activity,
} from "lucide-react";

export const SimulationControls = ({
  isRunning,
  isPaused,
  progress = 0,
  onStart,
  onPause,
  onStop,
  onReset,
  onSave,
  onExport,
  estimatedTime,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Simulation Controls
        </CardTitle>
        <CardDescription>Control simulation execution</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Badge variant={isRunning ? "success" : "secondary"}>
            {isRunning ? (isPaused ? "Paused" : "Running") : "Ready"}
          </Badge>
        </div>

        {/* Progress */}
        {isRunning && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{(progress || 0).toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progress || 0}%` }}
              />
            </div>
            {estimatedTime && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Estimated: {estimatedTime}s remaining</span>
              </div>
            )}
          </div>
        )}

        {/* Control Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {!isRunning ? (
            <Button onClick={onStart} className="col-span-2">
              <Play className="mr-2 h-4 w-4" />
              Start Simulation
            </Button>
          ) : (
            <>
              <Button onClick={onPause} variant="outline">
                {isPaused ? (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </>
                )}
              </Button>
              <Button onClick={onStop} variant="destructive">
                <Square className="mr-2 h-4 w-4" />
                Stop
              </Button>
            </>
          )}
        </div>

        {/* Additional Actions */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={onReset}
            variant="outline"
            size="sm"
            disabled={isRunning}
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            Reset
          </Button>
          <Button onClick={onSave} variant="outline" size="sm">
            <Save className="mr-1 h-3 w-3" />
            Save
          </Button>
          <Button onClick={onExport} variant="outline" size="sm">
            <Download className="mr-1 h-3 w-3" />
            Export
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
