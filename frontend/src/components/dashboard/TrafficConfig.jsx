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
import { Switch } from "@/components/ui/switch";
import { Activity, Clock, Zap } from "lucide-react";

export const TrafficConfig = ({ config, onChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Traffic Configuration
        </CardTitle>
        <CardDescription>Configure incoming request patterns</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Request Rate */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Request Rate (req/s)
            </Label>
            <Badge variant="outline">{config.requestRate}</Badge>
          </div>
          <Slider
            value={config.requestRate}
            onValueChange={(value) => onChange({ requestRate: value })}
            min={1}
            max={1000}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Low (1)</span>
            <span>Medium (500)</span>
            <span>High (1000)</span>
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Duration (seconds)
            </Label>
            <Badge variant="outline">{config.duration}s</Badge>
          </div>
          <Slider
            value={config.duration}
            onValueChange={(value) => onChange({ duration: value })}
            min={5}
            max={300}
            step={5}
          />
        </div>

        {/* Time Step */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Time Step (seconds)</Label>
            <Badge variant="outline">{config.timeStep || 0.1}s</Badge>
          </div>
          <Slider
            value={config.timeStep || 0.1}
            onValueChange={(value) => onChange({ timeStep: value })}
            min={0.01}
            max={1.0}
            step={0.01}
          />
          <p className="text-xs text-muted-foreground">
            Smaller values provide more accurate simulation but take longer to
            run
          </p>
        </div>

        {/* Burst Mode Toggle */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <Label>Enable Burst Traffic</Label>
            <p className="text-xs text-muted-foreground">
              Simulate sudden traffic spikes
            </p>
          </div>
          <Switch
            checked={config.enableBurst || false}
            onCheckedChange={(checked) => onChange({ enableBurst: checked })}
          />
        </div>
      </CardContent>
    </Card>
  );
};
