import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, Clock, Repeat, Info } from "lucide-react";

export const BurstConfig = ({ config, onChange }) => {
  if (!config.enableBurst) return null;

  return (
    <Card className="border-orange-200 dark:border-orange-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
          <TrendingUp className="h-5 w-5" />
          Burst Traffic Configuration
        </CardTitle>
        <CardDescription>Configure traffic spike patterns</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Burst mode simulates realistic traffic spikes. During burst periods,
            request rate multiplies by the burst multiplier.
          </AlertDescription>
        </Alert>

        {/* Burst Multiplier */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Burst Multiplier</Label>
            <Badge variant="outline">{config.burstMultiplier || 3}x</Badge>
          </div>
          <Slider
            value={config.burstMultiplier || 3}
            onValueChange={(value) => onChange({ burstMultiplier: value })}
            min={1.5}
            max={10}
            step={0.5}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1.5x</span>
            <span>5x</span>
            <span>10x</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Peak rate during burst:{" "}
            {(config.requestRate * (config.burstMultiplier || 3)).toFixed(0)}{" "}
            req/s
          </p>
        </div>

        {/* Burst Duration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Burst Duration (seconds)
            </Label>
            <Badge variant="outline">{config.burstDuration || 5}s</Badge>
          </div>
          <Slider
            value={config.burstDuration || 5}
            onValueChange={(value) => onChange({ burstDuration: value })}
            min={1}
            max={30}
            step={1}
          />
        </div>

        {/* Burst Interval */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Repeat className="h-4 w-4" />
              Burst Interval (seconds)
            </Label>
            <Badge variant="outline">{config.burstInterval || 30}s</Badge>
          </div>
          <Slider
            value={config.burstInterval || 30}
            onValueChange={(value) => onChange({ burstInterval: value })}
            min={10}
            max={120}
            step={5}
          />
        </div>

        {/* Burst Summary */}
        <div className="rounded-lg bg-orange-50 dark:bg-orange-950 p-4 space-y-2">
          <h4 className="text-sm font-medium text-orange-800 dark:text-orange-200">
            Burst Pattern Summary
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Normal Rate:</span>
              <span className="ml-2 font-medium">
                {config.requestRate} req/s
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Burst Rate:</span>
              <span className="ml-2 font-medium text-orange-600">
                {(config.requestRate * (config.burstMultiplier || 3)).toFixed(
                  0,
                )}{" "}
                req/s
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Burst Duration:</span>
              <span className="ml-2 font-medium">
                {config.burstDuration || 5}s
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Cycle Time:</span>
              <span className="ml-2 font-medium">
                {config.burstInterval || 30}s
              </span>
            </div>
          </div>
          <div className="mt-2 h-2 bg-orange-200 dark:bg-orange-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500"
              style={{
                width: `${((config.burstDuration || 5) / (config.burstInterval || 30)) * 100}%`,
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Burst occupies{" "}
            {(
              ((config.burstDuration || 5) / (config.burstInterval || 30)) *
              100
            ).toFixed(1)}
            % of the time
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
